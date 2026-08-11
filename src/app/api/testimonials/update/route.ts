import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const space = await db.space.findFirst({
      where: { id: testimonial.spaceId, userId: user.id },
    });
    if (!space) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await db.testimonial.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Testimonial ID required" },
        { status: 400 }
      );
    }

    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const space = await db.space.findFirst({
      where: { id: testimonial.spaceId, userId: user.id },
    });
    if (!space) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
