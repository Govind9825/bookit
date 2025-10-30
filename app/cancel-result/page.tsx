"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"

function CancelBody() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || ""
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl text-white">✕</span>
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-2 text-center">Booking Cancelled</h1>
      <p className="text-lg text-muted mb-8 text-center">Ref ID: <span className="font-semibold">{bookingId}</span></p>
      <Link href="/my-bookings">
        <button className="bg-gray-300 text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-gray-400 transition">Back to My Bookings</button>
      </Link>
    </div>
  )
}

export default function CancelResultPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
        <CancelBody />
      </Suspense>
    </main>
  )
}


