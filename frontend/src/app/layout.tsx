import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: 'CardioSense — AI Health Analyzer',
    template: '%s | CardioSense',
  },
  description: 'CardioSense: AI-powered healthcare symptom analysis and heart disease prediction using Google Gemini & ML.',
  keywords: ['health', 'symptom analyzer', 'AI', 'heart disease', 'cardio', 'medical'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d0d14' },
    { media: '(prefers-color-scheme: dark)',  color: '#0d0d14' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
