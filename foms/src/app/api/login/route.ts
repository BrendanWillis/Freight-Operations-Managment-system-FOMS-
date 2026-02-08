import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "../../lib/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as unknown as any, sessionOptions);
  session.user = { id: user.id, email: user.email, role: user.role };
  await session.save();

  return NextResponse.json({ ok: true, role: user.role });
}
