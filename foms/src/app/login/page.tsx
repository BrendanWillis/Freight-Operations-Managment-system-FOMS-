"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("shipper@foms.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      return;
    }

    // Redirect to a role dashboard
    const data = await res.json();
    if (data.role === "ADMIN") router.push("/admin");
    else if (data.role === "DRIVER") router.push("/driver");
    else router.push("/shipper");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>FOMS Login</h1>
      <p>Demo users: admin@foms.com, shipper@foms.com, driver@foms.com (Password123!)</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%" }} />
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button type="submit">Login</button>
      </form>
    </main>
  );
}
