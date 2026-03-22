'use client'
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"
import NotConnected from "./NotConnected"
import Admin from "./Admin"
import Voter from "./Voter"
import Layout from "./Layout"

const Voting = () => {
    const { address, isConnected } = useAccount()

    const { data: owner } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "owner",
    })

    const { data: workflowStatus, refetch: refetchStatus } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "workflowStatus",
    })

    // Écoute les changements de workflow et rafraîchit
    useWatchContractEvent({
        address: contractAddress,
        abi: contractAbi,
        eventName: "WorkflowStatusChange",
        onLogs: () => {
            refetchStatus()
        }
    })

    const isOwner = isConnected && address === owner

    return (
        <Layout>
            {!isConnected ? (
                <NotConnected />
            ) : isOwner ? (
                <Admin workflowStatus={workflowStatus} />
            ) : (
                <Voter workflowStatus={workflowStatus} />
            )}
        </Layout>
    )
}

export default Voting;