import { connectToDatabase } from "@/lib/mongodb"
import { Experience } from "@/models/Experience"
import { experiences as seed } from "@/data/experiences"

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

export async function POST() {
  try {
    await connectToDatabase()
    const dates = formatNextFiveDates()
    const times = ["07:00 am", "09:00 am", "11:00 am"]
    await Promise.all(
      seed.map(async (s) => {
        const slots = dates.flatMap((date) => times.map((time) => ({ date, time, available: 4 })))
        await Experience.findOneAndUpdate(
          { title: s.title },
          {
            $set: {
              description: s.description,
              image: s.image,
              price: s.price,
              location: s.location,
              about: s.about,
            },
            $setOnInsert: { dates, slots, title: s.title },
          },
          { upsert: true, new: true },
        )
      }),
    )
    const all = await Experience.find().lean()
    return Response.json({ success: true, data: all })
  } catch (e) {
    return Response.json({ success: false, error: "Failed to seed experiences" }, { status: 500 })
  }
}


