import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ระบบตรวจสอบงบประมาณสภานักศึกษา',
  description: 'Student Council Budget Transparency',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} font-sans antialiased text-slate-900 bg-slate-50`}>
        {children}
      </body>
    </html>
  )
}
