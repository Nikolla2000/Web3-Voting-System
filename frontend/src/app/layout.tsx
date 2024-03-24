import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./ui/Providers";
import { Toaster } from 'react-hot-toast';

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
      <body className={`${inter.className} min-h-screen `}>
        <Providers>
          {children}
      </Providers>
      <Toaster />
      </body>
    </html>
  );
}
