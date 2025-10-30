import { checkSlotAvailability, bookSlot, getExperienceById } from "@/lib/db"
import { connectToDatabase } from "@/lib/mongodb"
import { Booking } from "@/models/Booking"
import { User } from "@/models/User"
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

    // Check if experience exists
    const experience = getExperienceById(experienceId)
    if (!experience) {
      return Response.json({ success: false, error: "Experience not found" }, { status: 404 })
    }

    // Check slot availability
    if (!checkSlotAvailability(experienceId, date, time, quantity)) {
      return Response.json({ success: false, error: "Slot not available" }, { status: 400 })
    }

    // Book the slot
    const booked = bookSlot(experienceId, date, time, quantity)
    if (!booked) {
      return Response.json({ success: false, error: "Failed to book slot" }, { status: 400 })
    }

    await connectToDatabase()
    const user = await User.findById((payload as any).sub)
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const ref = `BK${Math.random().toString(36).substring(2, 6).toUpperCase()}${Date.now().toString().slice(-4)}`
    const booking = await Booking.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      experienceId,
      experienceTitle: experience.title,
      date,
      time,
      quantity,
      subtotal,
      taxes,
      discount,
      total: subtotal + taxes - discount,
      ref,
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
      createdAt: booking.createdAt,
    } }, { status: 201 })
  } catch {
    console.error("Booking error")
    return Response.json({ success: false, error: "Failed to create booking" }, { status: 500 })
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
      createdAt: b.createdAt,
    })) })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
