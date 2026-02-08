import { redirect } from "next/navigation";
import { getSessionUser } from "../lib/auth";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/login");

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1>Admin Dashboard</h1>
      <p>Logged in as: {user.email} ({user.role})</p>
    </main>
  );
}
