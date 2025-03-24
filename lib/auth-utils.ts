import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

/**
 * Helper function to check if a user is authenticated and return their session,
 * or return an unauthorized response if not authenticated
 */
export async function getAuthenticatedUser(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return { 
      isAuthenticated: false, 
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null
    };
  }
  
  return { 
    isAuthenticated: true, 
    response: null,
    session
  };
}

/**
 * Helper function to handle errors in API routes
 */
export function handleApiError(error: unknown, errorMessage = "An error occurred") {
  console.error(`API Error: ${errorMessage}`, error);
  return NextResponse.json({ error: errorMessage }, { status: 500 });
} 