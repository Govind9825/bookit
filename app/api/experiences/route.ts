import { getExperiences } from "@/lib/db"

export async function GET() {
  try {
    const experiences = getExperiences()
    return Response.json({ success: true, data: experiences })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch experiences" }, { status: 500 })
  }
}
