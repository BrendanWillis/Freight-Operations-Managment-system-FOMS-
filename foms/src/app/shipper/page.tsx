import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";
import { prisma } from "../lib/db";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

function CreateShipmentForm() {
  return (
    <form>
      <label style={{ display: "block", marginBottom: 8 }}>
        Reference: <input name="reference" />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Origin: <input name="origin" />
      </label>
      <label style={{ display: "block", marginBottom: 8 }}>
        Destination: <input name="destination" />
      </label>
      <button type="submit">Create</button>
    </form>
  );
}

export default async function ShipperPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "SHIPPER") redirect("/login");

  const shipments = await prisma.shipment.findMany({
    where: { createdById: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Shipper Dashboard</h1>
      <p>Logged in as: {user.email} ({user.role})</p>

      <h2>Create Shipment</h2>
      <CreateShipmentForm />

      <h2 style={{ marginTop: 24 }}>My Shipments</h2>
      <ul>
        {shipments.map((s: { id: Key | null | undefined; reference: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; origin: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; destination: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; }) => (
          <li key={s.id}>
            <b>{s.reference}</b> — {s.origin} → {s.destination} ({new Date(s.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </main>
  );
}
