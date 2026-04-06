import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const shipmentId = Number(params.id);

  if (!shipmentId) {
    return new NextResponse("Invalid shipment id", { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      shipper: true,
      driver: true,
      statusUpdates: {
        orderBy: { createdAt: "asc" },
      },
      deliveryConfirmation: true,
    },
  });

  if (!shipment) {
    return new NextResponse("Shipment not found", { status: 404 });
  }

  if (shipment.status !== "Delivered") {
    return new NextResponse("Only delivered shipments can be exported", {
      status: 400,
    });
  }

  const confirmedAt = shipment.deliveryConfirmation?.confirmedAt
    ? new Date(shipment.deliveryConfirmation.confirmedAt).toLocaleString()
    : "Not available";

  const deliveryNote =
    shipment.deliveryConfirmation?.note?.trim() || "No note provided";

  const historyHtml =
    shipment.statusUpdates.length > 0
      ? shipment.statusUpdates
          .map(
            (update) => `
              <tr>
                <td>${escapeHtml(update.status)}</td>
                <td>${escapeHtml(
                  new Date(update.createdAt).toLocaleString()
                )}</td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="2">No status updates recorded.</td>
          </tr>
        `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delivery Confirmation - Shipment ${shipment.id}</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 40px;
      color: #222;
      background: #fff;
    }

    .document {
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid #ccc;
      padding: 32px;
      border-radius: 8px;
    }

    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }

    h2 {
      margin-top: 32px;
      margin-bottom: 12px;
      font-size: 18px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
    }

    .subtitle {
      color: #666;
      margin-bottom: 24px;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      background: #198754;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
    }

    .field {
      margin-bottom: 10px;
    }

    .label {
      font-weight: bold;
      display: block;
      margin-bottom: 4px;
    }

    .note-box {
      border: 1px solid #ddd;
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      white-space: pre-wrap;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f1f3f5;
    }

    .footer {
      margin-top: 32px;
      font-size: 12px;
      color: #666;
    }

    @media print {
      body {
        margin: 0;
      }

      .document {
        border: none;
        border-radius: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="document">
    <h1>Delivery Confirmation</h1>
<div class="subtitle">
  Freight Operations Management System (FOMS)
</div>

<div style="margin-top: 12px;">
  <button onclick="window.print()" style="
    padding: 8px 16px;
    border: none;
    background: #0d6efd;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  ">
    Print / Save as PDF
  </button>
</div>

    <div class="field">
      <span class="label">Current Status</span>
      <span class="status-badge">${escapeHtml(shipment.status)}</span>
    </div>

    <h2>Shipment Information</h2>
    <div class="grid">
      <div class="field">
        <span class="label">Shipment ID</span>
        <div>${shipment.id}</div>
      </div>
      <div class="field">
        <span class="label">Reference</span>
        <div>${escapeHtml(shipment.reference)}</div>
      </div>
      <div class="field">
        <span class="label">Origin</span>
        <div>${escapeHtml(shipment.origin)}</div>
      </div>
      <div class="field">
        <span class="label">Destination</span>
        <div>${escapeHtml(shipment.destination)}</div>
      </div>
      <div class="field">
        <span class="label">Created At</span>
        <div>${escapeHtml(new Date(shipment.createdAt).toLocaleString())}</div>
      </div>
      <div class="field">
        <span class="label">Delivery Confirmed At</span>
        <div>${escapeHtml(confirmedAt)}</div>
      </div>
    </div>

    <h2>Parties</h2>
    <div class="grid">
      <div class="field">
        <span class="label">Shipper</span>
        <div>${escapeHtml(shipment.shipper?.email ?? "Unknown")}</div>
      </div>
      <div class="field">
        <span class="label">Driver</span>
        <div>${escapeHtml(shipment.driver?.email ?? "Unassigned")}</div>
      </div>
    </div>

    <h2>Delivery Note</h2>
    <div class="note-box">${escapeHtml(deliveryNote)}</div>

    <h2>Status History</h2>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${historyHtml}
      </tbody>
    </table>

    <div class="footer">
      Exported from FOMS on ${escapeHtml(new Date().toLocaleString())}
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="delivery-confirmation-${shipment.id}.html"`,
    },
  });
}