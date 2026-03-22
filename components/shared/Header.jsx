import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
    return (
        <nav className="flex items-center justify-between p-4 border-b">
            <div className="font-bold text-xl">🗳️ Voting DApp</div>
            <div>
                <ConnectButton />
            </div>
        </nav>
    )
}

export default Header;