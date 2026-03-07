import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import "./globals.css"

export const metadata: Metadata = {
  title: "Maseprinting - Financial Compliance & Growth",
  description: "Professional financial services and case management application for SMEs in Ethiopia.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased overflow-x-hidden min-h-screen" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
