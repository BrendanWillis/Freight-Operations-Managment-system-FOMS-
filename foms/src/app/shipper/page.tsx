import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";

async function createShipment(formData: FormData) {
  "use server";

  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/login");

  const reference = String(formData.get("reference") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();

  if (!reference || !origin || !destination) {
    // Simple approach: just redirect back; later we can show error messages
    redirect("/shipper");
  }

  await prisma.shipment.create({
    data: {
      reference,
      origin,
      destination,
      userId: user.id, // IMPORTANT: matches your schema
    },
  });

  redirect("/shipper");
}

export default async function ShipperPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/login");

  const shipments = await prisma.shipment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

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
                    <button className="btn btn-primary">Create</button>
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
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Reference</th>
                          <th>Origin</th>
                          <th>Destination</th>
                          <th>Status</th>
                          <th>Created</th>
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
                              <span className="badge bg-secondary">
                                {s.status}
                              </span>
                            </td>
                            <td>{new Date(s.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="text-muted small mt-2">
                  Refresh the page to confirm persistence.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}