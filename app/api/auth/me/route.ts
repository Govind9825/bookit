import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function GET(request: Request) {
  try {
    if (!JWT_SECRET) return NextResponse.json({ user: null });
    const token = (request as any).headers.get("cookie")?.split(";")?.find((c: string) => c.trim().startsWith("token="))?.split("=")?.[1];
    if (!token) return NextResponse.json({ user: null });
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return NextResponse.json({ user: null });
    }
    await connectToDatabase();
    const user = await User.findById(payload.sub).lean();
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ user: null });
  }
}


