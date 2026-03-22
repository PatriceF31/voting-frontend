import { Toaster } from "sonner"
import CustomRainbowKitProvider from "./CustomRainbowKitProvider"
import "./globals.css"

export const metadata = {
  title: "Voting DApp",
  description: "Decentralized voting application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CustomRainbowKitProvider>
          {children}
        </CustomRainbowKitProvider>
        <Toaster />
      </body>
    </html>
  )
}