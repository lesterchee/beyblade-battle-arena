import { Orbitron, Oswald } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export const metadata = {
  title: 'Beyblade Battle Arena',
  description: 'Next-Gen Beyblade Simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx(orbitron.variable, oswald.variable, "font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
