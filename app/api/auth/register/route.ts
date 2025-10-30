import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ name, email, passwordHash, role: role === "owner" ? "owner" : "user" });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err?.message || "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


