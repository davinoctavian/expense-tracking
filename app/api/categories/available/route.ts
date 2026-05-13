import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type BudgetWithCategory = {
  id: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date)
      return NextResponse.json({ error: "Date is required" }, { status: 400 });

    const transactionDate = new Date(date);

    // Find budgets that cover this date
    const budgets = (await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        startDate: { lte: transactionDate },
        endDate: { gte: transactionDate },
      },
      include: { category: true },
    })) as BudgetWithCategory[];

    // Get category IDs that have budgets
    const budgetCategoryIds = budgets
      .filter((b) => b.categoryId !== null)
      .map((b) => b.categoryId as string);

    // Check if general budget (no category) exists
    const hasGeneralBudget = budgets.some((b) => b.categoryId === null);

    // Get all user categories
    const allCategories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });

    // Only return categories that have a budget
    const availableCategories = allCategories.filter((c) =>
      budgetCategoryIds.includes(c.id),
    );

    return NextResponse.json({
      categories: availableCategories,
      hasGeneralBudget,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
