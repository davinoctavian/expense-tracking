import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true },
  });

  return NextResponse.json({ theme: user?.theme ?? "light" });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { theme } = await req.json();

  if (!["light", "dark"].includes(theme))
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { theme },
  });

  return NextResponse.json({ theme });
}
