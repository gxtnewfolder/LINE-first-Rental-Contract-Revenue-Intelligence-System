// Verify LIFF ID token and create session
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth';
import { config } from '@/lib/config';

type LineVerifyResponse = {
  iss: string;
  sub: string; // LINE userId
  name: string;
  picture?: string;
  exp: number;
};

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json() as { idToken?: string };

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Verify LIFF ID token with LINE API
    const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: config.lineLogin.channelId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[LIFF] Token verification failed:', text);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const profile = await res.json() as LineVerifyResponse;

    if (!config.line.ownerLineIds.includes(profile.sub)) {
      console.log(`[LIFF] Unauthorized userId: ${profile.sub} (${profile.name})`);
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    await createSession({
      lineUserId: profile.sub,
      displayName: profile.name,
      pictureUrl: profile.picture,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[LIFF] Auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
