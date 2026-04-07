"use client";
import { useRouter } from "next/navigation";

export default function DeleteClass({ id }: { id: string }) {
  const router = useRouter();
  async function del() {
    if (!confirm("Delete this class?")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Failed");
    router.refresh();
  }
  return <button onClick={del} className="text-red-600 text-sm underline">Delete</button>;
}
