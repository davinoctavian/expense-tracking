import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period"); // WEEKLY, MONTHLY, YEARLY
  const categoryId = searchParams.get("categoryId");

  const now = new Date();
  let startDate: Date | undefined;

  if (period === "WEEKLY") {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === "MONTHLY") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "YEARLY") {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(startDate ? { date: { gte: startDate } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, type, note, date, categoryId } = await req.json();

  if (!amount || !type || !date) {
    return NextResponse.json(
      { error: "Amount, type and date are required" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      note,
      date: new Date(date),
      categoryId: categoryId || null,
      userId: session.user.id,
    },
    include: { category: true },
  });

  return NextResponse.json(transaction, { status: 201 });
}
