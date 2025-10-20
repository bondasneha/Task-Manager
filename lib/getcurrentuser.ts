// lib/getCurrentUser.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}
