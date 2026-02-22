export default function Home() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
            FOMS
          </a>

          <div className="ms-auto d-flex gap-2">
            <a className="btn btn-outline-light btn-sm" href="/login">
              Login
            </a>
            <a className="btn btn-primary btn-sm" href="/dashboard">
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <div className="card">
              <div className="card-body">
                <h1 className="h4 mb-2">Freight Operations Management System</h1>
                <p className="text-muted mb-0">
                  Manage shipments, assign drivers, track status updates, and confirm deliveries.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="card">
              <div className="card-body">
                <h2 className="h6">Quick Actions</h2>
                <div className="d-grid gap-2">
                  <button className="btn btn-success">Create Shipment (Shipper)</button>
                  <button className="btn btn-warning">Assign Driver (Admin)</button>
                  <button className="btn btn-info">Update Status (Driver)</button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h2 className="h6">Shipment List (placeholder)</h2>
                <table className="table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Shipment</th>
                      <th>Status</th>
                      <th>Driver</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#1001</td>
                      <td><span className="badge bg-secondary">Created</span></td>
                      <td>—</td>
                      <td>Rexburg, ID</td>
                    </tr>
                    <tr>
                      <td>#1002</td>
                      <td><span className="badge bg-warning text-dark">In Transit</span></td>
                      <td>Driver A</td>
                      <td>Idaho Falls, ID</td>
                    </tr>
                    <tr>
                      <td>#1003</td>
                      <td><span className="badge bg-success">Delivered</span></td>
                      <td>Driver B</td>
                      <td>Boise, ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}