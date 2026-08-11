import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;
    const spaceId = formData.get("spaceId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No video file" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "webm";
    const filename = `${spaceId || "upload"}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filepath = path.join(process.cwd(), "public", "uploads", filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const videoUrl = `/uploads/${filename}`;
    return NextResponse.json({ videoUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
