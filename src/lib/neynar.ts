import { Configuration, NeynarAPIClient, WebhookUserCreated } from '@neynar/nodejs-sdk';
import { APP_URL } from './constants';
import { v4 as uuidv4 } from 'uuid';

let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) throw new Error('NEYNAR_API_KEY not configured');
    neynarClient = new NeynarAPIClient(new Configuration({ apiKey }));
  }
  return neynarClient;
}

export type User = WebhookUserCreated['data'];
export type SendFrameNotificationResult = 'success' | 'no_token' | 'rate_limit' | 'error';

export async function sendNeynarFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<{ result: SendFrameNotificationResult; error?: Error }> {
  try {
    const client = getNeynarClient();
    const notification = {
      title,
      body,
      target_url: APP_URL,
      uuid: uuidv4(),
    };
    const response = await client.publishFrameNotifications({
      targetFids: [fid],
      notification,
    });
    const delivery = response.notification_deliveries?.[0];
    if (delivery?.status === 'success') return { result: 'success' };
    console.log('Delivery status:', delivery?.status);
    return { result: 'error' };
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    return { result: 'error', error: error as Error };
  }
}
