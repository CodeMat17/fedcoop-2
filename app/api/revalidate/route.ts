import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { tags } = (await request.json()) as { tags?: unknown };
  if (!Array.isArray(tags)) return NextResponse.json({ ok: false }, { status: 400 });
  for (const tag of tags) if (typeof tag === "string") revalidateTag(tag, "max");
  return NextResponse.json({ ok: true });
}
