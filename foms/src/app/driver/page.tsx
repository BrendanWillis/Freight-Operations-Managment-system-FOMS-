import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";

const DRIVER_STATUS_OPTIONS = ["In Transit", "Delivered"];

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

  if (!shipmentId || !DRIVER_STATUS_OPTIONS.includes(status)) {
    redirect("/driver");
  }

  const shipment = await prisma.shipment.findFirst({
    where: {
      id: shipmentId,
      status: {
        in: ["Assigned", "In Transit"],
      },
    },
  });

  if (!shipment) {
    redirect("/driver");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status },
  });

  redirect("/driver");
}

export default async function DriverPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/");

  const shipments = await prisma.shipment.findMany({
    where: {
      status: {
        in: ["Assigned", "In Transit"],
      },
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
              <h2 className="h6 mb-0">Available Driver Shipments</h2>
              <span className="badge bg-secondary">{shipments.length} total</span>
            </div>

            {shipments.length === 0 ? (
              <p className="text-muted mt-3 mb-0">
                No assigned or in-transit shipments right now.
              </p>
            ) : (
              <div className="table-responsive mt-3">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reference</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th style={{ minWidth: "200px" }}>Driver Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.reference}</td>
                        <td>{s.origin}</td>
                        <td>{s.destination}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>{new Date(s.createdAt).toLocaleString()}</td>
                        <td>
                          <form
                            action={updateDriverShipmentStatus}
                            className="d-flex flex-column flex-md-row gap-2"
                          >
                            <input type="hidden" name="shipmentId" value={s.id} />
                            <select
                              name="status"
                              defaultValue={
                                s.status === "Assigned" ? "In Transit" : s.status
                              }
                              className="form-select form-select-sm"
                              style={{ minWidth: "130px" }}
                            >
                              {DRIVER_STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="btn btn-sm btn-outline-primary"
                            >
                              Save
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-muted small mt-2">
              Drivers can move shipments from Assigned to In Transit and then to Delivered.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}