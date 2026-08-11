import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const spaceId = url.searchParams.get("spaceId");
  const status = url.searchParams.get("status");

  if (!spaceId) {
    return NextResponse.json(
      { error: "spaceId is required" },
      { status: 400 }
    );
  }

  const where: Record<string, unknown> = { spaceId };
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    where.status = status;
  }

  const testimonials = await db.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      spaceId,
      customerName,
      customerTitle,
      customerCompany,
      rating,
      textContent,
      videoUrl,
    } = body;

    if (!spaceId || !customerName) {
      return NextResponse.json(
        { error: "spaceId and customerName are required" },
        { status: 400 }
      );
    }

    const testimonial = await db.testimonial.create({
      data: {
        spaceId,
        customerName,
        customerTitle: customerTitle || null,
        customerCompany: customerCompany || null,
        rating: rating ? parseInt(rating) : null,
        textContent: textContent || null,
        videoUrl: videoUrl || null,
        status: "pending",
      },
    });

    return NextResponse.json({ testimonial });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
