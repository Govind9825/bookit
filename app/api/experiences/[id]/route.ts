import { getExperienceById } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const experience = getExperienceById(Number.parseInt(id))

    if (!experience) {
      return Response.json({ success: false, error: "Experience not found" }, { status: 404 })
    }

    return Response.json({ success: true, data: experience })
  } catch {
    return Response.json({ success: false, error: "Failed to fetch experience" }, { status: 500 })
  }
}
