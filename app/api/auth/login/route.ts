import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function POST(request: Request) {
  try {
    const { email, password, ownerSecret } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Server misconfigured: JWT_SECRET missing" }, { status: 500 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // If user opted to be owner and provided the public secret, elevate role
    if (ownerSecret === "admin" && user.role !== "owner") {
      user.role = "owner";
      await user.save();
    }
    const token = jwt.sign({ sub: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const res = NextResponse.json({
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


