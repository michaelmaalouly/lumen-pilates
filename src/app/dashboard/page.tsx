import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CancelButton from "./CancelButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const bookings = await prisma.booking.findMany({
    where: { userId, status: { not: "CANCELLED" } },
    orderBy: { class: { startsAt: "asc" } },
    include: { class: { include: { instructor: true } } },
  });

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl">
            Lumen<span className="text-[var(--accent)]">.</span>
          </Link>
          <Link href="/api/auth/signout" className="text-sm hover:text-[var(--accent)]">Sign out</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 w-full">
        <Link href="/" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)]">← Back to classes</Link>

        <div className="mt-6 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-2">Your studio</p>
            <h1 className="font-serif text-4xl">Hello, {user?.name ?? "friend"}</h1>
          </div>
          <div className="card px-6 py-4 inline-flex items-center gap-3">
            <div className="text-xs uppercase tracking-wider text-[var(--foreground)]/60">Credits</div>
            <div className="font-serif text-3xl">{user?.credits ?? 0}</div>
          </div>
        </div>

        <h2 className="font-serif text-2xl mb-4">Upcoming bookings</h2>
        {bookings.length === 0 ? (
          <div className="card p-10 text-center text-[var(--foreground)]/60">
            No bookings yet. <Link href="/" className="text-[var(--accent)] underline">Browse classes →</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map((b) => {
              const date = new Date(b.class.startsAt);
              return (
                <li key={b.id} className="card p-5 flex items-center justify-between">
                  <div>
                    <div className="font-serif text-xl">{b.class.title}</div>
                    <div className="text-sm text-[var(--foreground)]/70 mt-1">
                      {date.toLocaleString(undefined, { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} · {b.class.instructor.name}
                    </div>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                      b.status === "CONFIRMED"
                        ? "bg-[var(--accent)]/10 text-[var(--accent-dark)]"
                        : "bg-[var(--muted)] text-[var(--foreground)]/60"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <CancelButton id={b.id} />
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
