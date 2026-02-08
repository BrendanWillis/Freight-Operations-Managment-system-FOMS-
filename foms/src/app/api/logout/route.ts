import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "../../lib/session";

export async function POST() {
  const nextCookies = await cookies();
  const cookieStore = {
    get: (name: string) => {
      const c = nextCookies.get(name);
      return c ? c.value : undefined;
    },
    set: (cookie: { name: string; value: string; options?: any }) => {
      nextCookies.set({
        name: cookie.name,
        value: cookie.value,
        httpOnly: cookie.options?.httpOnly,
        path: cookie.options?.path,
        maxAge: cookie.options?.maxAge,
        sameSite: cookie.options?.sameSite,
        secure: cookie.options?.secure,
      } as any);
    },
  };

  const session = await getIronSession<SessionData>(cookieStore as any, sessionOptions);
  session.destroy();
  return NextResponse.json({ ok: true });
}
