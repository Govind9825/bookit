"use client"

import { useEffect, useState } from "react"
import ExperienceCard from "./experience-card"

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

  useEffect(() => {
    const load = async () => {
      try {
        let res = await fetch("/api/experiences", { cache: "no-store" })
        let data = await res.json()
        if (!data.success || data.data.length === 0) {
          await fetch("/api/experiences/seed", { method: "POST" })
          res = await fetch("/api/experiences", { cache: "no-store" })
          data = await res.json()
        }
        setItems(data.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="py-8">Loading...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((experience, idx) => (
        <ExperienceCard key={idx} experience={experience as any} />
      ))}
    </div>
  )
}
