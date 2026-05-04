import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { amount, type, note, date, categoryId } = await req.json();

  const transaction = await prisma.transaction.update({
    where: { id, userId: session.user.id },
    data: {
      amount: parseFloat(amount),
      type,
      note,
      date: new Date(date),
      categoryId: categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json(transaction);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.transaction.delete({ where: { id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
