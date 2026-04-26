// Session management for LINE Login OAuth
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { config } from './config';

const SESSION_COOKIE = 'rental_session';
const STATE_COOKIE = 'line_oauth_state';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  ownerId: string;
  plan: 'LITE' | 'PRO';
};

function signToken(payload: string): string {
  const sig = createHmac('sha256', config.lineLogin.sessionSecret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): string | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = createHmac('sha256', config.lineLogin.sessionSecret).update(payload).digest('hex');

  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) return null;
  } catch {
    return null;
  }

  return payload;
}

export async function createSession(user: SessionUser): Promise<void> {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const token = signToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: !config.app.isDev,
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionUser;
    return user;
  } catch {
    return null;
  }
}

// OAuth state helpers (CSRF protection)
export async function createOAuthState(): Promise<string> {
  const state = randomBytes(16).toString('hex');
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: !config.app.isDev,
    sameSite: 'lax',
    maxAge: 300, // 5 minutes
    path: '/',
  });
  return state;
}

export async function verifyOAuthState(state: string): Promise<boolean> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  if (!stored) return false;
  try {
    return timingSafeEqual(Buffer.from(state), Buffer.from(stored));
  } catch {
    return false;
  }
}
