"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type QuickUser = {
  label: string;
  email: string;
  password: string;
  role: "ADMIN" | "SHIPPER" | "DRIVER";
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("shipper@foms.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [quickUsers, setQuickUsers] = useState<QuickUser[]>([]);
  const [loadingQuickUsers, setLoadingQuickUsers] = useState(true);

  useEffect(() => {
    async function loadQuickUsers() {
      if (process.env.NODE_ENV !== "development") {
        setLoadingQuickUsers(false);
        return;
      }

      try {
        const res = await fetch("/api/dev-users");

        if (!res.ok) {
          setQuickUsers([]);
          setLoadingQuickUsers(false);
          return;
        }

        const data = await res.json();
        setQuickUsers(data.users ?? []);
      } catch {
        setQuickUsers([]);
      } finally {
        setLoadingQuickUsers(false);
      }
    }

    loadQuickUsers();
  }, []);

  function fillQuickUser(user: QuickUser) {
    setEmail(user.email);
    setPassword(user.password);
    setError(null);
  }

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

    const data = await res.json();
    if (data.role === "ADMIN") router.push("/admin");
    else if (data.role === "DRIVER") router.push("/driver");
    else router.push("/shipper");
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>FOMS Login</h1>
      <p>
        Standard demo users: admin@foms.com, shipper@foms.com, driver@foms.com
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button type="submit">Login</button>
      </form>

      {process.env.NODE_ENV === "development" && (
        <section
          style={{
            marginTop: 24,
            padding: 16,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.1rem" }}>
            Dev Quick Fill
          </h2>
          <p style={{ marginTop: 0 }}>
            Click a button to fill in a current account from the database.
          </p>

          {loadingQuickUsers ? (
            <div>Loading demo users...</div>
          ) : quickUsers.length === 0 ? (
            <div style={{ color: "#666" }}>No dev users found.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => fillQuickUser(user)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: "#f7f7f7",
                    cursor: "pointer",
                  }}
                >
                  {user.label}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}