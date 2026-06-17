"use client";

import { BarChart3, FileCheck, Stethoscope, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Clinical Voice Pipeline",
      icon: Stethoscope,
      active: pathname === "/" || pathname === "/playground",
    },
    {
      href: "/benchmark",
      label: "Accuracy Benchmarking",
      icon: BarChart3,
      active: pathname.startsWith("/benchmark"),
    },
    {
      href: "/report",
      label: "ASR Evaluation Report",
      icon: TrendingUp,
      active: pathname.startsWith("/report"),
    },
    {
      href: "/ehr",
      label: "Saved EHR Records",
      icon: FileCheck,
      active: pathname.startsWith("/ehr"),
    },
  ];

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                item.active
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/40"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
