import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "VARA — Property Intelligence",
  description: "Property management and revenue intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className="dark">
      <body className={`${inter.variable} antialiased font-sans bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
