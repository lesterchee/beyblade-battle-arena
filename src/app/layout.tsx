import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const barlow = Barlow_Condensed({
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-barlow'
});

export const metadata: Metadata = {
  title: 'Beyblade X Arena',
  description: 'High-speed physics-based battle simulator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx(
        inter.variable,
        barlow.variable,
        "font-sans antialiased bg-[#0a0a20] text-white"
      )}>
        {children}
      </body>
    </html>
  );
}
