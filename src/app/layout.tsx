import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { menuData } from "@/lib/menu-data";
import { CategoryNav } from "@/components/category-nav";
import { ContactSection } from "@/components/contact-section";
import { PromoBanner } from "@/components/promo-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Menú Kampai",
  description: "Un menú moderno para un restaurante japonés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
