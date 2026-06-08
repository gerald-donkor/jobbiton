import { clearAuthCookies } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    clearAuthCookies(response.cookies);
    return response;
  } catch (error) {
    console.error("[auth/session]", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear session" },
      { status: 500 },
    );
  }
}
