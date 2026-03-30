import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";

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

async function assignDriver(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));
  const driverId = String(formData.get("driverId") ?? "").trim();

  if (!shipmentId || !driverId) {
    redirect("/admin");
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  const driver = await prisma.user.findFirst({
    where: {
      id: driverId,
      role: "DRIVER",
    },
  });

  if (!shipment || !driver) {
    redirect("/admin");
  }

  const nextStatus =
    shipment.status === "Created" ? "Assigned" : shipment.status;

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      driverId,
      status: nextStatus,
      statusUpdates: {
        create: {
          status: nextStatus,
          updatedById: user.id,
        },
      },
    },
  });

  redirect("/admin");
}

async function updateAdminShipmentStatus(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));
  const status = String(formData.get("status") ?? "").trim();

  if (!shipmentId || !STATUS_OPTIONS.includes(status)) {
    redirect("/admin");
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      deliveryConfirmation: true,
    },
  });

  if (!shipment) {
    redirect("/admin");
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
                note: "Marked delivered from admin dashboard",
              },
            },
          }
        : {}),
    },
  });

  redirect("/admin");
}

async function deleteAdminShipment(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const shipmentId = Number(formData.get("shipmentId"));

  if (!shipmentId) {
    redirect("/admin");
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });

  if (!shipment) {
    redirect("/admin");
  }

  await prisma.shipment.delete({
    where: { id: shipmentId },
  });

  redirect("/admin");
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

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

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    orderBy: { email: "asc" },
  });

  const totalCount = shipments.length;
  const createdCount = shipments.filter((s) => s.status === "Created").length;
  const assignedCount = shipments.filter((s) => s.status === "Assigned").length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "In Transit"
  ).length;
  const deliveredCount = shipments.filter(
    (s) => s.status === "Delivered"
  ).length;

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
            <a className="btn btn-outline-light btn-sm" href="/driver">
              Driver
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h4 mb-1">Admin Dashboard</h1>
            <div className="text-muted small">
              Logged in as: {user.email} ({user.role})
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-xl">
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">Total Shipments</div>
                <div className="fs-4 fw-bold">{totalCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-4 col-xl">
            <div className="card h-100 border-secondary">
              <div className="card-body">
                <div className="text-muted small">Created</div>
                <div className="fs-4 fw-bold text-secondary">{createdCount}</div>
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

          <div className="col-6 col-md-4 col-xl">
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

        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h6 mb-0">All Shipments</h2>
              <span className="badge bg-secondary">{shipments.length} total</span>
            </div>

            {shipments.length === 0 ? (
              <p className="text-muted mt-3 mb-0">No shipments found.</p>
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
                      <div className="col-12 col-md-3">
                        <strong>Created By:</strong>{" "}
                        {s.shipper?.email ?? "Unknown"}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Assigned Driver:</strong>{" "}
                        {s.driver?.email ?? "Unassigned"}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Created:</strong>{" "}
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <div className="col-12 col-md-3">
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

                    <div className="row g-2 mb-3">
                      <div className="col-12 col-lg-5">
                        <form
                          action={assignDriver}
                          className="d-flex flex-column flex-md-row gap-2"
                        >
                          <input type="hidden" name="shipmentId" value={s.id} />
                          <select
                            name="driverId"
                            defaultValue={s.driverId ?? ""}
                            className="form-select form-select-sm"
                          >
                            <option value="">Select driver</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.email}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="btn btn-sm btn-outline-success"
                          >
                            Assign Driver
                          </button>
                        </form>
                      </div>

                      <div className="col-12 col-lg-4">
                        <form
                          action={updateAdminShipmentStatus}
                          className="d-flex flex-column flex-md-row gap-2"
                        >
                          <input type="hidden" name="shipmentId" value={s.id} />
                          <select
                            name="status"
                            defaultValue={s.status}
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

                      <div className="col-12 col-lg-3">
                        <form action={deleteAdminShipment}>
                          <input type="hidden" name="shipmentId" value={s.id} />
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