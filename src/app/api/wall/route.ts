import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams! } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const space = await db.space.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      headline: true,
      themeColor: true,
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
