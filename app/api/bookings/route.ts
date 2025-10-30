import { checkSlotAvailability, bookSlot, createBooking, getExperienceById } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { experienceId, date, time, quantity, fullName, email, subtotal, taxes, discount } = body

    // Validate required fields
    if (!experienceId || !date || !time || !quantity || !fullName || !email) {
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

    // Create booking record
    const booking = createBooking({
      experienceId,
      experienceTitle: experience.title,
      date,
      time,
      quantity,
      fullName,
      email,
      subtotal,
      taxes,
      discount,
      total: subtotal + taxes - discount,
    })

    return Response.json({ success: true, data: booking }, { status: 201 })
  } catch {
    console.error("Booking error")
    return Response.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return Response.json({ success: true, data: [] })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
