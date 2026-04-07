import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewClassForm from "./NewClassForm";
import DeleteClass from "./DeleteClass";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/");

  const [classes, instructors] = await Promise.all([
    prisma.class.findMany({
      orderBy: { startsAt: "asc" },
      include: {
        instructor: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
      },
    }),
    prisma.instructor.findMany(),
  ]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-sm underline">← Back</Link>
      <h1 className="text-2xl font-bold mt-4">Admin</h1>

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Add class</h2>
        <NewClassForm instructors={instructors} />
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All classes</h2>
        <ul className="space-y-2">
          {classes.map((c) => (
            <li key={c.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(c.startsAt).toLocaleString()} · {c.instructor.name} · {c._count.bookings}/{c.capacity}
                </div>
              </div>
              <DeleteClass id={c.id} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
