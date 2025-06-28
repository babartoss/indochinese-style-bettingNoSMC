import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendFrameNotification } from '~/lib/notifs';
import { sendNeynarFrameNotification } from '~/lib/neynar';

const requestSchema = z.object({
  fid: z.number(),
  title: z.string().max(32),
  body: z.string().max(128),
});

export async function POST(request: NextRequest) {
  const neynarEnabled = !!process.env.NEYNAR_API_KEY;

  try {
    const requestJson = await request.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (!requestBody.success) {
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

    if (sendResult.result === 'error') {
      let errorMessage = 'Failed to send notification';
      if (sendResult.error instanceof Error) {
        errorMessage = sendResult.error.message;
      } else if (sendResult.error) {
        errorMessage = JSON.stringify(sendResult.error);
      }
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    } else if (sendResult.result === 'rate_limit') {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    } else if (sendResult.result === 'no_token') {
      return NextResponse.json(
        { success: false, error: 'No notification token found' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing notification request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}