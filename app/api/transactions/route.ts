import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined;

  if (startDate && endDate) {
    // Custom date range
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include full end day
  } else if (period === "WEEKLY") {
    start = new Date(now);
    start.setDate(now.getDate() - 7);
  } else if (period === "MONTHLY") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === "YEARLY") {
    start = new Date(now.getFullYear(), 0, 1);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(start ? { date: { gte: start, ...(end ? { lte: end } : {}) } } : {}),
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
