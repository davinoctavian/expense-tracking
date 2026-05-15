import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const isSuperAdmin = (username?: string | null) =>
  username === process.env.SUPER_ADMIN_USERNAME;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.username))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const [transactions, categories, budgets, user] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: id },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where: { userId: id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.budget.findMany({
      where: { userId: id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, username: true, createdAt: true },
    }),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    user,
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
}
