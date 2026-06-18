import { Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950/40 text-zinc-400 py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <span className="font-bold text-black text-sm leading-none">B</span>
          </div>
          <div>
            <p className="font-semibold text-zinc-200">Brahmo Intelligence</p>
            <p className="text-[10px] text-zinc-500">
              Indic Clinical Voice Pipeline
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-zinc-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Pipeline
          </Link>
          <Link
            href="/benchmark"
            className="hover:text-cyan-400 transition-colors"
          >
            Benchmarks
          </Link>
          <Link
            href="/report"
            className="hover:text-cyan-400 transition-colors"
          >
            ASR Report
          </Link>
          <Link href="/ehr" className="hover:text-cyan-400 transition-colors">
            EHR Records
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-zinc-500 text-center sm:text-right">
          <span className="flex items-center gap-1.5 bg-zinc-900/40 px-2.5 py-1 rounded-full border border-zinc-800 text-[10px] text-emerald-400">
            <Shield className="w-3 h-3" /> ABDM & DPDP Compliant Sandbox
          </span>
          <p>&copy; {new Date().getFullYear()} Brahmo Health</p>
        </div>
      </div>
    </footer>
  );
}
