import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'mini-mint',
  description: 'Personal US-stock investment tracker for households',
  applicationName: 'mini-mint',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'mini-mint',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  // Browser status-bar color — consumed as HTML <meta> pre-CSS, so must be
  // a literal hex (cannot reference CSS vars). Keep these two values in
  // sync with --bg / light counterpart in references/designs/styles.css.
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#07070a' }, // lint-tokens-ok
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' }, // lint-tokens-ok
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
