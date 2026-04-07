"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function cancel() {
    if (!confirm("Cancel this booking?")) return;
    setLoading(true);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={cancel} disabled={loading}
      className="text-sm text-red-600 underline disabled:opacity-50">
      {loading ? "..." : "Cancel"}
    </button>
  );
}
