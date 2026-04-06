import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";
import AutoRefresh from "../components/AutoRefresh";

const STATUS_OPTIONS = ["Created", "Assigned", "In Transit", "Delivered"];

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

async function createShipment(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/");

  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();

  if (!origin || !destination) {
    redirect("/shipper");
  }

  // ✅ NEW: Generate reference automatically
  const lastShipment = await prisma.shipment.findFirst({
    orderBy: { id: "desc" },
  });

  const nextId = (lastShipment?.id ?? 1000) + 1;
  const reference = `FOMS-${nextId}`;

  await prisma.shipment.create({
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
  });

  redirect("/shipper");
}

async function updateShipmentStatus(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));
  const status = String(formData.get("status") ?? "").trim();

  if (!shipmentId || !STATUS_OPTIONS.includes(status)) {
    redirect("/shipper");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      shipperId: user.id,
    },
    include: {
      deliveryConfirmation: true,
    },
  });

  if (!shipment) {
    redirect("/shipper");
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
                note: "Marked delivered from shipper dashboard",
              },
            },
          }
        : {}),
    },
  });

  redirect("/shipper");
}

async function deleteShipment(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));

  if (!shipmentId) {
    redirect("/shipper");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      shipperId: user.id,
    },
  });

  if (!shipment) {
    redirect("/shipper");
  }

  await prisma.shipment.delete({
    where: { id: shipmentId },
  });

  redirect("/shipper");
}

export default async function ShipperPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/");

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

  const totalCount = shipments.length;
  const createdCount = shipments.filter(
    (shipment) => shipment.status === "Created"
  ).length;
  const assignedCount = shipments.filter(
    (shipment) => shipment.status === "Assigned"
  ).length;
  const inTransitCount = shipments.filter(
    (shipment) => shipment.status === "In Transit"
  ).length;
  const deliveredCount = shipments.filter(
    (shipment) => shipment.status === "Delivered"
  ).length;

  return (
    <>
      <AutoRefresh intervalMs={5000} />

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            FOMS
          </a>

          <div className="ms-auto d-flex gap-2">
            <a className="btn btn-outline-light btn-sm" href="/">
              Home
            </a>
            <a className="btn btn-outline-light btn-sm" href="/admin">
              Admin
            </a>
            <a className="btn btn-outline-light btn-sm" href="/driver">
              Driver
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="text-muted small mb-2">
          Auto-refreshing every 5 seconds
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h4 mb-1">Shipper Dashboard</h1>
            <div className="text-muted small">
              Logged in as: {user.email} ({user.role})
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Total Shipments</div>
                <div className="fs-4 fw-bold">{totalCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <div className="card h-100 border-secondary">
              <div className="card-body">
                <div className="text-muted small">Created</div>
                <div className="fs-4 fw-bold text-secondary">
                  {createdCount}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4">
            <div className="card h-100 border-warning">
              <div className="card-body">
                <div className="text-muted small">Assigned</div>
                <div className="fs-4 fw-bold text-warning">
                  {assignedCount}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6">
            <div className="card h-100 border-primary">
              <div className="card-body">
                <div className="text-muted small">In Transit</div>
                <div className="fs-4 fw-bold text-primary">
                  {inTransitCount}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-6">
            <div className="card h-100 border-success">
              <div className="card-body">
                <div className="text-muted small">Delivered</div>
                <div className="fs-4 fw-bold text-success">
                  {deliveredCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <div className="card">
              <div className="card-body">
                <h2 className="h6">Create Shipment</h2>

                <form action={createShipment} className="row g-3">
                  {/* ❌ Reference removed */}

                  <div className="col-12">
                    <label className="form-label">Origin</label>
                    <input
                      name="origin"
                      className="form-control"
                      placeholder="Spanish Fork, UT"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Destination</label>
                    <input
                      name="destination"
                      className="form-control"
                      placeholder="Rexburg, ID"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7">
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <h2 className="h6 mb-0">My Shipments</h2>
                  <span className="badge bg-secondary">
                    {shipments.length} total
                  </span>
                </div>

                {shipments.length === 0 ? (
                  <p className="text-muted mt-3 mb-0">No shipments yet.</p>
                ) : (
                  <div className="mt-3">
                    {shipments.map((shipment) => (
                      <div key={shipment.id} className="border rounded p-3 mb-3">
                        <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                          <div>
                            <div className="fw-semibold">
                              #{shipment.id} - {shipment.reference}
                            </div>
                            <div className="text-muted small">
                              {shipment.origin} → {shipment.destination}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`badge ${getStatusBadgeClass(
                                shipment.status
                              )}`}
                            >
                              {shipment.status}
                            </span>
                          </div>
                        </div>

                        <div className="row g-2 small mb-3">
                          <div className="col-12 col-md-4">
                            <strong>Driver:</strong>{" "}
                            {shipment.driver?.email ?? "Unassigned"}
                          </div>
                          <div className="col-12 col-md-4">
                            <strong>Created:</strong>{" "}
                            {new Date(shipment.createdAt).toLocaleString()}
                          </div>
                          <div className="col-12 col-md-4">
                            {shipment.deliveryConfirmation ? (
                              <span className="text-success">
                                <strong>Delivery Confirmed:</strong>{" "}
                                {new Date(
                                  shipment.deliveryConfirmation.confirmedAt
                                ).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted">
                                No delivery confirmation yet
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-12 col-md-8">
                            <form
                              action={updateShipmentStatus}
                              className="d-flex flex-column flex-md-row gap-2"
                            >
                              <input
                                type="hidden"
                                name="shipmentId"
                                value={shipment.id}
                              />
                              <select
                                name="status"
                                defaultValue={shipment.status}
                                className="form-select form-select-sm"
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="btn btn-sm btn-outline-primary"
                              >
                                Save Status
                              </button>
                            </form>
                          </div>

                          <div className="col-12 col-md-4">
                            <form action={deleteShipment}>
                              <input
                                type="hidden"
                                name="shipmentId"
                                value={shipment.id}
                              />
                              <button
                                type="submit"
                                className="btn btn-sm btn-outline-danger w-100"
                              >
                                Delete Shipment
                              </button>
                            </form>
                          </div>
                        </div>

                        <div className="small">
                          <strong>Status History</strong>
                          {shipment.statusUpdates.length === 0 ? (
                            <p className="text-muted mb-0 mt-1">
                              No status updates recorded.
                            </p>
                          ) : (
                            <ul className="mb-0 mt-1">
                              {shipment.statusUpdates.map((update) => (
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
          </div>
        </div>
      </main>
    </>
  );
}