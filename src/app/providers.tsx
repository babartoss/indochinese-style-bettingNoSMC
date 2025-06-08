import dynamic from 'next/dynamic';

const Web3Provider = dynamic(
  () => import("~/components/providers/WagmiProvider").then(mod => mod.Web3Provider),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}