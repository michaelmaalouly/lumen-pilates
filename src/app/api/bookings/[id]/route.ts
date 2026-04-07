import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking || booking.userId !== userId) throw new Error("Not found");
      if (booking.status === "CANCELLED") return;

      await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
      if (booking.status === "CONFIRMED") {
        await tx.user.update({
          where: { id: userId },
          data: { credits: { increment: 1 } },
        });
        // Promote first waitlisted
        const next = await tx.booking.findFirst({
          where: { classId: booking.classId, status: "WAITLIST" },
          orderBy: { createdAt: "asc" },
        });
        if (next) {
          const nextUser = await tx.user.findUnique({ where: { id: next.userId } });
          if (nextUser && nextUser.credits >= 1) {
            await tx.booking.update({
              where: { id: next.id },
              data: { status: "CONFIRMED" },
            });
            await tx.user.update({
              where: { id: next.userId },
              data: { credits: { decrement: 1 } },
            });
          }
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Cancel failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
