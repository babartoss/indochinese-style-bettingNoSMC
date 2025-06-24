import { PropsWithChildren } from 'react';
import '../styles/globals.css';
import { Web3Provider } from '~/components/providers/WagmiProvider';

export const metadata = {
  title: 'Indochinese Style Betting',
  description: 'A decentralized betting platform with Indochinese style',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <script src="https://esm.sh/@farcaster/frame-sdk" async />
      </head>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}