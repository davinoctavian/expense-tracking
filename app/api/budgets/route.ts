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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("GET /api/budgets error:", error);
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

    // Use raw SQL to bypass Prisma 7 relation requirement bug
    const id = `budget_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await prisma.$executeRaw`
      INSERT INTO "Budget" (id, amount, period, "startDate", "endDate", "categoryId", "userId", "createdAt")
      VALUES (
        ${id},
        ${parseFloat(amount)},
        ${period}::"PeriodType",
        ${new Date(startDate)},
        ${new Date(endDate)},
        ${categoryId || null},
        ${session.user.id},
        NOW()
      )
    `;

    const result = await prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/budgets error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
