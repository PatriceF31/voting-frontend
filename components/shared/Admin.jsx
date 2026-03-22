'use client'
import { useState } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useEffect } from "react"
import { contractAddress, contractAbi } from "@/constants"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const workflowLabels = [
    "Enregistrement des électeurs",
    "Enregistrement des propositions",
    "Fin des propositions",
    "Session de vote",
    "Fin du vote",
    "Votes comptabilisés",
]

const Admin = ({ workflowStatus }) => {
    const [voterAddress, setVoterAddress] = useState("")

    const { writeContract, data: hash, error, isPending } = useWriteContract()

    const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (isSuccess) {
            toast.success("Transaction confirmée !")
            setVoterAddress("")
        }
        if (error) {
            toast.error(error.shortMessage || error.message)
        }
    }, [isSuccess, error])

    const handleAddVoter = () => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "addVoter",
            args: [voterAddress],
        })
    }

    const handleWorkflow = (functionName) => {
        writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName,
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Panel Administrateur</h1>

            {/* Statut actuel */}
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Statut actuel</p>
                <p className="font-semibold text-lg">
                    {workflowStatus !== undefined ? workflowLabels[workflowStatus] : "Chargement..."}
                </p>
            </div>

            {/* Ajouter un électeur */}
            {workflowStatus === 0 && (
                <div className="p-4 border rounded-lg space-y-3">
                    <h2 className="font-semibold">Ajouter un électeur</h2>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Adresse Ethereum (0x...)"
                            value={voterAddress}
                            onChange={(e) => setVoterAddress(e.target.value)}
                        />
                        <Button onClick={handleAddVoter} disabled={isPending || isConfirming}>
                            {isPending || isConfirming ? "En cours..." : "Ajouter"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Boutons workflow */}
            <div className="p-4 border rounded-lg space-y-3">
                <h2 className="font-semibold">Gestion du workflow</h2>
                <div className="flex flex-col gap-2">
                    {workflowStatus === 0 && (
                        <Button onClick={() => handleWorkflow("startProposalsRegistering")} disabled={isPending || isConfirming}>
                            Démarrer l'enregistrement des propositions
                        </Button>
                    )}
                    {workflowStatus === 1 && (
                        <Button onClick={() => handleWorkflow("endProposalsRegistering")} disabled={isPending || isConfirming}>
                            Terminer l'enregistrement des propositions
                        </Button>
                    )}
                    {workflowStatus === 2 && (
                        <Button onClick={() => handleWorkflow("startVotingSession")} disabled={isPending || isConfirming}>
                            Démarrer la session de vote
                        </Button>
                    )}
                    {workflowStatus === 3 && (
                        <Button onClick={() => handleWorkflow("endVotingSession")} disabled={isPending || isConfirming}>
                            Terminer la session de vote
                        </Button>
                    )}
                    {workflowStatus === 4 && (
                        <Button onClick={() => handleWorkflow("tallyVotes")} disabled={isPending || isConfirming}>
                            Comptabiliser les votes
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Admin;