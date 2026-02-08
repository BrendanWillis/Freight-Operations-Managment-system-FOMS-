import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "../../lib/session";

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies() as any, sessionOptions);
  const user = session.user;
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (user.role !== "SHIPPER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reference, origin, destination } = await req.json();

  if (!reference || !origin || !destination) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const shipment = await prisma.shipment.create({
    data: {
      reference,
      origin,
      destination,
      createdById: user.id,
    },
  });

  return NextResponse.json({ ok: true, shipment });
}
