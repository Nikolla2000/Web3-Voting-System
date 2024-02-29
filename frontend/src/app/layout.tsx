import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Web3 Voting System',
    default: 'Web3 Voting System'
  },
  description: "A decentralized voting system built with Next.js, Nest.js and Solidity leveraging blockchain technology for secure and transparent voting processes.",
  metadataBase: new URL('http://localhost:3000'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen `}>{children}
      {/* <img src="/network3.png" className="network-bg-image"/>
      <img src="/network3.png" className="network-bg-image network-bg-image2"/>
      <img src="/network3.png" className="network-bg-image network-bg-image3"/> */}
      </body>
    </html>
  );
}
