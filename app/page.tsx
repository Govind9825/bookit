import Header from "@/components/header"
import ExperienceGrid from "@/components/experience-grid"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ExperienceGrid />
      </div>
    </main>
  )
}
