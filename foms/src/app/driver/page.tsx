import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";

export default async function DriverPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "DRIVER") redirect("/login");

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Driver Dashboard</h1>
      <p>Logged in as: {user.email} ({user.role})</p>
      <p>(Prototype) Next: show assigned shipments + status update form.</p>
    </main>
  );
}
