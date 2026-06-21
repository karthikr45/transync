import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server-auth";

export async function POST() {
  const response = NextResponse.json({ statusCode: 200, message: "Logged out.", status: "Success", result: null });
  clearAuthCookies(response);
  return response;
}
