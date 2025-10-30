import { connectToDatabase } from "@/lib/mongodb"
import { Experience } from "@/models/Experience"
import { experiences as seed } from "@/data/experiences"
import mongoose from "mongoose"

function formatNextFiveDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 5; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const fmt = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(",",
      "",
    )
    dates.push(fmt)
  }
  return dates
}

function defaultTimes(): string[] {
  return ["07:00 am", "09:00 am", "11:00 am"]
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connectToDatabase()

    if (mongoose.Types.ObjectId.isValid(id)) {
      let exp: any = await Experience.findById(id).lean()
      if (!exp) return Response.json({ success: false, error: "Experience not found" }, { status: 404 })
      if (!exp.dates || exp.dates.length === 0 || !exp.slots || exp.slots.length === 0) {
        const dates = formatNextFiveDates()
        const slots = dates.flatMap((date) => defaultTimes().map((time) => ({ date, time, available: 4 })))
        await Experience.updateOne({ _id: exp._id }, { $set: { dates, slots } })
        exp = await Experience.findById(id).lean()
      }
      return Response.json({ success: true, data: exp })
    }

    const numericId = Number.parseInt(id)
    const base = seed.find((e) => e.id === numericId)
    if (!base) return Response.json({ success: false, error: "Experience not found" }, { status: 404 })

    let exp: any = await Experience.findOne({ title: base.title }).lean()
    if (!exp) {
      const dates = formatNextFiveDates()
      const slots = dates.flatMap((date) => defaultTimes().map((time) => ({ date, time, available: 4 })))
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
      const slots = dates.flatMap((date) => defaultTimes().map((time) => ({ date, time, available: 4 })))
      await Experience.updateOne({ _id: exp._id }, { $set: { dates, slots } })
      exp = await Experience.findOne({ title: base.title }).lean()
    }

    return Response.json({ success: true, data: exp })
  } catch (e) {
    return Response.json({ success: false, error: "Failed to fetch experience" }, { status: 500 })
  }
}
