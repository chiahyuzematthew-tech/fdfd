import { cookies } from "next/headers";
import { db } from "@/lib/db";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("kudos_session");

  if (!sessionCookie?.value) return null;

  try {
    const session = JSON.parse(sessionCookie.value) as SessionUser;
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    return null;
  }
}
