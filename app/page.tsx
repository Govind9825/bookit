import Header from "@/components/header"
import ExperienceGrid from "@/components/experience-grid"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<div className="py-12 text-center text-sm text-muted">Loading experiences…</div>}>
          <ExperienceGrid />
        </Suspense>
      </div>
    </main>
  )
}
