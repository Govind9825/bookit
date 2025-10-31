"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type MeUser = { id: string; name: string; email: string; role: "user" | "owner" } | null

export default function Header() {
  const router = useRouter()
  const [me, setMe] = useState<MeUser>(null)
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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

  function runSearch() {
    const q = searchTerm.trim()
    setMobileOpen(false)
    if (!q) {
      router.push("/")
      return
    }
    router.push(`/?q=${encodeURIComponent(q)}`)
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
        <div className="flex-1 hidden md:flex items-center justify-center mx-4">
          <input
            type="text"
            placeholder="Search experiences"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
            className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-gray-50"
          />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={runSearch} className="bg-primary text-secondary px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition">
            Search
          </button>
          {me ? (
            <div className="flex items-center gap-3">
              <Link href="/my-bookings" className="px-4 py-2 border rounded hover:bg-gray-50">
                My bookings
              </Link>
              {me.role === "owner" && (
                <Link href="/manage-experiences" className="px-4 py-2 border rounded hover:bg-gray-50">Manage</Link>
              )}
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

        <button
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-border rounded-lg"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block w-5 h-0.5 bg-secondary relative">
            <span className={`absolute block w-5 h-0.5 bg-secondary -top-1.5 transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`absolute block w-5 h-0.5 bg-secondary top-1.5 transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <input
              type="text"
              placeholder="Search experiences"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch() }}
              className="w-full px-4 py-2 border border-border rounded-lg bg-gray-50"
            />
            <button onClick={runSearch} className="w-full bg-primary text-secondary px-4 py-2 rounded-lg font-semibold">
              Search
            </button>
            {me ? (
              <div className="flex flex-col gap-2">
                <Link href="/my-bookings" className="px-4 py-2 border rounded hover:bg-gray-50">
                  My bookings
                </Link>
                {me.role === 'owner' && (
                  <Link href="/manage-experiences" className="px-4 py-2 border rounded hover:bg-gray-50">Manage</Link>
                )}
                <span className="text-sm">Hi, {me.name}</span>
                <button
                  onClick={() => { setMobileOpen(false); onLogout() }}
                  disabled={loading}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/sign-in" className="px-4 py-2 border rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
