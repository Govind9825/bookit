"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"

export default function ResultPage() {
  const searchParams = useSearchParams()

  const bookingId = searchParams.get("bookingId") || "HUF56&SO"
  const experience = searchParams.get("experience") || "Experience"
  const date = searchParams.get("date") || ""
  const time = searchParams.get("time") || ""

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl text-white">✓</span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Booking Confirmed</h1>

        <p className="text-lg text-muted mb-8 text-center">
          Ref ID: <span className="font-semibold">{bookingId}</span>
        </p>

        <div className="bg-white border border-border rounded-lg p-8 max-w-md w-full mb-8">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted">Experience</span>
              <span className="font-semibold">{experience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date</span>
              <span className="font-semibold">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Time</span>
              <span className="font-semibold">{time}</span>
            </div>
          </div>
        </div>

        <Link href="/">
          <button className="bg-gray-300 text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition">
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  )
}
