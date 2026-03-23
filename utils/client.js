import { createPublicClient, http } from "viem";
import { sepolia } from 'viem/chains';
//import { hardhat } from 'viem/chains';

const RPC = process.env.NEXT_PUBLIC_ALCHEMY_RPC;

export const publicClient = createPublicClient({
    chain: sepolia,
    //chain: hardhat,
    transport: http(RPC),
    //transport: http('http://127.0.0.1:8545'),
})