import { Configuration, NeynarAPIClient, WebhookUserCreated } from '@neynar/nodejs-sdk';
import { APP_URL } from './constants';

let neynarClient: NeynarAPIClient | null = null;

export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new Error('NEYNAR_API_KEY not configured');
    }
    const config = new Configuration({ apiKey: apiKey });
    neynarClient = new NeynarAPIClient(config);
  }
  return neynarClient;
}

export async function getNeynarUser(fid: number): Promise<User | null> {
  try {
    const client = getNeynarClient();
    const response = await client.fetchBulkUsers({ fids: [fid] });
    return response.users[0] as User;
  } catch (error) {
    console.error('Error fetching Neynar user:', error);
    return null;
  }
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
    };
    const response = await client.publishFrameNotifications({ targetFids: [fid], notification });
    if (response.notification_deliveries && response.notification_deliveries.length > 0) {
      const delivery = response.notification_deliveries[0];
      if (delivery.status === "success") {
        return { result: 'success' };
      } else {
        console.log('Delivery status:', delivery.status);
        // Bạn có thể thêm điều kiện dựa trên trạng thái cụ thể, ví dụ:
        // if (delivery.status === "no_token") return { result: 'no_token' };
        return { result: 'error' };
      }
    } else {
      return { result: 'error' };
    }
  } catch (error) {
    return { result: 'error', error: error as Error };
  }
}