import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon, color } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, icon, color, userId: session.user.id },
  });

  return NextResponse.json(category, { status: 201 });
}
