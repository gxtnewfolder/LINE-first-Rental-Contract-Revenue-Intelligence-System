import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

const LINE_API  = 'https://api.line.me/v2/bot';
const LINE_DATA = 'https://api-data.line.me/v2/bot';

function authHeader() {
  return { Authorization: `Bearer ${config.line.channelAccessToken}` };
}

// GET — check if a default rich menu is set
export async function GET() {
  const token = config.line.channelAccessToken;
  if (!token) return NextResponse.json({ richMenuId: null });

  const res = await fetch(`${LINE_API}/user/all/richmenu`, {
    headers: authHeader(),
  });

  if (!res.ok) return NextResponse.json({ richMenuId: null });
  const data = await res.json();
  return NextResponse.json({ richMenuId: data.richMenuId ?? null });
}

// POST — create rich menu, upload image (PNG), set as default
export async function POST(request: Request) {
  const token = config.line.channelAccessToken;
  if (!token) {
    return NextResponse.json({ error: 'LINE_CHANNEL_ACCESS_TOKEN ยังไม่ได้ตั้งค่า' }, { status: 400 });
  }

  // Get PNG image from form data
  const formData = await request.formData();
  const imageFile = formData.get('image') as File | null;
  if (!imageFile) {
    return NextResponse.json({ error: 'ไม่ได้รับไฟล์รูปภาพ' }, { status: 400 });
  }
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

  // 1. Create rich menu structure
  const richMenuBody = {
    size: { width: 2500, height: 843 },
    selected: true,
    name: 'uSabai Menu',
    chatBarText: '📋 เมนูหลัก',
    areas: [
      {
        bounds: { x: 0,    y: 0,   width: 1250, height: 421 },
        action: { type: 'message', label: 'รายได้เดือนนี้', text: 'รายได้เดือนนี้' },
      },
      {
        bounds: { x: 1250, y: 0,   width: 1250, height: 421 },
        action: { type: 'message', label: 'ห้องว่าง', text: 'ห้องว่าง' },
      },
      {
        bounds: { x: 0,    y: 422, width: 1250, height: 421 },
        action: { type: 'message', label: 'สรุป AI', text: 'สรุป' },
      },
      {
        bounds: { x: 1250, y: 422, width: 1250, height: 421 },
        action: { type: 'message', label: 'แนะนำ', text: 'แนะนำ' },
      },
    ],
  };

  const createRes = await fetch(`${LINE_API}/richmenu`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(richMenuBody),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('Rich menu create failed:', err);
    return NextResponse.json({ error: 'สร้าง rich menu ไม่สำเร็จ: ' + err }, { status: 502 });
  }

  const { richMenuId } = await createRes.json();

  // 2. Upload image
  const uploadRes = await fetch(`${LINE_DATA}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'image/png' },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('Rich menu image upload failed:', err);
    return NextResponse.json({ error: 'อัพโหลดรูปไม่สำเร็จ: ' + err }, { status: 502 });
  }

  // 3. Set as default for all users
  const setRes = await fetch(`${LINE_API}/user/all/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: authHeader(),
  });

  if (!setRes.ok) {
    const err = await setRes.text();
    console.error('Set default rich menu failed:', err);
    return NextResponse.json({ error: 'ตั้งค่า default ไม่สำเร็จ: ' + err }, { status: 502 });
  }

  return NextResponse.json({ success: true, richMenuId });
}

// DELETE — remove the default rich menu
export async function DELETE() {
  const token = config.line.channelAccessToken;
  if (!token) return NextResponse.json({ error: 'ไม่มี token' }, { status: 400 });

  // Get current default
  const getRes = await fetch(`${LINE_API}/user/all/richmenu`, { headers: authHeader() });
  if (!getRes.ok) return NextResponse.json({ error: 'ไม่มี rich menu ที่ตั้งค่าอยู่' }, { status: 404 });

  const { richMenuId } = await getRes.json();
  if (!richMenuId) return NextResponse.json({ error: 'ไม่มี rich menu ที่ตั้งค่าอยู่' }, { status: 404 });

  // Unlink from all users
  await fetch(`${LINE_API}/user/all/richmenu`, {
    method: 'DELETE',
    headers: authHeader(),
  });

  // Delete rich menu
  await fetch(`${LINE_API}/richmenu/${richMenuId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });

  return NextResponse.json({ success: true });
}
