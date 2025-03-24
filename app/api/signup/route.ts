import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const userSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.string().optional().transform(val => val ? parseInt(val) : null),
  gender: z.enum(["Male", "Female", "Other", ""]).optional().transform(val => val || null),
  contact: z.string().optional().transform(val => val || null),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = userSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validation.error.format() },
        { status: 400 }
      );
    }
    
    const { username, password, email, firstName, lastName, age, gender, contact } = validation.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 409 }
      );
    }

    // Check if email is already used
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        age,
        gender,
        contact,
      },
    });
    
    return NextResponse.json(
      { 
        id: user.id, 
        username: user.username,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 