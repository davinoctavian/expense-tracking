import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, period, startDate, endDate, categoryId } = await req.json();

  if (!amount || !period || !startDate || !endDate || !categoryId) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  const budget = await prisma.budget.create({
    data: {
      amount: parseFloat(amount),
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      categoryId,
      userId: session.user.id,
    },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}
