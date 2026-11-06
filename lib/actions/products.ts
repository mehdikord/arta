"use server";

import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { getUserSessionFromCookie } from "@/lib/user/session";
import { createProductFileDownloadLink } from "@/lib/product-file-links";

/**
 * Build a user-specific, time-limited download link for one file of a
 * product. Only available to users with a COMPLETED purchase of the
 * product; the returned link is bound to this user and expires after
 * the configured TTL (default 4 hours).
 */
export async function getProductFileDownloadLinkAction(
  productId: string,
  fileId: string,
): Promise<ActionResult<{ url: string; expiresAt: string }>> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً ابتدا وارد شوید");

  const [product, file, user, purchase] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, deletedAt: null, isPublished: true },
    }),
    prisma.productFile.findFirst({ where: { id: fileId, productId } }),
    prisma.user.findFirst({
      where: { id: session.userId, deletedAt: null },
    }),
    prisma.purchase.findFirst({
      where: {
        userId: session.userId,
        productId,
        status: "COMPLETED",
      },
    }),
  ]);

  if (!product || !user) return actionError("پکیج در دسترس نیست");
  if (!file) return actionError("فایل یافت نشد");
  if (!purchase) {
    return actionError("شما هنوز به این پکیج دسترسی ندارید");
  }

  const link = await createProductFileDownloadLink({
    userId: session.userId,
    productId,
    fileId,
  });

  return actionSuccess({ url: link.url, expiresAt: link.expiresAt });
}
