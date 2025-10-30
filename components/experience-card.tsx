"use client"

import Link from "next/link"
import Image from "next/image"
import type { Experience } from "@/data/experiences"

interface ExperienceCardProps {
  experience: Experience
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <Link href={`/experience/${experience.id}`}>
      <div className="border-2 border-accent rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        <div className="relative h-48 w-full">
          <Image src={experience.image || "/placeholder.svg"} alt={experience.title} fill className="object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground">{experience.title}</h3>
          <p className="text-sm text-muted mb-2">{experience.location}</p>
          <p className="text-sm text-foreground mb-4 line-clamp-2">{experience.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">From</p>
              <p className="font-bold text-foreground">₹{experience.price}</p>
            </div>
            <button className="bg-primary text-secondary px-4 py-2 rounded font-semibold hover:bg-primary-dark transition text-sm">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
