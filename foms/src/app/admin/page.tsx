import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";
import AutoRefresh from "../components/AutoRefresh";

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

  if (!shipment || shipment.status !== "Created") {
    redirect("/admin");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      driverId,
      status: "Assigned",
      statusUpdates: {
        create: {
          status: "Assigned",
          updatedById: user.id,
        },
      },
    },
  });

  redirect("/admin");
}

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const [shipments, drivers] = await Promise.all([
    prisma.shipment.findMany({
      include: {
        shipper: true,
        driver: true,
        statusUpdates: {
          orderBy: { createdAt: "asc" },
        },
        deliveryConfirmation: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "DRIVER" },
      orderBy: { email: "asc" },
    }),
  ]);

  const activeShipments = shipments.filter((s) => s.status !== "Delivered");
  const createdCount = shipments.filter((s) => s.status === "Created").length;
  const assignedCount = shipments.filter((s) => s.status === "Assigned").length;
  const inTransitCount = shipments.filter((s) => s.status === "In Transit").length;
  const deliveredCount = shipments.filter((s) => s.status === "Delivered").length;

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
            <a className="btn btn-outline-light btn-sm" href="/shipper">
              Shipper
            </a>
            <a className="btn btn-outline-light btn-sm" href="/driver">
              Driver
            </a>
            <Link className="btn btn-outline-success btn-sm" href="/admin/deliveries">
              Delivered Shipments
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="text-muted small mb-2">
          Auto-refreshing every 5 seconds
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h1 className="h4 mb-1">Admin Dashboard</h1>
            <div className="text-muted small">
              Logged in as: {user.email} ({user.role})
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card h-100 border-secondary">
              <div className="card-body">
                <div className="text-muted small">Created</div>
                <div className="fs-4 fw-bold">{createdCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card h-100 border-warning">
              <div className="card-body">
                <div className="text-muted small">Assigned</div>
                <div className="fs-4 fw-bold text-warning">{assignedCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card h-100 border-primary">
              <div className="card-body">
                <div className="text-muted small">In Transit</div>
                <div className="fs-4 fw-bold text-primary">{inTransitCount}</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="card h-100 border-success">
              <div className="card-body">
                <div className="text-muted small">Delivered</div>
                <div className="fs-4 fw-bold text-success">{deliveredCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h6 mb-0">Active Shipments</h2>
              <span className="badge bg-secondary">{activeShipments.length} active</span>
            </div>

            {activeShipments.length === 0 ? (
              <p className="text-muted mt-3 mb-0">No active shipments.</p>
            ) : (
              <div className="mt-3">
                {activeShipments.map((s) => (
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
                        <strong>Shipper:</strong> {s.shipper?.email ?? "Unknown"}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Driver:</strong> {s.driver?.email ?? "Unassigned"}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Created:</strong> {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Updated:</strong> {new Date(s.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    {s.status === "Created" && (
                      <div className="mb-3">
                        <form action={assignDriver} className="row g-2 align-items-end">
                          <input type="hidden" name="shipmentId" value={s.id} />

                          <div className="col-12 col-md-6">
                            <label className="form-label small">Assign Driver</label>
                            <select
                              name="driverId"
                              className="form-select form-select-sm"
                              required
                            >
                              <option value="">Select driver</option>
                              {drivers.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.email}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-12 col-md-auto">
                            <button type="submit" className="btn btn-sm btn-outline-primary">
                              Assign
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

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
                              {update.status} - {new Date(update.createdAt).toLocaleString()}
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