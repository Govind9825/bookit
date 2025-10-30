"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";

type Booking = {
  id: string;
  ref: string;
  experienceTitle: string;
  date: string;
  time: string;
  quantity: number;
  total: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/bookings", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success) setBookings(data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onCancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
        router.push(`/cancel-result?bookingId=${data.data.ref}`);
      }
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">My bookings</h1>
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-gray-100 border border-border rounded-lg p-6 text-center">No bookings yet.</div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              // Robust date parsing: e.g., date="Oct 22", time="09:00 am"
              const [monStr, dayStr] = b.date.split(" ");
              const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
              const month = Math.max(0, months.indexOf(monStr));
              const day = Number.parseInt(dayStr, 10);
              const [t, mer] = b.time.split(" ");
              const [hh, mm] = t.split(":").map((n) => Number.parseInt(n, 10));
              let hours = hh % 12 + (mer?.toLowerCase() === "pm" ? 12 : 0);
              if (mer?.toLowerCase() === "am" && hh === 12) hours = 0;
              const bookingDate = new Date(new Date().getFullYear(), month, day, hours, mm);
              const isPast = bookingDate.getTime() < Date.now();
              return (
                <div key={b.id} className="bg-gray-100 border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{b.experienceTitle}</div>
                    <div className="text-sm text-muted">{b.date} at {b.time} • x{b.quantity}</div>
                    <div className="text-xs text-muted">Ref: {b.ref}</div>
                    {b.status === "cancelled" && <div className="text-xs mt-1 text-red-600">Cancelled</div>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold">₹{b.total}</div>
                    <button
                      onClick={() => onCancel(b.id)}
                      disabled={isPast || cancellingId === b.id || b.status === "cancelled"}
                      className="px-4 py-2 rounded bg-white border border-border hover:bg-gray-50 disabled:opacity-50"
                    >
                      {b.status === "cancelled" ? "Cancelled" : isPast ? "Completed" : cancellingId === b.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}


