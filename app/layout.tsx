import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DataMorph - Intelligent Data Transformation",
  description: "Clean, transform, and analyze your data with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-amber-100 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pb-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
