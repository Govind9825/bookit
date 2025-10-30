"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Image from "next/image"

interface Experience {
  id: number
  title: string
  description: string
  image: string
  price: number
  location: string
  slots: Array<{ time: string; available: number }>
  dates: string[]
  about: string
}

export default function ExperiencePage() {
  const params = useParams()
  const router = useRouter()
  const id = Number.parseInt(params.id as string)

  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/experiences/${id}`)
        const data = await res.json()
        if (data.success) {
          setExperience(data.data)
          setSelectedDate(data.data.dates[0])
        }
      } catch (error) {
        console.error("Failed to fetch experience:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperience()
  }, [id])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!experience) return <div className="text-center py-8">Experience not found</div>

  const handleBooking = () => {
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
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-secondary mb-6 hover:text-primary"
        >
          <span>←</span>
          <span>Details</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative h-96 w-full rounded-lg overflow-hidden border-4 border-accent mb-6">
              <Image
                src={experience.image || "/placeholder.svg"}
                alt={experience.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-primary p-4 rounded-lg mb-6">
              <h2 className="text-2xl font-bold text-secondary mb-2">{experience.title}</h2>
              <p className="text-secondary">{experience.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Choose date</h3>
              <div className="flex gap-2 flex-wrap">
                {experience.dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedDate === date
                        ? "bg-primary text-secondary"
                        : "bg-gray-200 text-foreground hover:bg-gray-300"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Choose time</h3>
              <div className="flex gap-2 flex-wrap">
                {experience.slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available > 0 && setSelectedTime(slot.time)}
                    disabled={slot.available === 0}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      selectedTime === slot.time
                        ? "bg-accent text-white"
                        : slot.available === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-200 text-foreground hover:bg-gray-300"
                    }`}
                  >
                    {slot.time}
                    {slot.available === 0 && <span className="text-xs ml-1">Sold out</span>}
                    {slot.available > 0 && <span className="text-xs ml-1 text-muted">{slot.available} left</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">About</h3>
              <p className="text-foreground bg-gray-100 p-4 rounded-lg">{experience.about}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-sm text-muted mb-1">Starts at</p>
                <p className="text-3xl font-bold text-foreground">₹{experience.price}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted mb-2">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-border rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">₹{experience.price * quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Taxes</span>
                  <span className="font-semibold">₹{Math.round(experience.price * quantity * 0.06)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">
                  ₹{Math.round(experience.price * quantity + experience.price * quantity * 0.06)}
                </span>
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-gray-300 text-foreground py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
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
