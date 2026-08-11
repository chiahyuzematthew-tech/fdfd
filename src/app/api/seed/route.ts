import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const existing = await db.user.findUnique({
      where: { email: "demo@kudos.app" },
    });

    if (existing) {
      return NextResponse.json({ message: "Seed data already exists" });
    }

    const hashedPassword = await bcrypt.hash("demo123", 10);
    const user = await db.user.create({
      data: {
        email: "demo@kudos.app",
        name: "Demo User",
        password: hashedPassword,
      },
    });

    const space = await db.space.create({
      data: {
        name: "Kudos Demo",
        slug: "kudos-demo",
        headline: "See what our customers are saying",
        themeColor: "#10b981",
        userId: user.id,
      },
    });

    const testimonials = [
      {
        spaceId: space.id,
        status: "approved",
        customerName: "Sarah Chen",
        customerTitle: "CEO",
        customerCompany: "TechFlow",
        rating: 5,
        textContent:
          "This product has completely transformed how we collect customer feedback. The video testimonials are incredibly powerful for building trust with new clients.",
      },
      {
        spaceId: space.id,
        status: "approved",
        customerName: "Marcus Johnson",
        customerTitle: "Marketing Director",
        customerCompany: "GrowthPulse",
        rating: 5,
        textContent:
          "We switched from Testimonial.to and haven't looked back. The Wall of Love embed looks stunning on our landing page. Our conversion rate jumped 23%!",
      },
      {
        spaceId: space.id,
        status: "approved",
        customerName: "Emily Rodriguez",
        customerTitle: "Founder",
        customerCompany: "StartupKit",
        rating: 4,
        textContent:
          "Setting up was a breeze. Had our first video testimonial within 10 minutes of creating a space. The zero-friction recording experience is brilliant.",
      },
      {
        spaceId: space.id,
        status: "approved",
        customerName: "David Park",
        customerTitle: "Product Manager",
        customerCompany: "CloudNine",
        rating: 5,
        textContent:
          "The white-label capability is exactly what we needed. Our clients think it's our own platform. Amazing value for the price.",
      },
      {
        spaceId: space.id,
        status: "pending",
        customerName: "Lisa Thompson",
        customerTitle: "Designer",
        customerCompany: "PixelPerfect",
        rating: 5,
        textContent:
          "Beautiful UI, clean code, and the masonry layout for the Wall of Love is gorgeous. Highly recommend for any SaaS looking to build social proof.",
      },
      {
        spaceId: space.id,
        status: "approved",
        customerName: "Alex Kim",
        customerTitle: "CTO",
        customerCompany: "DataBridge",
        rating: 5,
        textContent:
          "Self-hosted and no monthly fees. We own the code, we own the data. This is how SaaS tools should be built. Full resale rights? Incredible deal.",
        videoUrl: null,
      },
    ];

    await db.testimonial.createMany({ data: testimonials });

    return NextResponse.json({
      message: "Seed data created successfully",
      user: { email: "demo@kudos.app", password: "demo123" },
      space: { slug: space.slug },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Seed failed" },
      { status: 500 }
    );
  }
}
