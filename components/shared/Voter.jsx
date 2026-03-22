'use client'
import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from "wagmi"
import { contractAddress, contractAbi } from "@/constants"
import { publicClient } from "@/utils/client"
import { parseAbiItem } from "viem"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const workflowLabels = [
    "Enregistrement des électeurs",
    "Enregistrement des propositions",
    "Fin des propositions",
    "Session de vote",
    "Fin du vote",
    "Votes comptabilisés",
]

const Voter = ({ workflowStatus }) => {
    const { address } = useAccount()
    const [proposal, setProposal] = useState("")
    const [proposals, setProposals] = useState([])

    const { writeContract, data: hash, error, isPending } = useWriteContract()
    const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

    // Vérifier si l'adresse est un électeur enregistré
    const { data: voter } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getVoter",
        args: [address],
        account: address,
    })

    // Résultat gagnant
    const { data: winningProposalID } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "winningProposalID",
    })

    // Récupérer les propositions via les events
    const getProposals = async () => {
        try {
            const blockNumber = await publicClient.getBlockNumber()
            const fromBlock = blockNumber > 1000n ? blockNumber - 1000n : 0n
            const logs = await publicClient.getLogs({
                address: contractAddress,
                event: parseAbiItem('event ProposalRegistered(uint256 proposalId)'),
                //fromBlock: blockNumber - 1000n,
                fromBlock: fromBlock,
                toBlock: 'latest'
            })
            // Pour chaque ID, récupérer la description via getOneProposal
            const props = await Promise.all(
                logs.map(async (log) => {
                    const proposal = await publicClient.readContract({
                        address: contractAddress,
                        abi: contractAbi,
                        functionName: "getOneProposal",
                        args: [log.args.proposalId],
                        account: address, // nécessaire car onlyVoters
                    })
                    // On ne peut pas appeler getOneProposal sans être voter
                    return { 
                        id: log.args.proposalId, 
                        description: proposal.description,
                        voteCount: proposal.voteCount
                    }
                })
            )
            setProposals(props)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success("Transaction confirmée !")
            setProposal("")
            getProposals()
        }
        if (error) {
            toast.error(error.shortMessage || error.message)
        }
    }, [isSuccess, error])

    useEffect(() => {
        getProposals()
    }, [workflowStatus])

    const handleAddProposal = () => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "addProposal",
            args: [proposal],
        })
    }

    const handleVote = (id) => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "setVote",
            args: [id],
        })
    }

    if (!voter?.isRegistered) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="text-xl font-semibold">Vous n'êtes pas enregistré comme électeur.</p>
                <p className="text-gray-500 mt-2">Contactez l'administrateur pour être ajouté.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Panel Électeur</h1>

            {/* Statut actuel */}
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Statut actuel</p>
                <p className="font-semibold text-lg">
                    {workflowStatus !== undefined ? workflowLabels[workflowStatus] : "Chargement..."}
                </p>
            </div>

            {/* Ajouter une proposition */}
            {workflowStatus === 1 && (
                <div className="p-4 border rounded-lg space-y-3">
                    <h2 className="font-semibold">Soumettre une proposition</h2>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Votre proposition..."
                            value={proposal}
                            onChange={(e) => setProposal(e.target.value)}
                        />
                        <Button onClick={handleAddProposal} disabled={isPending || isConfirming}>
                            {isPending || isConfirming ? "En cours..." : "Soumettre"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Liste des propositions + vote */}
            {(workflowStatus === 3 || workflowStatus === 2 || workflowStatus === 1) && proposals.length > 0 && (
                <div className="p-4 border rounded-lg space-y-3">
                    <h2 className="font-semibold">Propositions</h2>
                    {proposals.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                            <span>{p.description}</span>
                            {workflowStatus === 3 && !voter?.hasVoted && (
                                <Button size="sm" onClick={() => handleVote(p.id)} disabled={isPending || isConfirming}>
                                    Voter
                                </Button>
                            )}
                            {voter?.hasVoted && voter?.votedProposalId === p.id && (
                                <Badge>Votre vote</Badge>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Résultat */}
            {workflowStatus === 5 && (
                <div className="p-4 border rounded-lg bg-green-50">
                    <h2 className="font-semibold text-green-700">Résultat</h2>
                    <p className="text-lg mt-2">
                        🏆 Proposition gagnante : <strong>
                            {proposals.find(p => p.id === winningProposalID)?.description || `#${winningProposalID?.toString()}`}
                        </strong>
                    </p>
                </div>
            )}
        </div>
    )
}

export default Voter;