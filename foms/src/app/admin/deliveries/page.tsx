import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/auth";
import { prisma } from "../../lib/db";
import AutoRefresh from "../../components/AutoRefresh";

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

export default async function AdminDeliveriesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  const deliveredShipments = await prisma.shipment.findMany({
    where: {
      status: "Delivered",
    },
    include: {
      shipper: true,
      driver: true,
      statusUpdates: {
        orderBy: { createdAt: "asc" },
      },
      deliveryConfirmation: true,
    },
    orderBy: { updatedAt: "desc" },
  });

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
            <Link className="btn btn-outline-success btn-sm" href="/admin">
              Active Shipments
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
            <h1 className="h4 mb-1">Confirmed Deliveries</h1>
            <div className="text-muted small">
              Delivered shipments with history, confirmation details, and export
            </div>
          </div>

          <Link href="/admin" className="btn btn-outline-secondary btn-sm">
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h6 mb-0">Delivered Shipments</h2>
              <span className="badge bg-success">
                {deliveredShipments.length} delivered
              </span>
            </div>

            {deliveredShipments.length === 0 ? (
              <p className="text-muted mt-3 mb-0">
                No confirmed deliveries yet.
              </p>
            ) : (
              <div className="mt-3">
                {deliveredShipments.map((s) => (
                  <div key={s.id} className="border rounded p-3 mb-3 bg-light">
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
                        <strong>Driver:</strong>{" "}
                        {s.driver?.email ?? "Unassigned"}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Created:</strong>{" "}
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                      <div className="col-12 col-md-3">
                        <strong>Delivered:</strong>{" "}
                        {s.deliveryConfirmation?.confirmedAt
                          ? new Date(
                              s.deliveryConfirmation.confirmedAt
                            ).toLocaleString()
                          : "Confirmed"}
                      </div>
                    </div>

                    <div className="mb-3 small">
                      <strong>Delivery Confirmation</strong>
                      <div className="mt-1">
                        {s.deliveryConfirmation ? (
                          <>
                            <div>
                              <strong>Confirmed At:</strong>{" "}
                              {new Date(
                                s.deliveryConfirmation.confirmedAt
                              ).toLocaleString()}
                            </div>
                            <div>
                              <strong>Note:</strong>{" "}
                              {s.deliveryConfirmation.note || "No note provided"}
                            </div>
                          </>
                        ) : (
                          <p className="text-muted mb-0">
                            No delivery confirmation record found.
                          </p>
                        )}
                      </div>

                      <div className="mt-3">
                        <a
                          href={`/admin/deliveries/export/${s.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Export Confirmation
                        </a>
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