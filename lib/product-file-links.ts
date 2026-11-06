import { SignJWT, jwtVerify } from "jose";

/** Default expiry of signed download links (hours). */
const DEFAULT_LINK_TTL_HOURS = 4;

export interface ProductFileDownloadLinkPayload {
  userId: string;
  productId: string;
  fileId: string;
}

export interface ProductFileDownloadLink {
  url: string;
  /** ISO timestamp at which the link stops working. */
  expiresAt: string;
}

function getLinkTtlHours(): number {
  const configured = Number(process.env.PRODUCT_FILE_LINK_TTL_HOURS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return DEFAULT_LINK_TTL_HOURS;
}

function getSecret() {
  const secret =
    process.env.PRODUCT_FILE_LINK_SECRET ??
    process.env.USER_SESSION_SECRET ??
    process.env.ADMIN_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("PRODUCT_FILE_LINK_SECRET is required in production");
  }
  return new TextEncoder().encode(
    secret ?? "arta-product-file-link-dev-secret-change-in-production",
  );
}

/**
 * Create a user-bound, time-limited download link for a product file.
 * The token is only valid until expiry and is bound to the exact
 * (user, product, file) triple, so it cannot be used to reach any
 * other file or shared.
 */
export async function createProductFileDownloadLink(
  payload: ProductFileDownloadLinkPayload,
): Promise<ProductFileDownloadLink> {
  const ttlHours = getLinkTtlHours();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const token = await new SignJWT(
    { userId: payload.userId, productId: payload.productId, fileId: payload.fileId },
  )
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  const url =
    `/api/products/${payload.productId}/files/${payload.fileId}/download` +
    `?token=${encodeURIComponent(token)}`;

  return { url, expiresAt: expiresAt.toISOString() };
}

export async function verifyProductFileDownloadToken(
  token: string,
): Promise<ProductFileDownloadLinkPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { userId, productId, fileId } = payload;
    if (
      typeof userId !== "string" ||
      typeof productId !== "string" ||
      typeof fileId !== "string"
    ) {
      return null;
    }
    return { userId, productId, fileId };
  } catch {
    // Invalid signature or expired token.
    return null;
  }
}
