"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"

interface Experience {
  id: number
  title: string
  price: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const experienceId = Number.parseInt(searchParams.get("experienceId") || "1")
  const date = searchParams.get("date") || ""
  const time = searchParams.get("time") || ""
  const quantity = Number.parseInt(searchParams.get("quantity") || "1")

  const [experience, setExperience] = useState<Experience | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const res = await fetch(`/api/experiences/${experienceId}`)
        const data = await res.json()
        if (data.success) {
          setExperience(data.data)
        }
      } catch {
        console.error("Failed to fetch experience")
      }
    }
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        if (data?.user) {
          setUserName(data.user.name)
          setUserEmail(data.user.email)
        } else {
          router.push("/sign-in")
        }
      } catch {
        router.push("/sign-in")
      }
    }

    fetchExperience()
    fetchMe()
  }, [experienceId])

  if (!experience) {
    return <div className="text-center py-8">Loading...</div>
  }

  const subtotal = experience.price * quantity
  const taxes = Math.round(subtotal * 0.06)
  const total = subtotal + taxes - discount

  const handleApplyPromo = async () => {
    try {
      setError("")
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      })
      const data = await res.json()
      if (data.success) {
        setDiscount(data.data.discount)
      } else {
        setError(data.error || "Invalid promo code")
      }
    } catch (err) {
      setError("Failed to validate promo code")
    }
  }

  const handlePayment = async () => {
    if (!agreed) {
      setError("Please fill all fields and agree to terms")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          date,
          time,
          quantity,
          subtotal,
          taxes,
          discount,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/result?bookingId=${data.data.id}&experience=${experience.title}&date=${date}&time=${time}`)
      } else {
        setError(data.error || "Booking failed")
      }
    } catch {
      setError("Failed to complete booking")
    } finally {
      setLoading(false)
    }
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
          <span>Checkout</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6">
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={userName}
                    readOnly
                    className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Promo code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-gray-100"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to the terms and safety policy
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-border rounded-lg p-6 sticky top-8">
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Experience</span>
                  <span className="font-semibold">{experience.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date</span>
                  <span className="font-semibold">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Time</span>
                  <span className="font-semibold">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Qty</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-border">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Taxes</span>
                  <span className="font-semibold">₹{taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">₹{total}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary text-secondary py-3 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay and Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
