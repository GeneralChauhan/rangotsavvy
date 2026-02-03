import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { FacebookPixel } from "@/components/facebook-pixel"
import "./globals.css"

export const metadata: Metadata = {
  title: "Rangotsav – 4th Holi 2026 | Book Your Tickets",
  description:
    "Premium, ticketed Holi experience. Complementary drink and snacks, DJ, band, dhol, organic colours, rain dance, food stalls. Book your tickets for 4th Holi 2026.",
  generator: "getout.buzz",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <FacebookPixel />
      </body>
      <script async defer src="https://cloud.umami.is/script.js" data-website-id="29dca8ab-4568-48b6-96c6-4755c96fd496"></script>
    </html>
  )
}
