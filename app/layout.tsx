import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { CartSync } from "@/components/cart-sync"
import "./globals.css"

export const metadata: Metadata = {
  title: "Bar Europa - Pasticceria, Bar & Gelateria dal 1966",
  description:
    "Scopri l'autentica tradizione italiana dal 1966. Pasticceria artigianale, caffè pregiato e gelato cremoso nel cuore della città.",
  generator: "v0.app",
  keywords: ['panettone', 'pandoro', 'dolci italiani', 'tradizione', 'artigianale', 'pasticceria', 'gelateria'],
  openGraph: {
    title: "Bar Europa - Pasticceria, Bar & Gelateria dal 1966",
    description: "Scopri l'autentica tradizione italiana dal 1966. Pasticceria artigianale, caffè pregiato e gelato cremoso nel cuore della città.",
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bar Europa - Pasticceria, Bar & Gelateria dal 1966",
    description: "Scopri l'autentica tradizione italiana dal 1966. Pasticceria artigianale, caffè pregiato e gelato cremoso nel cuore della città.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className="font-sans antialiased">
        <CartProvider>
          <CartSync />
          <Suspense fallback={null}>{children}</Suspense>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}