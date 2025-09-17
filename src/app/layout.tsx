import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  title: "Menú ELYSIUM | Restaurante Japonés",
  description: "Descubre nuestra exquisita selección de cocina japonesa auténtica. Sushi, ramen, parrilla y más en un ambiente elegante.",
  keywords: ["restaurante japonés", "sushi", "ramen", "comida japonesa", "ELYSIUM"],
  authors: [{ name: "ELYSIUM Restaurant" }],
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
