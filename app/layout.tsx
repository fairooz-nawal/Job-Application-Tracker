import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"
import { Briefcase } from "lucide-react" // Import Briefcase component from lucide-react
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track and manage your job applications efficiently",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
              <Briefcase className="h-6 w-6 mr-2" /> {/* Use Briefcase component from lucide-react */}
              <span className="text-lg font-semibold">Job Tracker</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <Navigation />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 md:p-8">{children}</div>
          </main>
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
