"use client";
import { useEffect, useState } from "react";
import Header from "@/components/header";

type Booking = {
  id: string;
  ref: string;
  experienceTitle: string;
  date: string;
  time: string;
  quantity: number;
  total: number;
  createdAt: string;
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">My bookings</h1>
        {loading ? (
          <p>Loading...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.experienceTitle}</div>
                  <div className="text-sm text-gray-600">{b.date} at {b.time} • x{b.quantity}</div>
                  <div className="text-xs text-gray-500">Ref: {b.ref}</div>
                </div>
                <div className="font-semibold">₹{b.total}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}


