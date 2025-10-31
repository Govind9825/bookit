"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ExperienceCard from "./experience-card"
import RouteLoader from "@/components/route-loader"

type Exp = {
  id?: number
  title: string
  description: string
  image: string
  price: number
  location: string
  about: string
  dates: string[]
  slots: Array<{ date: string; time: string; available: number }>
}

export default function ExperienceGrid() {
  const [items, setItems] = useState<Exp[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const q = (searchParams.get("q") || "").trim()

  useEffect(() => {
    const load = async () => {
      try {
        const url = q ? `/api/experiences?q=${encodeURIComponent(q)}` : "/api/experiences"
        let res = await fetch(url, { cache: "no-store" })
        let data = await res.json()
        if (!data.success || data.data.length === 0) {
          await fetch("/api/experiences/seed", { method: "POST" })
          res = await fetch(url, { cache: "no-store" })
          data = await res.json()
        }
        setItems(data.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [q])

  if (loading) return <RouteLoader force />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((experience, idx) => (
        <ExperienceCard key={idx} experience={experience as any} />
      ))}
    </div>
  )
}
