"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";

type Experience = {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  image: string;
  price: number;
  location: string;
  about: string;
  dates: string[];
  slots: { time: string; available: number }[];
};

export default function ManageExperiencesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Experience>({
    title: "",
    description: "",
    image: "",
    price: 0,
    location: "",
    about: "",
    dates: [],
    slots: [],
  });
  const [dateInput, setDateInput] = useState<string>("");
  const [seats0700, setSeats0700] = useState<number>(4);
  const [seats0900, setSeats0900] = useState<number>(4);
  const [seats1100, setSeats1100] = useState<number>(4);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // verify owner
      const me = await fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json());
      if (!me?.user || me.user.role !== "owner") {
        router.push("/sign-in");
        return;
      }
      const res = await fetch("/api/experiences", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setItems(data.data);
      setLoading(false);
    })();
  }, [router]);

  function resetForm() {
    setForm({ title: "", description: "", image: "", price: 0, location: "", about: "", dates: [], slots: [] });
    setEditingIdx(null);
    setDateInput("");
    setSeats0700(4); setSeats0900(4); setSeats1100(4);
  }

  function addDate() {
    if (!dateInput) return;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return;
    const label = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).replace(",", "");
    if (!form.dates.includes(label)) {
      setForm({ ...form, dates: [...form.dates, label] });
    }
    setDateInput("");
  }

  function removeDate(label: string) {
    setForm({ ...form, dates: form.dates.filter((x) => x !== label) });
  }

  async function save() {
    setError(null);
    const payload = { ...form };
    // Build slots from selected dates and seat inputs
    const times = [
      { time: "07:00 am", available: seats0700 },
      { time: "09:00 am", available: seats0900 },
      { time: "11:00 am", available: seats1100 },
    ];
    payload.slots = payload.dates.flatMap((date) =>
      times.map((t) => ({ date, time: t.time, available: Number(t.available) || 0 })),
    );

    const method = editingIdx === null ? "POST" : "PUT";
    const id = (form as any)._id || (form as any).id;
    const url = editingIdx === null ? "/api/experiences" : `/api/experiences/${id}`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to save");
      return;
    }
    // refresh list
    const list = await fetch("/api/experiences", { cache: "no-store" }).then((r) => r.json());
    setItems(list.data || []);
    resetForm();
  }

  async function remove(idx: number) {
    const id = (items[idx] as any)._id || items[idx].id;
    const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
    if (res.ok) {
      const list = await fetch("/api/experiences", { cache: "no-store" }).then((r) => r.json());
      setItems(list.data || []);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Manage experiences</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white border rounded p-4 space-y-3">
              <input placeholder="Title" className="w-full border rounded px-3 py-2" value={form.title}
                     onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input placeholder="Image URL" className="w-full border rounded px-3 py-2" value={form.image}
                     onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <input placeholder="Location" className="w-full border rounded px-3 py-2" value={form.location}
                     onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input placeholder="Price" type="number" className="w-full border rounded px-3 py-2" value={form.price}
                     onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              <textarea placeholder="Description" className="w-full border rounded px-3 py-2" value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <textarea placeholder="About" className="w-full border rounded px-3 py-2" value={form.about}
                        onChange={(e) => setForm({ ...form, about: e.target.value })} />
              <div>
                <label className="block text-sm mb-1">Add date</label>
                <div className="flex gap-2">
                  <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="w-full border rounded px-3 py-2" />
                  <button type="button" onClick={addDate} className="px-3 py-2 border rounded">Add</button>
                </div>
                {form.dates.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.dates.map((d) => (
                      <span key={d} className="px-2 py-1 bg-gray-100 border rounded text-sm flex items-center gap-2">
                        {d}
                        <button type="button" onClick={() => removeDate(d)} className="text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm mb-1">Seats per time</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">07:00</span>
                    <input type="number" min={0} className="w-full border rounded px-2 py-1" value={seats0700} onChange={(e) => setSeats0700(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">09:00</span>
                    <input type="number" min={0} className="w-full border rounded px-2 py-1" value={seats0900} onChange={(e) => setSeats0900(Number(e.target.value))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">11:00</span>
                    <input type="number" min={0} className="w-full border rounded px-2 py-1" value={seats1100} onChange={(e) => setSeats1100(Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={save} className="bg-black text-white px-4 py-2 rounded">
                  {editingIdx === null ? "Add" : "Save"}
                </button>
                {editingIdx !== null && (
                  <button onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((it, idx) => (
                <div key={idx} className="border rounded p-4 space-y-1">
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm text-gray-600">{it.location} • ₹{it.price}</div>
                  <div className="text-sm line-clamp-2">{it.description}</div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setEditingIdx(idx + 1); setForm(it as any); }} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => remove(idx)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


