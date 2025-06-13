import { kv } from '@vercel/kv';
import { APP_URL } from './constants';

interface NotificationDetails {
  url: string;
  token: string;
}

export type SendFrameNotificationResult = 'success' | 'no_token' | 'rate_limit' | 'error';

export async function getUserNotificationDetails(fid: number): Promise<NotificationDetails | null> {
  try {
    const details = await kv.get(`user:${fid}:notificationDetails`);
    return details as NotificationDetails | null;
  } catch (error) {
    console.error('Error fetching notification details:', error);
    return null;
  }
}

export async function setUserNotificationDetails(fid: number, details: NotificationDetails) {
  try {
    await kv.set(`user:${fid}:notificationDetails`, details);
  } catch (error) {
    console.error('Error setting notification details:', error);
  }
}

export async function deleteUserNotificationDetails(fid: number) {
  try {
    await kv.del(`user:${fid}:notificationDetails`);
  } catch (error) {
    console.error('Error deleting notification details:', error);
  }
}

export async function sendFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<{ result: SendFrameNotificationResult; error?: unknown }> {
  try {
    const details = await getUserNotificationDetails(fid);
    if (!details) {
      return { result: 'no_token' };
    }

    const response = await fetch(details.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${details.token}`,
      },
      body: JSON.stringify({
        title,
        body,
        targetUrl: APP_URL,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { result: 'rate_limit' };
      }
      return { result: 'error', error: new Error(`HTTP error: ${response.status}`) };
    }

    return { result: 'success' };
  } catch (error) {
    console.error('Error sending frame notification:', error);
    return { result: 'error', error };
  }
}