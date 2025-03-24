import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

// GET health suggestions for the authenticated user
export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const suggestions = await prisma.healthSuggestion.findMany({
      where: { userId: session.user.id },
      orderBy: { dateIssued: 'desc' },
      take: 10 // Get the 10 most recent suggestions
    });
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching health suggestions:", error);
    return NextResponse.json({ error: "Failed to fetch health suggestions" }, { status: 500 });
  }
}

// POST a new health suggestion
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { suggestionType, personalisedSuggestion } = await req.json();
    
    if (!suggestionType || !personalisedSuggestion) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const newSuggestion = await prisma.healthSuggestion.create({
      data: {
        suggestionType,
        personalisedSuggestion,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    console.error("Error creating health suggestion:", error);
    return NextResponse.json({ error: "Failed to create health suggestion" }, { status: 500 });
  }
} 