import { NextRequest, NextResponse } from "next/server";
import { recordScore } from "@/application/competition/use-cases/record-score";
import { ScoreInputSchema } from "@/application/competition/commands/record-score-command";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = ScoreInputSchema.parse(body);
    const result = await recordScore(payload, "api-handler");
    return NextResponse.json({ success: true, payload: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
