import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const [transactions, categories, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      summary: {
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalCategories: categories.length,
        totalBudgets: budgets.length,
      },
      transactions,
      categories,
      budgets,
    });
  } catch (error) {
    console.error("GET /api/summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
