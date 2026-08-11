import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams! } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  if (id) {
    const space = await db.space.findFirst({
      where: { id, userId: user.id },
      include: {
        testimonials: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    return NextResponse.json({ space });
  }

  if (slug) {
    const space = await db.space.findUnique({
      where: { slug },
      include: {
        testimonials: {
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 });
    }
    return NextResponse.json({ space });
  }

  return NextResponse.json({ error: "Provide id or slug" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams! } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Space ID required" }, { status: 400 });
  }

  const space = await db.space.findFirst({
    where: { id, userId: user.id },
  });

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 });
  }

  await db.space.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
