import { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { Web3Provider } from '~/components/providers/WagmiProvider';
import { APP_URL } from '~/lib/constants';

export const metadata: Metadata = {
  title: 'Indochinese Style Betting',
  description: 'A decentralized betting platform with Indochinese style',
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${APP_URL}/frame-image.jpg`,
      button: {
        title: 'Open App',
        action: {
          type: 'launch_frame',
          name: 'Indochinese Betting',
          url: APP_URL,
          splashImageUrl: `${APP_URL}/logo.png`,
          splashBackgroundColor: '#ffffff',
        },
      },
    }),
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}