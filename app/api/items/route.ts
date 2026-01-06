import { getAllItems } from "@/lib/items";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await getAllItems();
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
