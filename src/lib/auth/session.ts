import "server-only";

import { cookies } from "next/headers";

import { sign, safeEqual } from "./signing";

export const SESSION_COOKIE = "femi_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  sub: string;
  exp: number;
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!payload.sub || payload.exp * 1000 < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
