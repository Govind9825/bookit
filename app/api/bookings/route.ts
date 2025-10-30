import { connectToDatabase } from "@/lib/mongodb"
import { Booking } from "@/models/Booking"
import { User } from "@/models/User"
import { Experience } from "@/models/Experience"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { experienceId, date, time, quantity, subtotal, taxes, discount } = body

    const JWT_SECRET = process.env.JWT_SECRET || ""
    const cookie = (request as any).headers.get("cookie") || ""
    const token = cookie.split(";").find((c: string) => c.trim().startsWith("token="))?.split("=")?.[1]
    if (!token || !JWT_SECRET) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!experienceId || !date || !time || !quantity) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Resolve experience
    let experienceDoc: any = null
    if (mongoose.Types.ObjectId.isValid(String(experienceId))) {
      experienceDoc = await Experience.findById(experienceId).lean()
    }
    if (!experienceDoc) {
      return Response.json({ success: false, error: "Experience not found" }, { status: 404 })
    }

    // Atomically decrement slot availability if sufficient
    const slotUpdate = await Experience.updateOne(
      {
        _id: experienceDoc._id,
        slots: { $elemMatch: { date, time, available: { $gte: quantity } } },
      },
      { $inc: { "slots.$[elem].available": -quantity } },
      { arrayFilters: [{ "elem.date": date, "elem.time": time }] },
    )
    if (slotUpdate.modifiedCount === 0) {
      return Response.json({ success: false, error: "Slot not available" }, { status: 400 })
    }
    const user = await User.findById((payload as any).sub)
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const ref = `BK${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`
    const booking = await Booking.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      experienceId: experienceDoc._id,
      experienceTitle: experienceDoc.title,
      date,
      time,
      quantity,
      subtotal,
      taxes,
      discount,
      total: subtotal + taxes - discount,
      ref,
      status: "confirmed",
    })

    return Response.json({ success: true, data: {
      id: String(booking._id),
      ref: booking.ref,
      experienceId: booking.experienceId,
      experienceTitle: booking.experienceTitle,
      date: booking.date,
      time: booking.time,
      quantity: booking.quantity,
      subtotal: booking.subtotal,
      taxes: booking.taxes,
      discount: booking.discount,
      total: booking.total,
      status: booking.status,
      createdAt: booking.createdAt,
    } }, { status: 201 })
  } catch (e: any) {
    console.error("Booking error", e?.message)
    return Response.json({ success: false, error: e?.message || "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || ""
    const cookie = (request as any).headers.get("cookie") || ""
    const token = cookie.split(";").find((c: string) => c.trim().startsWith("token="))?.split("=")?.[1]
    if (!token || !JWT_SECRET) {
      return Response.json({ success: true, data: [] })
    }
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return Response.json({ success: true, data: [] })
    }
    await connectToDatabase()
    const bookings = await Booking.find({ userId: (payload as any).sub }).sort({ createdAt: -1 }).lean()
    return Response.json({ success: true, data: bookings.map(b => ({
      id: String(b._id),
      ref: b.ref,
      experienceId: b.experienceId,
      experienceTitle: b.experienceTitle,
      date: b.date,
      time: b.time,
      quantity: b.quantity,
      subtotal: b.subtotal,
      taxes: b.taxes,
      discount: b.discount,
      total: b.total,
      status: b.status,
      createdAt: b.createdAt,
    })) })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
