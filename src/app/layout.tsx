import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CrmLayout } from "@/components/CrmLayout";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traymbhkam Tour and Travels - Chardham Yatra CRM",
  description: "Official CRM, Itinerary Builder, Vouchers & Invoice Studio for Traymbhkam Tour and Travels, Haridwar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-slate-100 text-slate-900 min-h-screen">
        <AuthProvider>
          <CrmLayout>
            {children}
          </CrmLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
