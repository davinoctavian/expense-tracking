import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const isSuperAdmin = (username?: string | null) =>
  username === process.env.SUPER_ADMIN_USERNAME;

export async function GET() {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.username))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true,
          categories: true,
          budgets: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
