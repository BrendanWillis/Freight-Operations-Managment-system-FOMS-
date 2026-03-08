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

async function createShipment(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/");

  const reference = String(formData.get("reference") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();

  if (!reference || !origin || !destination) {
    redirect("/shipper");
  }

  await prisma.shipment.create({
    data: {
      reference,
      origin,
      destination,
      userId: user.id,
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
      userId: user.id,
    },
  });

  if (!shipment) {
    redirect("/shipper");
  }

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: { status },
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
      userId: user.id,
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
    where: { userId: user.id },
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
                  <div className="col-12">
                    <label className="form-label">Reference</label>
                    <input
                      name="reference"
                      className="form-control"
                      placeholder="REF-1001"
                      required
                    />
                  </div>

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

                <div className="text-muted small mt-3">
                  This fulfills FR-002 (Shipment Creation and Management).
                </div>
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
                          <th style={{ minWidth: "200px" }}>Update Status</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map((shipment) => (
                          <tr key={shipment.id}>
                            <td>{shipment.id}</td>
                            <td>{shipment.reference}</td>
                            <td>{shipment.origin}</td>
                            <td>{shipment.destination}</td>
                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  shipment.status
                                )}`}
                              >
                                {shipment.status}
                              </span>
                            </td>
                            <td>
                              {new Date(shipment.createdAt).toLocaleString()}
                            </td>
                            <td>
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
                              <form action={deleteShipment}>
                                <input
                                  type="hidden"
                                  name="shipmentId"
                                  value={shipment.id}
                                />
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
                  Update or delete a shipment and save changes to persist them.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}