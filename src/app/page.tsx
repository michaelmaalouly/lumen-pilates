import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import BookButton from "./BookButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const classes = await prisma.class.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: {
      instructor: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });

  const role = (session?.user as { role?: string } | undefined)?.role;

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            Lumen<span className="text-[var(--accent)]">.</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {session?.user ? (
              <>
                <Link href="/dashboard" className="hover:text-[var(--accent)]">Dashboard</Link>
                {role === "ADMIN" && (
                  <Link href="/admin" className="hover:text-[var(--accent)]">Admin</Link>
                )}
                <Link href="/api/auth/signout" className="btn-primary">Sign out</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-[var(--accent)]">Login</Link>
                <Link href="/signup" className="btn-primary">Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <p className="uppercase tracking-[0.2em] text-xs text-[var(--accent)] mb-4">
          Mindful movement
        </p>
        <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-5">
          Reserve your<br />pilates practice
        </h1>
        <p className="text-lg text-[var(--foreground)]/70 max-w-xl mx-auto">
          Choose from our weekly schedule of mat and reformer classes.
          Small groups, expert instructors, calm spaces.
        </p>
      </section>

      <main className="max-w-5xl mx-auto px-6 pb-20 w-full">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-3xl">Upcoming classes</h2>
          <span className="text-sm text-[var(--foreground)]/60">
            {classes.length} {classes.length === 1 ? "class" : "classes"}
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="card p-10 text-center text-[var(--foreground)]/60">
            No classes scheduled yet. Check back soon.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {classes.map((c) => {
              const spots = c.capacity - c._count.bookings;
              const full = spots <= 0;
              const date = new Date(c.startsAt);
              return (
                <li key={c.id} className="card p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[var(--accent)] mb-1">
                        {c.level}
                      </div>
                      <h3 className="font-serif text-2xl leading-tight">{c.title}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      full
                        ? "bg-[var(--muted)] text-[var(--foreground)]/60"
                        : "bg-[var(--accent)]/10 text-[var(--accent-dark)]"
                    }`}>
                      {full ? "Waitlist" : `${spots} left`}
                    </span>
                  </div>

                  <div className="text-sm text-[var(--foreground)]/70 space-y-1 mb-5">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {c.durationMin} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span>with {c.instructor.name}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {session?.user ? (
                      <BookButton classId={c.id} full={full} />
                    ) : (
                      <Link href="/login" className="btn-primary inline-block">
                        Sign in to book
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-[var(--foreground)]/60 text-center">
          © Lumen Pilates · Mindful movement, daily.
        </div>
      </footer>
    </>
  );
}
