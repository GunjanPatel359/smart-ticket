"use server";

import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

interface TokenPayload extends JwtPayload {
  id: number;
  email: string;
  role: "user" | "technician" | "admin";
}

// Generic token getter
const getToken = async (cookieName: string): Promise<TokenPayload | null> => {
  try {
    const tokenCookie = cookies().get(cookieName);
    if (!tokenCookie) return null;

    return jwt.verify(tokenCookie.value, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
};

// Specific role-based getters
export const getUserToken = async () => getToken("user_token");
export const getTechnicianToken = async () => getToken("technician_token");
export const getAdminToken = async () => getToken("admin_token");