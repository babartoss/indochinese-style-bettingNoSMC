"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "@wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { APP_NAME, APP_ICON_URL, APP_URL } from "~/lib/constants";
import { useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import React from "react";
import { createConfig, http, WagmiProvider as WagmiProviderComponent } from "wagmi";

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  connectors: [
    farcasterFrame({
      appName: APP_NAME,
      appIconUrl: APP_ICON_URL,
      appUrl: APP_URL,
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

function AutoConnect() {
  const { connect, connectors, error } = useConnect();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      try {
        connect({ connector: connectors[0], chainId: base.id });
      } catch (error) {
        console.error("Lỗi kết nối ví:", error);
      }
    } else if (!isConnected && connectors.length === 0) {
      console.error("Không có connector nào khả dụng");
    }
    console.log("Trạng thái kết nối ví:", { isConnected, address, connectors, error });
  }, [connect, connectors, isConnected, error]);

  return null;
}

export const WagmiProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProviderComponent config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProviderComponent>
  );
};