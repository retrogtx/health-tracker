import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

// GET diet logs for the authenticated user
export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const dietLogs = await prisma.dietLog.findMany({
      where: { userId: session.user.id },
      orderBy: { dateLogged: 'desc' },
      take: 10 // Get the 10 most recent entries
    });
    
    return NextResponse.json(dietLogs);
  } catch (error) {
    console.error("Error fetching diet logs:", error);
    return NextResponse.json({ error: "Failed to fetch diet logs" }, { status: 500 });
  }
}

// POST a new diet log
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await req.json();
    
    const newDietLog = await prisma.dietLog.create({
      data: {
        mealType: data.mealType,
        calories: data.calories || null,
        protein: data.protein || null,
        carbs: data.carbs || null,
        fats: data.fats || null,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(newDietLog, { status: 201 });
  } catch (error) {
    console.error("Error creating diet log:", error);
    return NextResponse.json({ error: "Failed to create diet log" }, { status: 500 });
  }
} 