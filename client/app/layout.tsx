import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avida Towers Vita — Net-Zero Command Center',
  description: 'Ayala Land energy monitoring dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white">
        {children}
      </body>
    </html>
  )
}
