import { connectToDatabase } from "@/lib/mongodb"
import { Experience } from "@/models/Experience"

export async function GET() {
  try {
    await connectToDatabase()
    const experiences = await Experience.find().sort({ createdAt: -1 }).lean()
    return Response.json({ success: true, data: experiences })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch experiences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const exists = await Experience.findOne({ title: body.title })
    if (exists) return Response.json({ success: true, data: exists })

    const dates: string[] = (body.dates && body.dates.length > 0)
      ? body.dates
      : (() => {
          const arr: string[] = []
          const now = new Date()
          for (let i = 0; i < 5; i++) {
            const d = new Date(now)
            d.setDate(now.getDate() + i)
            arr.push(d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(",", ""))
          }
          return arr
        })()

    const times = ["07:00 am", "09:00 am", "11:00 am"]
    const slots = dates.flatMap((date) => times.map((time) => ({ date, time, available: 4 })))

    const created = await Experience.create({ ...body, dates, slots })
    return Response.json({ success: true, data: created })
  } catch (e) {
    return Response.json({ success: false, error: "Failed to create experience" }, { status: 500 })
  }
}
