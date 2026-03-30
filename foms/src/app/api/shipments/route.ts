import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "../../lib/session";

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(
    await cookies() as any,
    sessionOptions
  );
  const user = session.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (user.role !== "SHIPPER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reference, origin, destination } = await req.json();

  if (!reference || !origin || !destination) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const shipment = await prisma.shipment.create({
    data: {
      reference,
      origin,
      destination,
      shipperId: user.id,
      status: "Created",
      statusUpdates: {
        create: {
          status: "Created",
          updatedById: user.id,
        },
      },
    },
    include: {
      driver: true,
      statusUpdates: true,
      deliveryConfirmation: true,
    },
  });

  return NextResponse.json({ ok: true, shipment });
}

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies() as any,
    sessionOptions
  );
  const user = session.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (user.role === "SHIPPER") {
    const shipments = await prisma.shipment.findMany({
      where: { shipperId: user.id },
      include: {
        driver: true,
        statusUpdates: {
          orderBy: { createdAt: "asc" },
        },
        deliveryConfirmation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, shipments });
  }

  if (user.role === "ADMIN") {
    const shipments = await prisma.shipment.findMany({
      include: {
        shipper: true,
        driver: true,
        statusUpdates: {
          orderBy: { createdAt: "asc" },
        },
        deliveryConfirmation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, shipments });
  }

  if (user.role === "DRIVER") {
    const shipments = await prisma.shipment.findMany({
      where: {
        driverId: user.id,
      },
      include: {
        shipper: true,
        statusUpdates: {
          orderBy: { createdAt: "asc" },
        },
        deliveryConfirmation: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, shipments });
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}