import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { amount, period, startDate, endDate, categoryId } = await req.json();

    await prisma.$executeRaw`
      UPDATE "Budget"
      SET
        amount = ${parseFloat(amount)},
        period = ${period}::"PeriodType",
        "startDate" = ${new Date(startDate)},
        "endDate" = ${new Date(endDate)},
        "categoryId" = ${categoryId || null}
      WHERE id = ${id} AND "userId" = ${session.user.id}
    `;

    const result = await prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/budgets error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.budget.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
