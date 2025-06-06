import { PropsWithChildren } from 'react';
import '../styles/globals.css';
import { WagmiProvider } from '~/components/providers/WagmiProvider';

export const metadata = {
  title: 'Indochinese Style Betting',
  description: 'A Farcaster mini app for betting on Vietnam Northern Lottery results',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}