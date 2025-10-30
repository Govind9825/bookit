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
  }

  async function save() {
    setError(null);
    const payload = { ...form };
    // Simple normalization for dates and slots from comma text
    if (typeof (payload as any).datesText === "string") {
      payload.dates = ((payload as any).datesText as string).split(",").map((d) => d.trim()).filter(Boolean);
    }
    if (typeof (payload as any).slotsText === "string") {
      payload.slots = ((payload as any).slotsText as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ time: s.split("|")[0]?.trim() || "", available: Number(s.split("|")[1] || 0) }));
    }

    const method = editingIdx === null ? "POST" : "PUT";
    const url = editingIdx === null ? "/api/experiences" : `/api/experiences/${(editingIdx || 1).toString()}`;
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
    const res = await fetch(`/api/experiences/${idx + 1}`, { method: "DELETE" });
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
              <input placeholder="Dates (comma separated)" className="w-full border rounded px-3 py-2"
                     onChange={(e) => setForm({ ...form, dates: [], ...( { datesText: e.target.value } as any) })} />
              <input placeholder="Slots (e.g. 07:00 am|4, 09:00 am|2)" className="w-full border rounded px-3 py-2"
                     onChange={(e) => setForm({ ...form, slots: [], ...( { slotsText: e.target.value } as any) })} />
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


