import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardNav from "../components/DashboardNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brahmo Intelligence Engine",
  description: "Clinical Voice Pipeline and Accuracy Benchmarking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black font-sans text-zinc-50 selection:bg-cyan-500/30">
        {/* Header */}
        <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="font-bold text-black text-xl leading-none">
                  B
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Brahmo{" "}
                <span className="text-zinc-500 font-normal">
                  Intelligence Engine
                </span>
              </h1>
            </div>
            <div className="text-sm font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20">
              Internal Benchmarking
            </div>
          </div>
        </header>

        {/* Navigation Switcher */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-10">
          <DashboardNav />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full flex flex-col py-10 px-6 max-w-7xl mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-905 py-8 text-center text-zinc-600 text-sm">
          <p>
            Brahmo Health Assessment &bull; 120B Medical LLM Extraction
            Benchmark
          </p>
        </footer>
      </body>
    </html>
  );
}
