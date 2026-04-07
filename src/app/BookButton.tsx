"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookButton({ classId, full }: { classId: string; full?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function book() {
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data.error ?? "Failed");
      return;
    }
    alert(data.status === "WAITLIST" ? "Added to waitlist" : "Booked! See you on the mat.");
    router.refresh();
  }

  return (
    <button onClick={book} disabled={loading} className="btn-primary w-full">
      {loading ? "..." : full ? "Join waitlist" : "Reserve spot"}
    </button>
  );
}
