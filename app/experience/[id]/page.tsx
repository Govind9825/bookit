"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import RouteLoader from "@/components/route-loader"
import Image from "next/image"

interface Experience {
  id: string | number
  title: string
  description: string
  image: string
  price: number
  location: string
  slots: Array<{ date: string; time: string; available: number }>
  dates: string[]
  about: string
}

export default function ExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const idParam = params.id as string

  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/experience-detail/${idParam}`, { cache: "no-store" })
        const data = await res.json()
        if (data.success) {
          const exp = data.data.experience
          setExperience({ ...(exp as any), id: (exp as any)._id ?? idParam })
          setSelectedDate(exp.dates?.[0] ?? null)
          setSelectedTime(null)
          setIsLoggedIn(!!data.data.user)
        }
      } catch (error) {
        console.error("Failed to fetch experience detail:", error)
      } finally {
        setLoading(false)
      }
    })()
  }, [idParam])

  const timesForSelectedDate = selectedDate
    ? (experience?.slots || []).filter((s) => s.date === selectedDate)
    : []

  const selectedSlot = selectedTime
    ? timesForSelectedDate.find((s) => s.time === selectedTime) || null
    : null

  useEffect(() => {
    if (selectedSlot && quantity > selectedSlot.available) {
      setQuantity(Math.max(1, selectedSlot.available))
    }
  }, [selectedSlot?.available, selectedTime])

  if (loading) return <RouteLoader force />
  if (!experience) return <div className="text-center py-8">Experience not found</div>

  const imageSrc = experience.image || "/placeholder.svg"
  const allowedHosts = [
    "images.unsplash.com",
    "unsplash.com",
    "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    "public.blob.vercel-storage.com",
  ]
  let useNextImage = false
  try {
    const u = new URL(imageSrc as string)
    useNextImage = allowedHosts.includes(u.hostname)
  } catch {
    useNextImage = false
  }

  const handleBooking = () => {
    if (!isLoggedIn) {
      router.push("/sign-in")
      return
    }
    if (!selectedTime) {
      alert("Please select a time slot")
      return
    }
    router.push(
      `/checkout?experienceId=${experience.id}&date=${selectedDate}&time=${selectedTime}&quantity=${quantity}`,
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary mb-6 hover:text-primary"
        >
          <span>←</span>
          <span>Details</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 sticky top-20">
            <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
              {useNextImage ? (
                <Image src={imageSrc} alt={experience.title} fill className="object-cover" />
              ) : (
                <img src={imageSrc} alt={experience.title} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="p-3 rounded-lg mb-4">
              <h2 className="text-xl font-bold text-secondary mb-1">{experience.title}</h2>
              <p className="text-secondary text-sm">{experience.description}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Choose date</h3>
              <div className="flex gap-2 flex-wrap">
                {experience.dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      selectedDate === date
                        ? "bg-primary text-secondary"
                        : "border-2 border-gray-200 text-foreground hover:bg-gray-300"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Choose time</h3>
              <div className="flex gap-2 flex-wrap">
                {timesForSelectedDate.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available > 0 && setSelectedTime(slot.time)}
                    disabled={slot.available === 0}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      selectedTime === slot.time
                        ? "bg-accent text-white"
                        : slot.available === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "border-2 border-gray-200 text-foreground hover:bg-gray-100"
                    }`}
                  >
                    {slot.time}
                    {slot.available === 0 && <span className="text-xs ml-1">Sold out</span>}
                    {slot.available > 0 && (
                      <span
                        className={`text-xs ml-1 ${slot.available >= 0 ? "text-orange-600" : "text-gray-600"}`}
                      >
                        {slot.available} left
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">About</h3>
              <p className="text-foreground bg-gray-100 p-3 rounded-lg text-sm">{experience.about}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-100 border border-border rounded-lg p-4 sticky top-20">
              <div className="mb-4">
                <p className="text-xs text-muted mb-1">Starts at</p>
                <p className="text-2xl font-bold text-foreground">₹{experience.price}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted mb-1">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-border rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="font-bold">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxAvail = selectedSlot ? selectedSlot.available : 1
                      setQuantity(Math.min(quantity + 1, Math.max(1, maxAvail)))
                    }}
                    disabled={!selectedSlot || quantity >= (selectedSlot?.available || 1)}
                    className="w-8 h-8 border border-border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  {selectedSlot ? `${selectedSlot.available} available for this time` : "Select a time to see availability"}
                </p>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">₹{experience.price * quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Taxes</span>
                  <span className="font-semibold">₹{Math.round(experience.price * quantity * 0.06)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  ₹{Math.round(experience.price * quantity + experience.price * quantity * 0.06)}
                </span>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-gray-300 text-foreground py-2.5 rounded-lg font-semibold hover:bg-gray-400 transition text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
