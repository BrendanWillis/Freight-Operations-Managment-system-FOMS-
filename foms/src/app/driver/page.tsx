import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Created":
      return "bg-secondary";
    case "Assigned":
      return "bg-warning text-dark";
    case "In Transit":
      return "bg-primary";
    case "Delivered":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}

async function updateDriverShipmentStatus(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));
  const status = String(formData.get("status") ?? "").trim();

  if (!shipmentId || !["In Transit", "Delivered"].includes(status)) {
    redirect("/driver");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      driverId: user.id,
      status: {
        in: ["Assigned", "In Transit"],
      },
    },
    include: {
      deliveryConfirmation: true,
    },
  });

  if (!shipment) {
    redirect("/driver");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      statusUpdates: {
        create: {
          status,
          updatedById: user.id,
        },
      },
      ...(status === "Delivered" && !shipment.deliveryConfirmation
        ? {
            deliveryConfirmation: {
              create: {
                note: "Delivered by assigned driver",
              },
            },
          }
        : {}),
    },
  });

  redirect("/driver");
}

export default async function DriverPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/");

  const shipments = await prisma.shipment.findMany({
    where: {
      driverId: user.id,
      status: {
        in: ["Assigned", "In Transit"],
      },
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

  const totalVisibleCount = shipments.length;
  const assignedCount = shipments.filter((s) => s.status === "Assigned").length;
  const inTransitCount = shipments.filter((s) => s.status === "In Transit").length;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            FOMS
          </a>

          <div className="ms-auto d-flex gap-2">
            <a className="btn btn-outline-light btn-sm" href="/">
              Home
            </a>
            <a className="btn btn-outline-light btn-sm" href="/shipper">
              Shipper
            </a>
            <a className="btn btn-outline-light btn-sm" href="/admin">
              Admin
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h4 mb-1">Driver Dashboard</h1>
            <div className="text-muted small">
              Logged in as: {user.email} ({user.role})
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-xl">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Total Visible</div>
                <div className="fs-4 fw-bold">{totalVisibleCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-xl">
            <div className="card h-100 border-warning">
              <div className="card-body">
                <div className="text-muted small">Assigned</div>
                <div className="fs-4 fw-bold text-warning">{assignedCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-xl">
            <div className="card h-100 border-primary">
              <div className="card-body">
                <div className="text-muted small">In Transit</div>
                <div className="fs-4 fw-bold text-primary">{inTransitCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h6 mb-0">My Assigned Shipments</h2>
              <span className="badge bg-secondary">{shipments.length} total</span>
            </div>

            {shipments.length === 0 ? (
              <p className="text-muted mt-3 mb-0">
                No assigned shipments right now.
              </p>
            ) : (
              <div className="mt-3">
                {shipments.map((s) => (
                  <div key={s.id} className="border rounded p-3 mb-3">
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                      <div>
                        <div className="fw-semibold">
                          #{s.id} - {s.reference}
                        </div>
                        <div className="text-muted small">
                          {s.origin} → {s.destination}
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${getStatusBadgeClass(s.status)}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>

                    <div className="row g-2 small mb-3">
                      <div className="col-12 col-md-4">
                        <strong>Shipper:</strong>{" "}
                        {s.shipper?.email ?? "Unknown"}
                      </div>
                      <div className="col-12 col-md-4">
                        <strong>Created:</strong>{" "}
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <div className="col-12 col-md-4">
                        {s.deliveryConfirmation ? (
                          <span className="text-success">
                            <strong>Delivery Confirmed:</strong>{" "}
                            {new Date(
                              s.deliveryConfirmation.confirmedAt
                            ).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted">
                            No delivery confirmation yet
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      {s.status === "Assigned" ? (
                        <form action={updateDriverShipmentStatus}>
                          <input type="hidden" name="shipmentId" value={s.id} />
                          <input type="hidden" name="status" value="In Transit" />
                          <button
                            type="submit"
                            className="btn btn-sm btn-outline-primary"
                          >
                            Start Transit
                          </button>
                        </form>
                      ) : null}

                      {s.status === "In Transit" ? (
                        <form action={updateDriverShipmentStatus}>
                          <input type="hidden" name="shipmentId" value={s.id} />
                          <input type="hidden" name="status" value="Delivered" />
                          <button
                            type="submit"
                            className="btn btn-sm btn-outline-success"
                          >
                            Mark Delivered
                          </button>
                        </form>
                      ) : null}
                    </div>

                    <div className="small">
                      <strong>Status History</strong>
                      {s.statusUpdates.length === 0 ? (
                        <p className="text-muted mb-0 mt-1">
                          No status updates recorded.
                        </p>
                      ) : (
                        <ul className="mb-0 mt-1">
                          {s.statusUpdates.map((update) => (
                            <li key={update.id}>
                              {update.status} -{" "}
                              {new Date(update.createdAt).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}