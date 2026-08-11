import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const spaces = await db.space.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { testimonials: true } },
    },
  });

  return NextResponse.json({ spaces });
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name, headline, themeColor } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Space name is required" },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    const space = await db.space.create({
      data: {
        name,
        slug,
        headline: headline || null,
        themeColor: themeColor || "#10b981",
        userId: user.id,
      },
    });

    return NextResponse.json({ space });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create space" },
      { status: 500 }
    );
  }
}
