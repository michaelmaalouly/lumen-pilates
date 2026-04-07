import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { class: { include: { instructor: true } } },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { classId } = await req.json();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const cls = await tx.class.findUnique({
        where: { id: classId },
        include: { _count: { select: { bookings: { where: { status: "CONFIRMED" } } } } },
      });
      if (!cls) throw new Error("Class not found");
      if (cls.startsAt < new Date()) throw new Error("Class already started");

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");
      if (user.credits < 1) throw new Error("Not enough credits");

      const status =
        cls._count.bookings >= cls.capacity ? "WAITLIST" : "CONFIRMED";

      const booking = await tx.booking.create({
        data: { userId, classId, status },
      });

      if (status === "CONFIRMED") {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
        });
      }
      return booking;
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Booking failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
