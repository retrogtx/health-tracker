import { NextResponse } from "next/server";
import { signOut } from "@/app/auth";

export async function POST() {
  try {
    // Execute signOut in server context where headers are available
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during signout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sign out" },
      { status: 500 }
    );
  }
} 