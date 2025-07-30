import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetGamify - Turn Budgeting Into a Game",
  description: "Master your finances with zero-based budgeting, earn achievements, level up, and build lasting money habits that actually stick.",
  keywords: ["budgeting", "finance", "gamification", "zero-based budgeting", "money management"],
  authors: [{ name: "BudgetGamify Team" }],
  openGraph: {
    title: "BudgetGamify - Turn Budgeting Into a Game",
    description: "Master your finances with zero-based budgeting, earn achievements, level up, and build lasting money habits that actually stick.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
