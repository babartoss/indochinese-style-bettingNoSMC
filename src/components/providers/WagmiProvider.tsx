"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, createConfig, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame(), // Sửa lỗi: không truyền đối số
  ],
  transports: {
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function AutoConnect() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (!isConnected) {
      connect({ connector: connectors[0], chainId: base.id });
    }
  }, [connect, connectors, isConnected]);

  return null;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}