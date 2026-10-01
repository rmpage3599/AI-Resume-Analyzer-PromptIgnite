import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TechnicalBackground from "@/components/background/TechnicalBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resumind — AI Resume Intelligence",
  description:
    "Analyze how well your resume aligns with your target job role. Skills, experience, education and skill gaps in one professional report.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <TechnicalBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
