import type { NextRequest } from "next/server";

/**
 * Proxy-aware same-origin check for the admin raw-body endpoints (uploads).
 *
 * The browser's `Origin` header carries the public origin the user is on
 * (e.g. `https://arta.example.com`). `request.nextUrl.origin`, however, is
 * computed from what the Node process itself sees — behind a reverse proxy
 * (Apache → PM2) that is the internal target (e.g. `http://127.0.0.1:3000`
 * or the app's own bind host), so a naive comparison rejects every upload
 * on the server with 403 while local development works.
 *
 * `getExpectedOrigin` therefore reconstructs the public origin with this
 * priority:
 *   1. `APP_PUBLIC_ORIGIN` — operator-set trusted public origin (most
 *      reliable; cannot be spoofed by the client).
 *   2. `X-Forwarded-Proto` + `X-Forwarded-Host` — forwarded by a properly
 *      configured reverse proxy (first value in the proxy chain).
 *   3. `request.nextUrl.origin` — direct connection (local development).
 *
 * Security note: the primary CSRF gate is the admin session cookie
 * (`httpOnly`, `Secure` in production, `SameSite=Lax`); this origin check
 * is defense-in-depth. When the proxy does not overwrite `X-Forwarded-*`,
 * a client can set them itself — set `APP_PUBLIC_ORIGIN` on the server for
 * strict, spoof-resistant validation.
 */

/** Env var holding the public origin, e.g. `https://arta.example.com`. */
export const PUBLIC_ORIGIN_ENV = "APP_PUBLIC_ORIGIN";

/** First (client-most) value of a comma-separated `X-Forwarded-*` header. */
function firstForwarded(header: string | null): string | null {
  if (!header) return null;
  const first = header.split(",")[0]?.trim().toLowerCase();
  return first || null;
}

/** The public origin the incoming request is expected to originate from. */
export function getExpectedOrigin(request: NextRequest): string {
  const configured = process.env[PUBLIC_ORIGIN_ENV];
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
    } catch {
      // Malformed value — fall back to proxy headers.
    }
  }

  const forwardedHost = firstForwarded(request.headers.get("x-forwarded-host"));
  if (forwardedHost) {
    const forwardedProto = firstForwarded(
      request.headers.get("x-forwarded-proto"),
    );
    const protocol =
      forwardedProto === "https" || forwardedProto === "http"
        ? forwardedProto
        : (request.nextUrl.protocol || "http:").replace(/:$/, "");
    return `${protocol}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

/**
 * Pass the same-origin guard when the request has no `Origin` header
 * (non-browser clients — still gated by the admin session check) or when
 * its `Origin` matches the expected public origin (or the direct
 * `request.nextUrl.origin` when no proxy forwarded host/protocol info).
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return (
    origin === getExpectedOrigin(request) || origin === request.nextUrl.origin
  );
}
