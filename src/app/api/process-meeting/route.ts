import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { processingMeeting } from "~/lib/assembly";
import { db } from "~/server/db";

const bodyParser = z.object({
  meetingUrl: z.string(),
  meetingId: z.string(),
});

export const maxDuration = 300; // 5 minutes

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = bodyParser.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { meetingUrl, meetingId } = validation.data;
    const { summaries } = await processingMeeting(meetingUrl);

    await db.issue.createMany({
      data: summaries.map((summary) => ({
        start: summary.start,
        end: summary.end,
        gist: summary.gist,
        headline: summary.headline,
        summary: summary.summary,
        meetingId,
      })),
    });

    await db.meeting.update({
      where: {
        id: meetingId,
      },
      data: {
        status: "COMPLETED",
        name: summaries[0]!.headline,
      },
    });

    return NextResponse.json({ success: true, message: "Meeting Processed" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
