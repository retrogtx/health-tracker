import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/app/auth";

const prisma = new PrismaClient();

// GET health metrics for the authenticated user
export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const metrics = await prisma.healthMetric.findMany({
      where: { userId: session.user.id },
      orderBy: { dateRecorded: 'desc' },
      take: 10 // Get the 10 most recent entries
    });
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    return NextResponse.json({ error: "Failed to fetch health metrics" }, { status: 500 });
  }
}

// POST a new health metric
export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const data = await req.json();
    
    const newMetric = await prisma.healthMetric.create({
      data: {
        heartRate: data.heartRate || null,
        bloodPressure: data.bloodPressure || null,
        sleepHours: data.sleepHours || null,
        weight: data.weight || null,
        bmi: data.bmi || null,
        userId: session.user.id
      }
    });
    
    return NextResponse.json(newMetric, { status: 201 });
  } catch (error) {
    console.error("Error creating health metric:", error);
    return NextResponse.json({ error: "Failed to create health metric" }, { status: 500 });
  }
} 