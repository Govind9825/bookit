"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/header"
import RouteLoader from "@/components/route-loader"

interface Experience {
  id: string | number
  title: string
  price: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const experienceId = (searchParams.get("experienceId") || "1")
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
    return <RouteLoader force />
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
      // 1) Create Razorpay order (amount in paise)
      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: `exp_${String(experienceId).slice(0,10)}_${Date.now().toString().slice(-6)}` }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || "Payment initialization failed")
        setLoading(false)
        return
      }

      // 2) Load Razorpay script if not present
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script")
          s.src = "https://checkout.razorpay.com/v1/checkout.js"
          s.onload = () => resolve()
          s.onerror = () => reject(new Error("Razorpay SDK failed to load"))
          document.body.appendChild(s)
        })
      }

      // 3) Open Razorpay checkout
      const rzp = new (window as any).Razorpay({
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "BookIt",
        description: experience.title,
        order_id: orderData.data.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#fcd34d" },
        handler: async (resp: any) => {
          try {
            // 4) Verify signature server-side
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok || !verifyData.success) {
              setError("Payment verification failed")
              setLoading(false)
              return
            }

            // 5) Create booking after successful payment
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
          } catch (e: any) {
            setError(e?.message || "Payment failed")
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      })
      rzp.open()
    } catch (e: any) {
      setError(e?.message || "Failed to complete payment")
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
            <div className="bg-gray-100 border border-border rounded-lg p-6">
              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={userName}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-200 border border-border rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    className="w-full bg-gray-200 px-4 py-2 border border-border rounded-lg bg-gray-100"
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
                    className="flex-1 bg-gray-200 px-4 py-2 border border-border rounded-lg bg-gray-100"
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
            <div className="bg-gray-100 border border-border rounded-lg p-6 sticky top-8">
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
