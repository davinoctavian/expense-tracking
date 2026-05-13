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

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check duplicate — exclude current budget
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: categoryId || null,
        startDate: { lte: end },
        endDate: { gte: start },
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A budget for this category already exists in this period" },
        { status: 400 },
      );
    }

    // Calculate income in range
    const incomeInRange = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "INCOME",
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const totalIncome = incomeInRange._sum.amount ?? 0;

    if (totalIncome === 0) {
      return NextResponse.json(
        { error: "No income found in this date range." },
        { status: 400 },
      );
    }

    // Total allocated excluding current budget
    const existingBudgets = await prisma.budget.aggregate({
      where: {
        userId: session.user.id,
        startDate: { lte: end },
        endDate: { gte: start },
        NOT: { id },
      },
      _sum: { amount: true },
    });

    const totalAllocated = existingBudgets._sum.amount ?? 0;
    const remaining = totalIncome - totalAllocated;

    if (parseFloat(amount) > remaining) {
      return NextResponse.json(
        {
          error: `You can only allocate ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(remaining)} more.`,
        },
        { status: 400 },
      );
    }

    await prisma.$executeRaw`
      UPDATE "Budget"
      SET
        amount = ${parseFloat(amount)},
        period = ${period}::"PeriodType",
        "startDate" = ${start},
        "endDate" = ${end},
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
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.budget.delete({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
