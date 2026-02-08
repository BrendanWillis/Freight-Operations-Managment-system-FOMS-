import { SessionOptions } from "iron-session";

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "SHIPPER" | "DRIVER";
};

export type SessionData = {
  user?: SessionUser;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: "foms_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
