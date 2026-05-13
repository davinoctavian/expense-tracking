import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const excludeId = searchParams.get("excludeId") || null;

    if (!startDate || !endDate)
      return NextResponse.json({ error: "Dates required" }, { status: 400 });

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [incomeResult, budgetResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "INCOME",
          date: { gte: start, lte: end },
        },
        _sum: { amount: true },
      }),
      prisma.budget.aggregate({
        where: {
          userId: session.user.id,
          startDate: { lte: end },
          endDate: { gte: start },
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        _sum: { amount: true },
      }),
    ]);

    const income = incomeResult._sum.amount ?? 0;
    const allocated = budgetResult._sum.amount ?? 0;
    const remaining = income - allocated;

    return NextResponse.json({ income, allocated, remaining });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
