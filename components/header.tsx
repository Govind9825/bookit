"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type MeUser = { id: string; name: string; email: string; role: "user" | "owner" } | null

export default function Header() {
  const router = useRouter()
  const [me, setMe] = useState<MeUser>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        if (!active) return
        setMe(data.user || null)
      } catch {
        if (!active) return
        setMe(null)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  async function onLogout() {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setMe(null)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="bg-white border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">HD</span>
          </div>
          <span className="font-bold text-secondary">highway delite</span>
        </Link>
        <input
          type="text"
          placeholder="Search experiences"
          className="w-64 mx-8 px-4 py-2 border border-border rounded-lg bg-gray-50"
        />
        <div className="flex items-center gap-4">
          <button className="bg-primary text-secondary px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition">
            Search
          </button>
          {me ? (
            <div className="flex items-center gap-3">
              <Link href="/my-bookings" className="px-4 py-2 border rounded hover:bg-gray-50">
                My bookings
              </Link>
              <span className="text-sm">Hi, {me.name}</span>
              <button
                onClick={onLogout}
                disabled={loading}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="px-4 py-2 border rounded hover:bg-gray-50">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
