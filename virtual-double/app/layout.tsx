import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
})
const playfair = Playfair_Display({ subsets: ['latin'], style: ['italic'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'VirtualDouble — AI Cognitive Body Doubler',
  description: 'A calm, on-device AI body double for focused work and ADHD-friendly task completion.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/ant-mascot.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/ant-mascot.png',
    apple: '/ant-mascot.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b132b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/ant-mascot.png" sizes="any" />
        <link rel="shortcut icon" href="/ant-mascot.png" />
        <link rel="apple-touch-icon" href="/ant-mascot.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    var firstArg = arguments[0];
                    if (typeof firstArg === 'string' && (
                      firstArg.indexOf('INFO: Created TensorFlow Lite') !== -1 ||
                      firstArg.indexOf('face_landmarker_graph.cc') !== -1 ||
                      firstArg.indexOf('gl_context.cc') !== -1 ||
                      firstArg.indexOf('vision_wasm_internal') !== -1
                    )) {
                      console.info.apply(console, arguments);
                      return;
                    }
                    origError.apply(console, arguments);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${jakarta.variable} ${playfair.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
