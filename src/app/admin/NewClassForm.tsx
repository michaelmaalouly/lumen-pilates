"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Instructor = { id: string; name: string };

export default function NewClassForm({ instructors }: { instructors: Instructor[] }) {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [durationMin, setDurationMin] = useState(60);
  const [instructorId, setInstructorId] = useState(instructors[0]?.id ?? "");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startsAt, capacity, durationMin, instructorId }),
    });
    if (!res.ok) {
      alert("Failed");
      return;
    }
    setTitle("");
    setStartsAt("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3">
      <input className="border p-2 rounded col-span-2" placeholder="Title"
        value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="border p-2 rounded" type="datetime-local"
        value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
      <select className="border p-2 rounded"
        value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
        {instructors.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
      <input className="border p-2 rounded" type="number" placeholder="Capacity"
        value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
      <input className="border p-2 rounded" type="number" placeholder="Duration (min)"
        value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} />
      <button className="col-span-2 bg-black text-white p-2 rounded">Create</button>
    </form>
  );
}
