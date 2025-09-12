import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { menuData } from "@/lib/menu-data";
import { CategoryNav } from "@/components/category-nav";
import { ContactSection } from "@/components/contact-section";
import { PromoBanner } from "@/components/promo-banner";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Menú ELYSIUM",
  description: "Un menú moderno para un restaurante japonés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className={`${inter.variable}`}>
      <body className="font-body antialiased">
        <div className="flex min-h-screen w-full flex-col">
          <Header categories={menuData} />
          <main className="flex-1">
            <PromoBanner />
            <CategoryNav categories={menuData} />
            {children}
            <ContactSection />
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
