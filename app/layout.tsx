import type { Metadata } from 'next';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OpenMontage — Agentic Video Production & Live Research Studio',
  description:
    'The interactive showcase, pipeline explorer, and Google Search-grounded research & script fact-checking studio for OpenMontage, the open-source agentic video production system.',
  openGraph: {
    title: 'OpenMontage — Agentic Video Production & Live Research Studio',
    description:
      'Turn your AI coding assistant into a complete video production studio. Explore 6 real productions, 12 pipelines, 52 tools, and run live Google Search-grounded topic research & script fact-checking.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenMontage — Agentic Video Production & Live Research Studio',
    description:
      'The first open-source, agentic video production system with live Google Search research grounding.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#FBF9F5] text-[#1C1917] font-sans antialiased selection:bg-[#9A3412]/15 selection:text-[#9A3412]"
      >
        {children}
      </body>
    </html>
  );
}
