import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
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
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = theme === 'dark' || (theme === 'system' && prefersDark) || (!theme && prefersDark);
                  document.documentElement.classList.add(resolved ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${ibmPlexSansThai.variable} font-sans antialiased bg-[rgb(var(--ios-bg-grouped))] text-[rgb(var(--ios-text-primary))] transition-colors duration-200`}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[rgb(var(--ios-accent))] focus:text-white focus:px-4 focus:py-2 focus:rounded-[var(--ios-radius-sm)] focus:shadow-lg transition-transform"
          >
            ข้ามไปยังเนื้อหาหลัก
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
