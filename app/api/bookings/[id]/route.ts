import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Booking } from "@/models/Booking"
import { Experience } from "@/models/Experience"
import { User } from "@/models/User"
import jwt from "jsonwebtoken"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const JWT_SECRET = process.env.JWT_SECRET || ""
    if (!JWT_SECRET) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    const cookie = (request as any).headers.get("cookie") || ""
    const token = cookie.split(";").find((c: string) => c.trim().startsWith("token="))?.split("=")?.[1]
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()
    const booking = await Booking.findById(id)
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    if (String(booking.userId) !== String((payload as any).sub)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // restore availability for the slot
    await Experience.updateOne(
      { _id: booking.experienceId },
      { $inc: { "slots.$[elem].available": booking.quantity } },
      { arrayFilters: [{ "elem.date": booking.date, "elem.time": booking.time }] },
    )

    const updated = await Booking.findByIdAndUpdate(
      booking._id,
      { $set: { status: "cancelled" } },
      { new: true },
    )
    return NextResponse.json({ success: true, data: {
      id: String(updated!._id),
      ref: updated!.ref,
      status: updated!.status,
    } })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "Failed to cancel booking" }, { status: 500 })
  }
}


