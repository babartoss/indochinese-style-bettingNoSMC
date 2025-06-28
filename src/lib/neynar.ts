import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { APP_URL } from './constants';

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
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) throw new Error('NEYNAR_API_KEY not configured');

    // Kiểm tra độ dài
    if (title.length > 32) throw new Error('Title exceeds 32 characters');
    if (body.length > 128) throw new Error('Body exceeds 128 characters');

    const notification = {
      title,
      body,
      target_url: APP_URL,
      uuid: uuidv4(),
    };

    console.log('Sending notification with payload:', JSON.stringify({ target_fids: [fid], notification }));

    const response = await axios.post(
      'https://api.neynar.com/v2/farcaster/frame/notifications',
      {
        target_fids: [fid],
        notification,
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 && response.data.notification_deliveries?.[0]?.status === 'success') {
      return { result: 'success' };
    } else {
      console.log('Response status:', response.status, 'Data:', response.data);
      return { result: 'error', error: new Error(JSON.stringify(response.data)) };
    }
  } catch (error) {
    console.error('Lỗi khi gửi thông báo:', error);
    if (error instanceof Error) {
      return { result: 'error', error };
    } else {
      return { result: 'error', error: new Error('Unknown error occurred') };
    }
  }
}