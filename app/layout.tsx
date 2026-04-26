import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HaTy — หาที่",
  description: "ระบบจัดการห้องเช่า หาที่ง่าย จัดการได้",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} antialiased font-sans bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
