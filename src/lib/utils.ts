interface AccountAssociation {
  header: string;
  payload: string;
  signature: string;
}

interface Button {
  title: string;
}

interface Frame {
  version: number;
  name: string;
  homeUrl: string;
  image: string;
  buttons: Button[];
  splash: {
    image: string;
    buttons: Button[];
  };
  webhookUrl: string;
  description: string;
  primaryCategory: string;
  tags: string[];
}

interface FrameManifest {
  accountAssociation?: AccountAssociation;
  frame: Frame;
}

import { mnemonicToAccount } from 'viem/accounts';
import { Base64 } from 'js-base64';
import { APP_URL, APP_NAME, APP_SPLASH_URL, APP_WEBHOOK_URL, APP_DESCRIPTION } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getSecretEnvVars() {
  return {
    seedPhrase: process.env.SEED_PHRASE,
    fid: process.env.FID ? Number(process.env.FID) : undefined,
  };
}

export async function getFarcasterMetadata(): Promise<FrameManifest> {
  if (process.env.FRAME_METADATA) {
    try {
      return JSON.parse(process.env.FRAME_METADATA);
    } catch (error) {
      console.error('Error parsing FRAME_METADATA:', error);
    }
  }

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
      const payload = Base64.encodeURI(JSON.stringify({ domain: new URL(APP_URL).hostname }));
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
      version: 1,
      name: APP_NAME,
      homeUrl: APP_URL,
      image: APP_URL + '/image.jpg',
      buttons: [{ title: 'Launch App' }],
      splash: {
        image: APP_SPLASH_URL,
        buttons: [{ title: 'Launch App' }],
      },
      webhookUrl: APP_WEBHOOK_URL,
      description: APP_DESCRIPTION,
      primaryCategory: 'finance',
      tags: ['betting', 'crypto', 'web3'],
    },
  };
}

export function getFrameEmbedMetadata(imageUrl: string): Record<string, string> {
  return {
    "fc:frame": "vNext",
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": "Open App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": APP_URL,
  };
}