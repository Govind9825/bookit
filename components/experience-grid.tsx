"use client"

import { experiences } from "@/data/experiences"
import ExperienceCard from "./experience-card"

export default function ExperienceGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  )
}
