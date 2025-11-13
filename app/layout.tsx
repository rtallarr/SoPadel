import type { Metadata } from "next";
import { Home, BarChart2, Clock } from "lucide-react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoPadel",
  description: "SoPadel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-800 text-white px-8 py-4 flex items-center gap-8 shadow-lg">
          <h1 className="text-2xl font-bold">🎾 SoPadel</h1>
          <div className="flex ml-4 gap-8 text-lg items-center">
            <Link
              href="/"
              className="hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
            >
              <Home size={20} /> Partidos
            </Link>
            <Link
              href="/stats"
              className="hover:text-blue-400 transition-colors flex items-center gap-2 font-medium"
            >
              <BarChart2 size={20} /> Estadísticas
            </Link>
            <Link
              href="/history"
              className="hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
            >
              <Clock size={20} /> Historial
            </Link>
          </div>  
        </nav>
        {children}
      </body>
    </html>
  );
}