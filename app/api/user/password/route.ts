import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword)
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );

    if (newPassword.length < 8)
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 },
      );

    if (newPassword !== confirmPassword)
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch)
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/user/password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
