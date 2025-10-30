"use client"

import Link from "next/link"
import Image from "next/image"
// Accept items from API (Mongo) or local seed
type ExperienceLike = {
  id?: number | string
  _id?: string
  title: string
  description: string
  image: string
  price: number
  location: string
}

interface ExperienceCardProps { experience: ExperienceLike }

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const src = experience.image || "/placeholder.svg"
  const allowedHosts = [
    "images.unsplash.com",
    "unsplash.com",
    "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    "public.blob.vercel-storage.com",
  ]
  let useNextImage = false
  try {
    const u = new URL(src)
    useNextImage = allowedHosts.includes(u.hostname)
  } catch {
    useNextImage = false
  }
  return (
    <Link href={`/experience/${(experience.id as any) ?? (experience._id as any)}`}> 
      <div className="rounded-lg overflow-hidden border border-border hover:shadow-md transition cursor-pointer bg-white">
        <div className="relative h-48 w-full">
          {useNextImage ? (
            <Image src={src} alt={experience.title} fill className="object-cover" />
          ) : (
            // Fallback for arbitrary hosts not in Next/Image allowlist
            <img src={src} alt={experience.title} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="p-4 bg-gray-100">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{experience.title}</h3>
            <span className="text-xs bg-gray-300 text-secondary px-2 py-0.5 rounded border border-border">
              {experience.location}
            </span>
          </div>
          <div className="mb-3 rounded px-3 py-2">
            <p className="text-sm text-black line-clamp-2">{experience.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted leading-none mb-1">From</p>
              <p className="font-bold text-foreground">₹{experience.price}</p>
            </div>
            <span className="shrink-0">
              <button className="bg-primary text-secondary px-4 py-2 rounded font-semibold hover:bg-primary-dark transition text-sm">
                View Details
              </button>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
