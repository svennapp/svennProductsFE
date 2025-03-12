import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import AuthProvider from '@/components/providers/session-provider'
import { Navigation } from '@/components/navigation'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Warehouse Script Management',
  description: 'Manage and monitor automated warehouse scripts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navigation>{children}</Navigation>
            </div>
            <Toaster />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
