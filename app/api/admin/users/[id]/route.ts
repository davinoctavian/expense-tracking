import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const isSuperAdmin = (username?: string | null) =>
  username === process.env.SUPER_ADMIN_USERNAME;

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.username))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Delete all user data in order (respect foreign keys)
  await prisma.transaction.deleteMany({ where: { userId: id } });
  await prisma.budget.deleteMany({ where: { userId: id } });
  await prisma.category.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
