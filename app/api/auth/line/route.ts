// Initiate LINE Login OAuth2 flow
import { NextResponse } from 'next/server';
import { createOAuthState } from '@/lib/auth';
import { config } from '@/lib/config';

export async function GET() {
  if (!config.lineLogin.channelId) {
    return NextResponse.json(
      { error: 'LINE Login is not configured. Set LINE_LOGIN_CHANNEL_ID in environment variables.' },
      { status: 503 }
    );
  }

  const state = await createOAuthState();
  const callbackUrl = `${config.app.url}/api/auth/line/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.lineLogin.channelId,
    redirect_uri: callbackUrl,
    state,
    scope: 'profile',
  });

  return NextResponse.redirect(
    `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`
  );
}
