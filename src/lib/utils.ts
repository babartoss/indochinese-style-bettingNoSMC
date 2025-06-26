import { mnemonicToAccount } from 'viem/accounts';
import { Base64 } from 'js-base64';
import { APP_URL, APP_NAME, APP_SPLASH_URL, APP_WEBHOOK_URL, APP_DESCRIPTION } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AccountAssociation {
  header: string;
  payload: string;
  signature: string;
}

interface MiniAppManifest {
  accountAssociation?: AccountAssociation;
  frame: {
    version: string;
    name: string;
    homeUrl: string;
    iconUrl: string;
    splashImageUrl?: string;
    webhookUrl?: string;
    description?: string;
    primaryCategory?: string;
    tags?: string[];
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getSecretEnvVars() {
  return {
    seedPhrase: process.env.SEED_PHRASE,
    fid: process.env.FID ? Number(process.env.FID) : undefined,
  };
}

export async function getFarcasterMetadata(): Promise<MiniAppManifest> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  if (!APP_URL) {
    throw new Error('APP_URL not configured');
  }

  const { seedPhrase, fid } = getSecretEnvVars();
  let accountAssociation: AccountAssociation | undefined;

  if (seedPhrase && fid) {
    try {
      const account = mnemonicToAccount(seedPhrase);
      const header = Base64.encodeURI(
        JSON.stringify({
          fid,
          type: 'custody',
          key: account.address,
        }),
      );
      let hostname: string;
      try {
        hostname = new URL(baseUrl).hostname;
      } catch (error) {
        console.error('Invalid baseUrl:', error);
        hostname = 'localhost';
      }
      const payload = Base64.encodeURI(JSON.stringify({ domain: hostname }));
      const signature = await account.signMessage({ message: `${header}.${payload}` });
      const encodedSignature = Base64.encodeURI(signature);

      accountAssociation = {
        header,
        payload,
        signature: encodedSignature,
      };
    } catch (error) {
      console.warn('Failed to generate account association:', error);
    }
  } else {
    console.warn('Missing SEED_PHRASE or FID, generating unsigned metadata');
  }

  return {
    ...(accountAssociation && { accountAssociation }),
    frame: {
      version: '1',
      name: APP_NAME,
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/image.png`,
      splashImageUrl: APP_SPLASH_URL,
      webhookUrl: APP_WEBHOOK_URL,
      description: APP_DESCRIPTION,
      primaryCategory: 'games',
      tags: ['lottery', 'betting', 'crypto', 'web3'],
    },
  };
}

export function getFrameEmbedMetadata(imageUrl: string): Record<string, string> {
  return {
    "fc:frame": "vNext",
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": "Try your luck",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": APP_URL,
  };
}