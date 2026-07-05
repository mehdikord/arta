import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const USER_SESSION_COOKIE = "user_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface UserSessionPayload {
  userId: string;
  name: string;
  mobile: string;
}

function getSecret() {
  const secret = process.env.USER_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("USER_SESSION_SECRET is required in production");
  }
  return new TextEncoder().encode(
    secret ?? "arta-user-dev-secret-change-in-production",
  );
}

export async function createUserSessionToken(
  payload: UserSessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyUserSessionToken(
  token: string,
): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { userId, name, mobile } = payload;
    if (
      typeof userId !== "string" ||
      typeof name !== "string" ||
      typeof mobile !== "string"
    ) {
      return null;
    }
    return { userId, name, mobile };
  } catch {
    return null;
  }
}

export async function setUserSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearUserSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getUserSessionFromCookie(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyUserSessionToken(token);
}
