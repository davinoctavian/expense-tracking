import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { startDate: "desc" },
    });

    // Calculate spent for each budget based on its own date range
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: session.user.id,
            type: "EXPENSE",
            date: { gte: budget.startDate, lte: budget.endDate },
            ...(budget.categoryId
              ? { categoryId: budget.categoryId }
              : { categoryId: null }),
          },
          _sum: { amount: true },
        });

        return {
          ...budget,
          spent: spent._sum.amount ?? 0,
        };
      }),
    );

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, period, startDate, endDate, categoryId } = await req.json();

    if (!amount || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Amount, period and dates are required" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check duplicate budget for same category + period
    const existing = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: categoryId || null,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A budget for this category already exists in this period" },
        { status: 400 },
      );
    }

    // Calculate total income within date range
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
        {
          error:
            "No income found in this date range. Add income first before creating a budget.",
        },
        { status: 400 },
      );
    }

    // Calculate total existing budgets in same date range
    const existingBudgets = await prisma.budget.aggregate({
      where: {
        userId: session.user.id,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      _sum: { amount: true },
    });

    const totalAllocated = existingBudgets._sum.amount ?? 0;
    const remaining = totalIncome - totalAllocated;

    if (parseFloat(amount) > remaining) {
      return NextResponse.json(
        {
          error: `You can only allocate ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(remaining)} more. Total income: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalIncome)}, already allocated: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalAllocated)}.`,
        },
        { status: 400 },
      );
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        period,
        startDate: start,
        endDate: end,
        userId: session.user.id,
        categoryId: categoryId || null,
      },
    });

    const result = await prisma.budget.findUnique({
      where: { id: budget.id },
      include: { category: true },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
