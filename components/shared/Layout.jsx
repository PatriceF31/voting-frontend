import Header from "./Header";

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-6">
                {children}
            </main>
            <footer className="p-4 text-center text-sm text-gray-500 border-t">
                All rights reserved © Voting DApp 2026
            </footer>
        </div>
    )
}

export default Layout;