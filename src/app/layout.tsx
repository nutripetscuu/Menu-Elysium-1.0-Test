import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/contexts/cart-context";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing-script',
  preload: true,
});

export const metadata: Metadata = {
  title: "NoWaiter | Restaurant Management Platform",
  description: "Modern restaurant management with QR code ordering, real-time analytics, and powerful tools. Transform your restaurant in minutes.",
  keywords: ["restaurant management", "QR code ordering", "digital menu", "restaurant software", "NoWaiter"],
  authors: [{ name: "NoWaiter" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${dancingScript.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
