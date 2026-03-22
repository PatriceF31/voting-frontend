'use client'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'
import { http } from 'wagmi'

export const config = getDefaultConfig({
    appName: 'Voting DApp',
    projectId: '65af7ffc03881e7982d909862c11aa59',
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC),
    },
    ssr: true,
})