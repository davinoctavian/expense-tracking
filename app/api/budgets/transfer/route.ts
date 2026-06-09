import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      sourceBudgetId,
      targetBudgetId,
      // for creating new budget
      newBudget,
    } = await req.json();

    if (!sourceBudgetId)
      return NextResponse.json(
        { error: "Source budget is required" },
        { status: 400 },
      );

    // Get source budget
    const source = await prisma.budget.findUnique({
      where: { id: sourceBudgetId, userId: session.user.id },
      include: { category: true },
    });

    if (!source)
      return NextResponse.json(
        { error: "Source budget not found" },
        { status: 404 },
      );

    // Must be ended
    const now = new Date();
    if (new Date(source.endDate) > now)
      return NextResponse.json(
        { error: "Budget has not ended yet" },
        { status: 400 },
      );

    // Calculate surplus
    const spent = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: source.startDate, lte: source.endDate },
        ...(source.categoryId
          ? { categoryId: source.categoryId }
          : { categoryId: null }),
      },
      _sum: { amount: true },
    });

    const totalSpent = spent._sum.amount ?? 0;
    const surplus = source.amount + source.surplus - totalSpent;

    if (surplus <= 0)
      return NextResponse.json(
        { error: "No surplus to transfer" },
        { status: 400 },
      );

    let targetId = targetBudgetId;

    if (!targetId && newBudget) {
      // Validate income in new budget range
      const start = new Date(newBudget.startDate);
      const end = new Date(newBudget.endDate);

      const incomeInRange = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "INCOME",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      });

      const totalIncome = incomeInRange._sum.amount ?? 0;

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

      if (parseFloat(newBudget.amount) > remaining) {
        return NextResponse.json(
          {
            error: `Only ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(remaining)} available to allocate`,
          },
          { status: 400 },
        );
      }

      // Create new budget
      const created = await prisma.budget.create({
        data: {
          amount: parseFloat(newBudget.amount),
          period: newBudget.period,
          startDate: start,
          endDate: end,
          userId: session.user.id,
          categoryId: newBudget.categoryId || null,
          surplus,
          transferredFrom: sourceBudgetId,
        },
      });

      targetId = created.id;
    } else if (targetId) {
      // Add surplus to existing budget
      await prisma.budget.update({
        where: { id: targetId, userId: session.user.id },
        data: {
          surplus: { increment: surplus },
          transferredFrom: sourceBudgetId,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Target budget or new budget data required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, surplus, targetId });
  } catch (error) {
    console.error("POST /api/budgets/transfer error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
