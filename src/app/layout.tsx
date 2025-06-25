import { cookies } from 'next/headers';
import Script from 'next/script';
import { Web3Provider } from '~/components/providers/WagmiProvider';
import '../styles/globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const nonce = cookieStore.get('csp-nonce')?.value;
  return (
    <html lang="en">
      <head>
        {nonce && (
          <Script
            strategy="afterInteractive"
            id="nonce-script"
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `__webpack_nonce__ = ${JSON.stringify(nonce)}`,
            }}
          />
        )}
      </head>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}