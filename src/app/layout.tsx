import type { Metadata } from "next";
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
  title: "Habit Tracker",
  description: "Track your habits with ease",
};

function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6 mt-16">
      <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Habit Tracker. All rights reserved.</p>
        <p className="mt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900`}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
