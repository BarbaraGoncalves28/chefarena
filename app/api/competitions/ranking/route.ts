import { NextRequest, NextResponse } from "next/server";
import { getSeasonRanking } from "@/application/competition/use-cases/get-ranking";

export async function GET(request: NextRequest) {
  const seasonId = request.nextUrl.searchParams.get("seasonId");
  if (!seasonId) {
    return NextResponse.json({ success: false, error: "Missing seasonId." }, { status: 400 });
  }

  try {
    const ranking = await getSeasonRanking(seasonId);
    return NextResponse.json({ success: true, ranking });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
