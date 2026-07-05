"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { teamMemberSchema } from "@/lib/validations/admin/team";

export async function getTeamMembersAction() {
  await requireAdmin();
  return prisma.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTeamMemberAction(id: string) {
  await requireAdmin();
  return prisma.teamMember.findUnique({ where: { id } });
}

export async function saveTeamMemberAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = teamMemberSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.teamMember.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.teamMember.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/about");
  revalidatePath("/admins/team");
  return actionSuccess({ id: id! });
}

export async function deleteTeamMemberAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/about");
  revalidatePath("/admins/team");
  return actionSuccess(undefined);
}
