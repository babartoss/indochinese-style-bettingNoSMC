import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setUserNotificationDetails, deleteUserNotificationDetails } from '~/lib/kv';
import { sendFrameNotification } from '~/lib/notifs';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-neynar-signature');
    const secret = process.env.NEYNAR_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Missing NEYNAR_WEBHOOK_SECRET');
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }

    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (computedSignature !== signature) {
      console.error('Invalid signature');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const { fid, event, notificationDetails } = body;

    switch (event) {
      case 'frame_added':
        if (notificationDetails) {
          await setUserNotificationDetails(fid, notificationDetails);
          await sendFrameNotification({
            fid,
            title: 'Welcome to the App!',
            body: 'Your frame has been added successfully.',
          });
        } else {
          await deleteUserNotificationDetails(fid);
        }
        break;
      case 'frame_removed':
        await deleteUserNotificationDetails(fid);
        break;
      case 'notifications_enabled':
        if (notificationDetails) {
          await setUserNotificationDetails(fid, notificationDetails);
          await sendFrameNotification({
            fid,
            title: 'Notifications Enabled',
            body: 'You have enabled notifications for this app.',
          });
        }
        break;
      case 'notifications_disabled':
        await deleteUserNotificationDetails(fid);
        break;
      default:
        console.warn('Unsupported webhook event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}