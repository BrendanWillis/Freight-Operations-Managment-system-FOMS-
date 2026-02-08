import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "./session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as unknown as any, sessionOptions);
  return session.user;
}
