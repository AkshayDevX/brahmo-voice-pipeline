"use client";

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Database,
  Globe,
  Loader2,
  Play,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { type Note, runBenchmark } from "../actions/benchmark";

const PROVIDERS = [
  {
    value: "sarvam",
    label: "Sarvam AI Saaras:v3",
    native: "Translit Mode",
    provider: "Sarvam Cloud",
    group: "Cloud Engines",
  },
  {
    value: "shunyalabs",
    label: "Shunyalabs Zero-Codeswitch",
    native: "Multilingual ASR",
    provider: "Zero Codeswitch",
    group: "Cloud Engines",
  },
  {
    value: "deepgram",
    label: "Deepgram Nova-3",
    native: "Medical Model",
    provider: "Deepgram API",
    group: "Cloud Engines",
  },
  {
    value: "whisper",
    label: "Whisper Large V3",
    native: "Standard English",
    provider: "Groq Cloud ASR",
    group: "Cloud Engines",
  },
  {
    value: "indic-conformer",
    label: "Local Indic-Conformer",
    native: "On-Premise RNNT",
    provider: "AI4Bharat",
    group: "Local On-Premise",
  },
];

interface AsrProviderSearchSelectProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function AsrProviderSearchSelect({
  value,
  onChange,
  disabled,
}: AsrProviderSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = PROVIDERS.find((p) => p.value === value) || PROVIDERS[0];

  const filtered = PROVIDERS.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.native.toLowerCase().includes(search.toLowerCase()) ||
      p.value.toLowerCase().includes(search.toLowerCase()) ||
      p.group.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
      setTimeout(() => {
        const activeEl = listRef.current?.querySelectorAll("[data-item-btn]")[
          activeIndex + 1
        ] as HTMLElement;
        if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
      }, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      setTimeout(() => {
        const activeEl = listRef.current?.querySelectorAll("[data-item-btn]")[
          activeIndex - 1
        ] as HTMLElement;
        if (activeEl) activeEl.scrollIntoView({ block: "nearest" });
      }, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) {
        onChange(filtered[activeIndex].value);
        setIsOpen(false);
        setSearch("");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onKeyDown={handleKeyDown}
    >
      <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
        ASR Provider
      </label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm h-[46px] flex items-center justify-between text-left shadow-inner cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedItem.group === "Local On-Premise" ? (
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : selectedItem.group === "Cloud Engines" ? (
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          ) : (
            <Brain className="w-4 h-4 text-purple-400 shrink-0" />
          )}
          <span className="font-semibold text-zinc-200">
            {selectedItem.label}
          </span>
          <span className="text-xs text-zinc-500 font-mono truncate">
            ({selectedItem.native})
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          <div className="p-2 border-b border-zinc-900 flex items-center gap-2 bg-zinc-900/30">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search ASR engines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-150 focus:outline-none placeholder:text-zinc-650 py-0.5"
            />
          </div>

          <div
            ref={listRef}
            className="max-h-50 overflow-y-auto p-1.5 flex flex-col gap-0.5 custom-scrollbar"
          >
            {filtered.length === 0 ? (
              <div className="text-zinc-650 text-xs py-6 text-center font-medium">
                No ASR engines found
              </div>
            ) : (
              (() => {
                let currentGroup = "";
                return filtered.map((item, idx) => {
                  const showGroupLabel = item.group !== currentGroup;
                  currentGroup = item.group;
                  return (
                    <div key={item.value} className="flex flex-col">
                      {showGroupLabel && (
                        <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider px-2.5 py-1 mt-1.5 first:mt-0.5">
                          {item.group}
                        </div>
                      )}
                      <button
                        type="button"
                        data-item-btn
                        onClick={() => {
                          onChange(item.value);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                          item.value === value
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : idx === activeIndex
                              ? "bg-zinc-900 text-zinc-100 border border-transparent"
                              : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            {item.label}
                            {item.group === "Local On-Premise" && (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-mono border border-emerald-500/10">
                                Local
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {item.native} &bull; {item.provider}
                          </span>
                        </div>
                        {item.value === value && (
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BenchmarkDashboard({
  notes,
  initialResults,
  asrProvider,
}: {
  notes: Note[];
  initialResults: any[];
  asrProvider: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dbResults, setDbResults] = useState(initialResults);
  const [runningNoteId, setRunningNoteId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  useEffect(() => {
    setDbResults(initialResults);
  }, [initialResults]);

  const handleAsrChange = (val: string) => {
    startTransition(() => {
      router.push(`/benchmark?asr=${val}`);
    });
  };

  // Status helpers
  const getNoteStatus = (noteId: string) => {
    return dbResults.find(
      (r) => r.voiceNoteId === noteId && r.yourProvider === asrProvider,
    );
  };

  const handleRunSingle = async (noteId: string) => {
    setRunningNoteId(noteId);
    startTransition(async () => {
      try {
        const res = await runBenchmark(noteId, asrProvider);
        if (res.success && res.row) {
          setDbResults((prev) => {
            const exists = prev.findIndex(
              (p) => p.voiceNoteId === noteId && p.yourProvider === asrProvider,
            );
            if (exists >= 0) {
              const newArr = [...prev];
              newArr[exists] = res.row;
              return newArr;
            }
            return [...prev, res.row];
          });
        }
      } catch (err) {
        console.error("Failed to run benchmark:", err);
      } finally {
        setRunningNoteId(null);
      }
    });
  };

  const handleRunAll = async () => {
    if (!notes.length) return;
    setIsRunningAll(true);

    for (const note of notes) {
      setRunningNoteId(note.id);
      try {
        const res = await runBenchmark(note.id, asrProvider);
        if (res.success && res.row) {
          setDbResults((prev) => {
            const exists = prev.findIndex(
              (p) =>
                p.voiceNoteId === note.id && p.yourProvider === asrProvider,
            );
            if (exists >= 0) {
              const newArr = [...prev];
              newArr[exists] = res.row;
              return newArr;
            }
            return [...prev, res.row];
          });
        }
      } catch (e) {
        console.error(`Failed on note ${note.id}:`, e);
      }
    }

    setRunningNoteId(null);
    setIsRunningAll(false);
  };

  const completedCount = notes.filter((n) => getNoteStatus(n.id)).length;

  const providerResults = dbResults
    .filter((r) => r.yourProvider === asrProvider)
    .sort((a, b) => (a.voiceNoteId || "").localeCompare(b.voiceNoteId || ""));

  const isChatgptNegationMissed = (r: any) => {
    if (!r.negationCritical) return false;
    const nodesStr = JSON.stringify(r.chatgptNodes || {}).toLowerCase();
    const negationIndicators = [
      "do not",
      "don't",
      "must not",
      "cannot",
      "should not",
      "shouldn't",
      "does not",
      "doesn't",
      "doesnt",
      "no response",
      "not respond",
      "without",
      "if no",
      "if not",
      "stop",
      "avoid",
      "discontinue",
      "refusal",
      "refused",
      "no oral",
      "not give",
      "don't give",
      "contraindicated",
      "not recommended",
      "critical negation",
      "no nsaid",
      "ivvakudadu",
      "ivvaledu",
      "kudadhu",
      "mat do",
      "paadilla",
      "venda",
      "nako",
      "beda",
    ];
    return !negationIndicators.some((indicator) =>
      nodesStr.includes(indicator.toLowerCase()),
    );
  };

  const getCompositeScore = (r: any) => {
    const werVal = Number(r.yourWer || 0);
    const werInverted = Math.max(0, 100 - werVal);
    const mtaVal = Number(r.yourMedicalTermAccuracy || 0);
    const naVal = r.yourNegationPreserved ? 100 : 0;
    const neaVal = Number(r.yourNodeAccuracy || 0);

    let safetyVal = 100;
    if (r.dangerLevel === "CRITICAL") safetyVal = 0;
    else if (r.dangerLevel === "MODERATE") safetyVal = 50;

    return (
      werInverted * 0.2 +
      mtaVal * 0.25 +
      naVal * 0.25 +
      neaVal * 0.2 +
      safetyVal * 0.1
    );
  };

  const avgNoteScore =
    providerResults.length > 0
      ? providerResults.reduce((acc, r) => acc + getCompositeScore(r), 0) /
        providerResults.length
      : 0;

  const avgOurAcc =
    providerResults.length > 0
      ? providerResults.reduce(
          (acc, r) => acc + Number(r.yourNodeAccuracy || 0),
          0,
        ) / providerResults.length
      : 0;
  const avgChatgptAcc =
    providerResults.length > 0
      ? providerResults.reduce(
          (acc, r) => acc + Number(r.chatgptNodeAccuracy || 0),
          0,
        ) / providerResults.length
      : 0;
  const avgWer =
    providerResults.length > 0
      ? providerResults.reduce((acc, r) => acc + Number(r.yourWer || 0), 0) /
        providerResults.length
      : 0;
  const negationPreservedCount = providerResults.filter(
    (r) => r.yourNegationPreserved,
  ).length;
  const negationPct =
    providerResults.length > 0
      ? (negationPreservedCount / providerResults.length) * 100
      : 0;
  const dangerousCases = providerResults.filter((r) => r.genericAiDangerous);
  const _criticalCases = providerResults.filter(
    (r) => r.dangerLevel === "CRITICAL",
  );
  const totalNodes = providerResults.reduce(
    (acc, r) => acc + (r.yourNodeCount || 0),
    0,
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8">
      {/* Controls Section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2 mb-2">
              <Activity className="text-cyan-400 w-6 h-6" />
              Accuracy Comparison — 20 Test Cases
            </h2>
            <p className="text-zinc-400 text-sm">
              Side-by-side: Your Pipeline vs ChatGPT vs Gemini. WER, Medical
              Term Accuracy, Negation Preservation, Node Accuracy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="w-full sm:w-64">
              <AsrProviderSearchSelect
                value={asrProvider}
                onChange={handleAsrChange}
                disabled={isRunningAll || isPending}
              />
            </div>

            <button
              type="button"
              onClick={handleRunAll}
              disabled={isRunningAll || isPending}
              className="w-full sm:w-auto mt-6 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunningAll ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Testing All ({completedCount}/{notes.length})
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  Test All 20 Notes
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Aggregate Summary — Section 4 of Assessment */}
      {providerResults.length > 0 && (
        <section className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-6">
            <BarChart3 className="text-cyan-400 w-5 h-5" />
            Aggregate Accuracy Report
          </h3>
          <p className="text-zinc-400 text-sm mb-6">
            &quot;My pipeline: {avgOurAcc.toFixed(1)}% overall. ChatGPT:{" "}
            {avgChatgptAcc.toFixed(1)}%. Improvement:{" "}
            {(avgOurAcc - avgChatgptAcc).toFixed(1)}% over ChatGPT.&quot;
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                Notes Tested
              </p>
              <p className="text-3xl font-black text-zinc-100">
                {providerResults.length}
                <span className="text-base text-zinc-500 font-normal">
                  /{notes.length}
                </span>
              </p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                Composite Score
              </p>
              <p className="text-3xl font-black text-emerald-400">
                {avgNoteScore.toFixed(1)}
                <span className="text-base font-normal">/100</span>
              </p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                Our Pipeline
              </p>
              <p className="text-3xl font-black text-cyan-400">
                {avgOurAcc.toFixed(1)}
                <span className="text-base font-normal">%</span>
              </p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                ChatGPT
              </p>
              <p className="text-3xl font-black text-amber-400">
                {avgChatgptAcc.toFixed(1)}
                <span className="text-base font-normal">%</span>
              </p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                Negation
              </p>
              <p className="text-3xl font-black text-teal-400">
                {negationPct.toFixed(0)}
                <span className="text-base font-normal">%</span>
              </p>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">
                Avg WER
              </p>
              <p className="text-3xl font-black text-rose-400">
                {avgWer.toFixed(1)}
                <span className="text-base font-normal">%</span>
              </p>
            </div>
          </div>

          {/* Total nodes extracted */}
          <div className="mt-4 flex items-start gap-3 bg-cyan-950/20 border border-cyan-900/30 p-4 rounded-xl text-sm text-cyan-100/70">
            <Database className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
            <p>
              <strong>{totalNodes}</strong> knowledge nodes extracted across{" "}
              {providerResults.length} notes. Full per-note comparison in the{" "}
              <code className="text-cyan-300">accuracy_results</code> database
              table.
            </p>
          </div>
        </section>
      )}

      {/* Side-by-Side Comparison Table — THE core assessment requirement */}
      {providerResults.length > 0 && (
        <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2 mb-6">
            <Sparkles className="text-cyan-400 w-5 h-5" />
            Per-Note Accuracy Comparison (Your Pipeline vs ChatGPT)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="px-3 py-3 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-3 py-3 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-3 py-3 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-3 py-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                    Note Score
                  </th>
                  <th className="px-3 py-3 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                    Our Acc %
                  </th>
                  <th className="px-3 py-3 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    ChatGPT %
                  </th>

                  <th className="px-3 py-3 text-teal-400 font-semibold text-xs uppercase tracking-wider">
                    Negation
                  </th>
                  <th className="px-3 py-3 text-rose-400 font-semibold text-xs uppercase tracking-wider">
                    WER %
                  </th>
                  <th className="px-3 py-3 text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                    Danger
                  </th>
                </tr>
              </thead>
              <tbody>
                {providerResults.map((r) => {
                  const isCritical = r.dangerLevel === "CRITICAL";
                  const isModerate = r.dangerLevel === "MODERATE";
                  const compositeScore = getCompositeScore(r);
                  return (
                    <tr
                      key={r.voiceNoteId}
                      className={`border-b border-zinc-800/50 transition-colors ${
                        isCritical
                          ? "bg-red-950/20"
                          : isModerate
                            ? "bg-amber-950/10"
                            : "hover:bg-zinc-900/50"
                      }`}
                    >
                      <td className="px-3 py-3 font-mono text-zinc-300 text-xs">
                        {r.voiceNoteId}
                      </td>
                      <td className="px-3 py-3 text-zinc-400 text-xs">
                        {r.language}
                      </td>
                      <td className="px-3 py-3 text-zinc-300 text-xs max-w-[150px] truncate">
                        {r.specialty}
                      </td>
                      <td className="px-3 py-3 font-bold text-emerald-400">
                        {compositeScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 font-bold text-cyan-400">
                        {Number(r.yourNodeAccuracy || 0).toFixed(1)}
                      </td>
                      <td className="px-3 py-3 font-bold text-amber-400">
                        {Number(r.chatgptNodeAccuracy || 0).toFixed(1)}
                      </td>

                      <td className="px-3 py-3">
                        {r.yourNegationPreserved ? (
                          <span className="text-xs bg-teal-950 text-teal-400 px-2 py-0.5 rounded-full">
                            ✓ Yes
                          </span>
                        ) : (
                          <span className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-full">
                            ✗ No
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-rose-400 text-xs">
                        {Number(r.yourWer || 0).toFixed(1)}
                      </td>
                      <td className="px-3 py-3">
                        {isCritical ? (
                          <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3 h-3" /> CRITICAL
                          </span>
                        ) : isModerate ? (
                          <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> MODERATE
                          </span>
                        ) : (
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                            SAFE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Dangerous Cases Highlight — Assessment requires "3 cases where generic AI gets it DANGEROUSLY wrong" */}
      {dangerousCases.length > 0 && (
        <section className="bg-red-950/10 border border-red-900/30 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-bold text-red-300 flex items-center gap-2 mb-4">
            <ShieldAlert className="text-red-400 w-5 h-5" />
            Dangerous Cases — Generic AI Fails Critically (
            {dangerousCases.length} cases)
          </h3>
          <p className="text-zinc-400 text-sm mb-6">
            These are cases where ChatGPT/generic AI produces outputs that could
            lead to patient safety failures — missed negations, wrong drug
            instructions, or lost clinical constraints.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dangerousCases.slice(0, 6).map((r) => {
              const note = notes.find((n) => n.id === r.voiceNoteId);
              return (
                <div
                  key={r.voiceNoteId}
                  className="bg-zinc-950 border border-red-900/30 rounded-2xl p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-red-400 bg-red-950/50 px-2 py-0.5 rounded-md">
                      {r.voiceNoteId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.negationCritical
                          ? "bg-red-900/50 text-red-300"
                          : "bg-amber-900/50 text-amber-300"
                      }`}
                    >
                      {r.negationCritical ? "CRITICAL" : "MODERATE"}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-200 mb-1">
                    {r.specialty}
                  </h4>
                  <p className="text-xs text-zinc-500 mb-3">{r.language}</p>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500">Our: </span>
                      <span className="text-cyan-400 font-bold">
                        {Number(r.yourNodeAccuracy || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">ChatGPT: </span>
                      <span className="text-amber-400 font-bold">
                        {Number(r.chatgptNodeAccuracy || 0).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Δ: </span>
                      <span className="text-red-400 font-bold">
                        +
                        {(
                          Number(r.yourNodeAccuracy || 0) -
                          Number(r.chatgptNodeAccuracy || 0)
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                  {isChatgptNegationMissed(r) && (
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Negation missed by
                      generic AI — patient safety risk
                    </p>
                  )}
                  {note && note.why_fails.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-2 italic truncate">
                      &ldquo;{note.why_fails[0]}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grid of Notes — Test Case Runner */}
      <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-zinc-200">
            Test Cases Database
          </h3>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-900/50 px-3 py-1 rounded-full">
            {completedCount} / {notes.length} Tested ({asrProvider})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map((note) => {
            const isCompleted = getNoteStatus(note.id);
            const isCurrentlyRunning = runningNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`bg-zinc-950 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300
                  ${isCompleted ? "border-cyan-900/50 shadow-lg shadow-cyan-900/5" : "border-zinc-800 hover:border-zinc-700"}
                  ${isCurrentlyRunning ? "animate-pulse border-cyan-500/50" : ""}
                `}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md">
                      {note.id}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                    ) : isCurrentlyRunning ? (
                      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-700" />
                    )}
                  </div>
                  <h4 className="font-semibold text-zinc-200 text-sm mb-1">
                    {note.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {note.translation}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/50">
                  <span className="text-xs font-medium text-zinc-500">
                    {note.languages}
                  </span>
                  <button
                    onClick={() => handleRunSingle(note.id)}
                    disabled={isRunningAll || isCurrentlyRunning}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Run Test
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
