// Session-based authentication for single admin user
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { config } from './config';

const SESSION_COOKIE = 'rental_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function signToken(payload: string): string {
  const sig = createHmac('sha256', config.admin.sessionSecret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifyToken(token: string): string | null {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = createHmac('sha256', config.admin.sessionSecret).update(payload).digest('hex');

  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))) return null;
  } catch {
    return null;
  }

  return payload;
}

export function verifyCredentials(username: string, password: string): boolean {
  const usernameMatch = username === config.admin.username;

  // In dev with no password hash set, accept any password (but warn)
  if (!config.admin.passwordHash) {
    if (config.app.isDev) return usernameMatch;
    return false;
  }

  const inputHash = hashPassword(password);
  try {
    return usernameMatch && timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(config.admin.passwordHash)
    );
  } catch {
    return false;
  }
}

export async function createSession(): Promise<void> {
  const payload = `admin:${Date.now()}:${Math.random().toString(36).slice(2)}`;
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

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token) !== null;
}
