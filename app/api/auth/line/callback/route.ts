// Handle LINE Login OAuth2 callback
import { NextResponse } from 'next/server';
import { createSession, verifyOAuthState } from '@/lib/auth';
import { upsertOwner } from '@/lib/owner';
import { config } from '@/lib/config';

type LineTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type LineProfileResponse = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

async function exchangeCodeForToken(code: string): Promise<LineTokenResponse> {
  const callbackUrl = `${config.app.url}/api/auth/line/callback`;

  const res = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: config.lineLogin.channelId,
      client_secret: config.lineLogin.channelSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json();
}

async function getLineProfile(accessToken: string): Promise<LineProfileResponse> {
  const res = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch LINE profile');
  }

  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // User cancelled or LINE returned error
  if (errorParam) {
    return NextResponse.redirect(new URL('/login?error=cancelled', config.app.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=invalid_request', config.app.url));
  }

  // Verify CSRF state
  const stateValid = await verifyOAuthState(state);
  if (!stateValid) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', config.app.url));
  }

  try {
    const token = await exchangeCodeForToken(code);
    const profile = await getLineProfile(token.access_token);

    // Check if this LINE user is an authorized owner
    if (!config.line.ownerLineIds.includes(profile.userId)) {
      console.log(`[LINE Login] Unauthorized userId: ${profile.userId} (${profile.displayName}) — add to OWNER_LINE_IDS`);
      return NextResponse.redirect(new URL('/login?error=unauthorized', config.app.url));
    }

    const owner = await upsertOwner(profile.userId, profile.displayName, profile.pictureUrl);

    await createSession({
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      ownerId: owner.id,
      plan: owner.plan,
    });

    return NextResponse.redirect(new URL('/', config.app.url));
  } catch (err) {
    console.error('LINE Login callback error:', err);
    return NextResponse.redirect(new URL('/login?error=server_error', config.app.url));
  }
}
