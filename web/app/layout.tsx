import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Graded - AI Prompt Security Scanner",
  description: "Trust grades for the AI age. Scan any AI prompt for injection attacks, credential harvesting, jailbreaks, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} font-mono antialiased bg-[#0a0a0a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
