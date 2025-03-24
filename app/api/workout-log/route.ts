import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

// GET workout logs for the authenticated user
export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId: session.user.id },
      orderBy: { dateLogged: 'desc' },
      take: 10 // Get the 10 most recent entries
    });
    
    return NextResponse.json(workoutLogs);
  } catch (error) {
    console.error("Error fetching workout logs:", error);
    return NextResponse.json({ error: "Failed to fetch workout logs" }, { status: 500 });
  }
}

// POST a new workout log
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await req.json();
    
    const newWorkoutLog = await prisma.workoutLog.create({
      data: {
        workoutType: data.workoutType,
        duration: data.duration,
        caloriesBurned: data.caloriesBurned || null,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(newWorkoutLog, { status: 201 });
  } catch (error) {
    console.error("Error creating workout log:", error);
    return NextResponse.json({ error: "Failed to create workout log" }, { status: 500 });
  }
} 