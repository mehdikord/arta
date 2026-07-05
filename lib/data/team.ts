import { prisma } from "@/lib/prisma";
import { mapTeamMember } from "./mappers";

export async function getTeamMembers() {
  const rows = await prisma.teamMember.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapTeamMember);
}

export async function getManagementTeam() {
  const rows = await prisma.teamMember.findMany({
    where: { isManagement: true, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapTeamMember);
}

export async function getStaffTeam() {
  const rows = await prisma.teamMember.findMany({
    where: { isManagement: false, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapTeamMember);
}
