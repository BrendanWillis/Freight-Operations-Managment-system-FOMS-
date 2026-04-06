import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    orderBy: [
      { role: "asc" },
      { email: "asc" },
    ],
    select: {
      email: true,
      role: true,
    },
  });

  const quickUsers = users.map((user) => ({
    label: user.email.split("@")[0],
    email: user.email,
    password:
      user.email === "admin@foms.com" ||
      user.email === "shipper@foms.com" ||
      user.email === "driver@foms.com"
        ? "Password123!"
        : "password123",
    role: user.role,
  }));

  return NextResponse.json({ users: quickUsers });
}