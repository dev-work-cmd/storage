import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Sans,
} from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Secure PDF QR Storage Platform",
    template: "%s | Secure PDF QR Storage Platform",
  },
  description:
    "Securely upload PDFs, replace only the QR region, and control verification, open, and download access through app-owned routes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        instrumentSans.variable,
        fraunces.variable,
        "font-sans",
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-950"
      >
        {children}
      </body>
    </html>
  );
}
