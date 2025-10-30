"use client"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function RouteLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (lastPathRef.current === null) {
      // first render, do not show
      lastPathRef.current = pathname
      return
    }
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname
      setVisible(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 1000)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex items-center gap-3">
        <span className="inline-block h-8 w-8 rounded-full border-4 border-gray-300 border-t-gray-900 animate-spin" />
        <span className="text-gray-900 font-medium">Loading...</span>
      </div>
    </div>
  )
}


