import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const classes = await prisma.class.findMany({
    where: { startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: {
      instructor: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const created = await prisma.class.create({
    data: {
      title: body.title,
      description: body.description,
      level: body.level ?? "ALL",
      startsAt: new Date(body.startsAt),
      durationMin: body.durationMin ?? 60,
      capacity: body.capacity ?? 10,
      instructorId: body.instructorId,
    },
  });
  return NextResponse.json(created);
}
