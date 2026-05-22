import { NextRequest, NextResponse } from "next/server";
import { CulinaryScoreSubmissionSchema } from "@/application/scoring/scoring-command";
import { ScoringUseCases } from "@/application/scoring/scoring-use-cases";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = CulinaryScoreSubmissionSchema.parse(body);
    const result = await ScoringUseCases.submitScore(payload, "api-handler");
    return NextResponse.json({ success: true, payload: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
