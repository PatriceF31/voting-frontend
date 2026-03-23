'use client'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { http } from 'wagmi';
//import { sepolia } from 'wagmi/chains';
import { hardhat } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: 'fe53e9659b588d74465b9eed9f8a73f8',
    //chains: [sepolia],
    chains: [hardhat],
        transports: {
         //[sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC),
         [hardhat.id]: http('http://127.0.0.1:8545'),
    },
    ssr: true, 
});

const queryClient = new QueryClient();

const CustomRainbowKitProvider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
                {children}
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
  )
}

export default CustomRainbowKitProvider