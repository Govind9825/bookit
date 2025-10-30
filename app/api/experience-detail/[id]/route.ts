import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Experience } from "@/models/Experience"
import { experiences as seed } from "@/data/experiences"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const JWT_SECRET = process.env.JWT_SECRET || ""

function formatNextFiveDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 5; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    dates.push(d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(",", ""))
  }
  return dates
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectToDatabase()

    let exp: any = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      exp = await Experience.findById(id).lean()
      if (!exp) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 })
      if (!exp.dates || exp.dates.length === 0 || !exp.slots || exp.slots.length === 0) {
        const dates = formatNextFiveDates()
        const times = ["07:00 am", "09:00 am", "11:00 am"]
        const slots = dates.flatMap((date) => times.map((time) => ({ date, time, available: 4 })))
        await Experience.updateOne({ _id: exp._id }, { $set: { dates, slots } })
        exp = await Experience.findById(id).lean()
      }
    } else {
      const numericId = Number.parseInt(id)
      const base = seed.find((e) => e.id === numericId)
      if (!base) return NextResponse.json({ success: false, error: "Experience not found" }, { status: 404 })

      exp = await Experience.findOne({ title: base.title }).lean()
      if (!exp) {
        const dates = formatNextFiveDates()
        const times = ["07:00 am", "09:00 am", "11:00 am"]
        const slots = dates.flatMap((date) => times.map((time) => ({ date, time, available: 4 })))
        exp = (
          await Experience.create({
            title: base.title,
            description: base.description,
            image: base.image,
            price: base.price,
            location: base.location,
            about: base.about,
            dates,
            slots,
          })
        ).toObject()
      } else if (!exp.dates || exp.dates.length === 0 || !exp.slots || exp.slots.length === 0) {
        const dates = formatNextFiveDates()
        const times = ["07:00 am", "09:00 am", "11:00 am"]
        const slots = dates.flatMap((date) => times.map((time) => ({ date, time, available: 4 })))
        await Experience.updateOne({ _id: exp._id }, { $set: { dates, slots } })
        exp = await Experience.findOne({ title: base.title }).lean()
      }
    }

    // user info from cookie token
    let user: any = null
    if (JWT_SECRET) {
      const token = (request as any).headers
        .get("cookie")?.split(";")?.find((c: string) => c.trim().startsWith("token="))?.split("=")?.[1]
      if (token) {
        try {
          const payload: any = jwt.verify(token, JWT_SECRET)
          user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role }
        } catch {}
      }
    }

    return NextResponse.json({ success: true, data: { experience: exp, user } })
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch" }, { status: 500 })
  }
}


