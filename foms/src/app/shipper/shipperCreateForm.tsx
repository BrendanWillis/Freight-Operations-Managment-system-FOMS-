"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateShipmentForm() {
  const router = useRouter();
  const [reference, setReference] = useState("REF-1001");
  const [origin, setOrigin] = useState("Rexburg, ID");
  const [destination, setDestination] = useState("Boise, ID");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, origin, destination }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create shipment");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <label>
        Reference
        <input value={reference} onChange={(e) => setReference(e.target.value)} style={{ width: "100%" }} />
      </label>

      <label>
        Origin
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ width: "100%" }} />
      </label>

      <label>
        Destination
        <input value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: "100%" }} />
      </label>

      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <button type="submit">Create</button>
    </form>
  );
}
