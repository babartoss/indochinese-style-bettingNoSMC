import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendFrameNotification } from '~/lib/notifs';
import { sendNeynarFrameNotification } from '~/lib/neynar';

const requestSchema = z.object({
  fid: z.number(),
  title: z.string(),
  body: z.string(),
});

export async function POST(request: NextRequest) {
  const neynarEnabled = process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID;

  const requestJson = await request.json();
  const requestBody = requestSchema.safeParse(requestJson);

  if (requestBody.success === false) {
    return NextResponse.json(
      { success: false, errors: requestBody.error.errors },
      { status: 400 }
    );
  }

  const { fid, title, body } = requestBody.data;

  const sendNotification = neynarEnabled ? sendNeynarFrameNotification : sendFrameNotification;
  const sendResult = await sendNotification({
    fid: Number(fid),
    title,
    body,
  });

  if (sendResult.state === "error") {
    return NextResponse.json(
      { success: false, error: sendResult.error },
      { status: 500 }
    );
  } else if (sendResult.state === "rate_limit") {
    return NextResponse.json(
      { success: false, error: "Rate limited" },
      { status: 429 }
    );
  }

  return NextResponse.json({ success: true });
}