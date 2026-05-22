import { NextRequest, NextResponse } from "next/server";
import { RankingUseCases } from "@/application/rankings/ranking-use-cases";

export async function GET(request: NextRequest) {
  const seasonId = request.nextUrl.searchParams.get("seasonId");
  if (!seasonId) {
    return NextResponse.json({ success: false, error: "Missing seasonId." }, { status: 400 });
  }

  try {
    const ranking = await RankingUseCases.getLiveRanking(seasonId);
    return NextResponse.json({ success: true, ranking });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
