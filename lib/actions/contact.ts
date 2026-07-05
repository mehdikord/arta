"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { contactSchema } from "@/lib/validations/contact";

export async function submitContactFormAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      subject: parsed.data.subject,
      message: parsed.data.message ?? null,
    },
  });

  revalidatePath("/admins/contacts");
  revalidatePath("/admins/dashboard");
  return actionSuccess(undefined);
}
