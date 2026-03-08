export default function Home() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/">
            FOMS
          </a>

          <div className="ms-auto d-flex gap-2">
            <a className="btn btn-outline-light btn-sm" href="/login">
              Login
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h1 className="display-6 mb-3">
                  Freight Operations Management System
                </h1>
                <p className="lead text-muted mb-3">
                  A role-based logistics prototype for creating shipments,
                  tracking freight progress, updating delivery status, and
                  managing operations across shipper, driver, and admin views.
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <a className="btn btn-primary" href="/login">
                    Get Started
                  </a>
                  <a className="btn btn-outline-secondary" href="/shipper">
                    Shipper Dashboard
                  </a>
                  <a className="btn btn-outline-secondary" href="/driver">
                    Driver Dashboard
                  </a>
                  <a className="btn btn-outline-secondary" href="/admin">
                    Admin Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="row g-3">
              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="h5">Shipper</h2>
                    <p className="text-muted">
                      Create shipments, manage your existing records, update
                      statuses, and monitor progress through the freight
                      lifecycle.
                    </p>
                    <div className="d-grid">
                      <a className="btn btn-primary" href="/shipper">
                        Go to Shipper Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="h5">Driver</h2>
                    <p className="text-muted">
                      View assigned shipments, move loads into transit, and mark
                      deliveries complete from the driver dashboard.
                    </p>
                    <div className="d-grid">
                      <a className="btn btn-warning" href="/driver">
                        Go to Driver Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h2 className="h5">Admin</h2>
                    <p className="text-muted">
                      Oversee all shipments across the system, update statuses,
                      review shipment activity, and manage operational flow.
                    </p>
                    <div className="d-grid">
                      <a className="btn btn-dark" href="/admin">
                        Go to Admin Dashboard
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h2 className="h5 mb-3">Core Workflow</h2>

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 h-100">
                      <h3 className="h6">1. Shipment Creation</h3>
                      <p className="text-muted mb-0">
                        Shippers create freight records with reference, origin,
                        and destination details.
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 h-100">
                      <h3 className="h6">2. Delivery Progress</h3>
                      <p className="text-muted mb-0">
                        Drivers work active loads by moving them from Assigned to
                        In Transit and then Delivered.
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="border rounded p-3 h-100">
                      <h3 className="h6">3. Administrative Oversight</h3>
                      <p className="text-muted mb-0">
                        Admin users monitor the entire system, review shipment
                        states, and manage records across all roles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body">
                <h2 className="h6">Current Prototype Features</h2>
                <ul className="mb-0">
                  <li>Role-based login and protected dashboards</li>
                  <li>Shipment creation, status updates, and deletion</li>
                  <li>Driver workflow for active freight delivery</li>
                  <li>Admin oversight with dashboard summary cards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}