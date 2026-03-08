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
  });

  if (!shipment) {
    redirect("/admin");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status },
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
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = shipments.length;
  const createdCount = shipments.filter((s) => s.status === "Created").length;
  const assignedCount = shipments.filter((s) => s.status === "Assigned").length;
  const inTransitCount = shipments.filter((s) => s.status === "In Transit").length;
  const deliveredCount = shipments.filter((s) => s.status === "Delivered").length;

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
                <div className="fs-4 fw-bold text-success">{deliveredCount}</div>
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
              <div className="table-responsive mt-3">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Reference</th>
                      <th>Origin</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Created</th>
                      <th style={{ minWidth: "200px" }}>Update Status</th>
                      <th>Delete</th>
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
                        <td>{s.user?.email ?? "Unknown"}</td>
                        <td>{new Date(s.createdAt).toLocaleString()}</td>
                        <td>
                          <form
                            action={updateAdminShipmentStatus}
                            className="d-flex flex-column flex-md-row gap-2"
                          >
                            <input type="hidden" name="shipmentId" value={s.id} />
                            <select
                              name="status"
                              defaultValue={s.status}
                              className="form-select form-select-sm"
                              style={{ minWidth: "130px" }}
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
                              Save
                            </button>
                          </form>
                        </td>
                        <td>
                          <form action={deleteAdminShipment}>
                            <input type="hidden" name="shipmentId" value={s.id} />
                            <button
                              type="submit"
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
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
              Admin can oversee all shipments, update statuses, and remove records.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}