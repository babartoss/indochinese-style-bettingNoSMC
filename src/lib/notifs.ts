import { kv } from '@vercel/kv';
import { APP_URL } from './constants';
import { v4 as uuidv4 } from 'uuid';

interface NotificationDetails {
  url: string;
  token: string;
}

export type SendFrameNotificationResult = 'success' | 'no_token' | 'rate_limit' | 'error';

export async function getUserNotificationDetails(fid: number): Promise<NotificationDetails | null> {
  return (await kv.get(`user:${fid}:notificationDetails`)) as NotificationDetails | null;
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
  const details = await getUserNotificationDetails(fid);
  if (!details) return { result: 'no_token' };

  const payload = {
    notificationId: uuidv4(),
    title,
    body,
    targetUrl: APP_URL,
    tokens: [details.token],
  };

  try {
    const response = await fetch(details.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      if (response.status === 429) return { result: 'rate_limit' };
      return { result: 'error', error: new Error(`HTTP ${response.status}`) };
    }
    return { result: 'success' };
  } catch (error) {
    return { result: 'error', error };
  }
}
