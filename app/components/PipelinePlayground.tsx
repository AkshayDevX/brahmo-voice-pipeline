"use client";

import {
  Activity,
  AlertCircle,
  Brain,
  Check,
  ChevronDown,
  Database,
  Edit,
  FileText,
  Globe,
  Loader2,
  Mic,
  Pill,
  Play,
  Plus,
  Search,
  Server,
  Sparkles,
  Stethoscope,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { confirmDoctorReviewAction } from "@/actions/pipeline";
import { processAudioAction } from "@/actions/process-audio";

type KnowledgeNode = {
  type?: string;
  title?: string;
  content?: string;
  importance?: number;
};

type Results = {
  rawTranscript: string;
  correctedTranscript: string;
  ourNodes: KnowledgeNode[];
  baselines?: {
    chatgpt?: KnowledgeNode[];
    deepseek?: KnowledgeNode[];
  };
  pipelineTimeMs: number;
};

const LANGUAGES = [
  {
    value: "multi",
    label: "Multilingual",
    native: "Sarvam AI",
    provider: "Sarvam Cloud",
    group: "Smart Routing",
  },
  {
    value: "en",
    label: "English",
    native: "Whisper Large V3",
    provider: "Groq Cloud",
    group: "Smart Routing",
  },
];

interface LanguageSearchSelectProps {
  value: string;
  onChange: (val: string) => void;
}

function LanguageSearchSelect({ value, onChange }: LanguageSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];

  // Filter languages
  const filtered = LANGUAGES.filter(
    (l) =>
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase()) ||
      l.value.toLowerCase().includes(search.toLowerCase()) ||
      l.group.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on click outside
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

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      // Scroll active item into view
      setTimeout(() => {
        const activeEl = listRef.current?.querySelectorAll("[data-item-btn]")[
          activeIndex + 1
        ] as HTMLElement;
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest" });
        }
      }, 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      setTimeout(() => {
        const activeEl = listRef.current?.querySelectorAll("[data-item-btn]")[
          activeIndex - 1
        ] as HTMLElement;
        if (activeEl) {
          activeEl.scrollIntoView({ block: "nearest" });
        }
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
        Language
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 text-zinc-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm h-[46px] flex items-center justify-between text-left shadow-inner cursor-pointer"
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
              placeholder="Search languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-150 focus:outline-none placeholder:text-zinc-600 py-0.5"
            />
          </div>

          <div
            ref={listRef}
            className="max-h-50 overflow-y-auto p-1.5 flex flex-col gap-0.5 custom-scrollbar"
          >
            {filtered.length === 0 ? (
              <div className="text-zinc-600 text-xs py-6 text-center font-medium">
                No languages found
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
                        <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider px-2 py-1 mt-1.5 first:mt-0.5">
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

interface ModernSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; sublabel?: string }[];
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
}

function ModernSelect({
  value,
  onChange,
  options,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 bg-zinc-950/90 border border-zinc-800 text-zinc-350 rounded-xl px-3.5 py-2 text-xs font-bold hover:border-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all cursor-pointer shadow-inner ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={`absolute left-0 mt-1.5 w-60 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl z-50 backdrop-blur-xl p-1.5 flex flex-col gap-0.5 max-h-64 overflow-y-auto custom-scrollbar ${dropdownClassName}`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex flex-col px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                opt.value === value
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
              }`}
            >
              <span className="text-xs font-bold">{opt.label}</span>
              {opt.sublabel && (
                <span className="text-[9px] text-zinc-500 font-medium mt-0.5">
                  {opt.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const TTS_LANG_OPTIONS = [
  { value: "auto", label: "Auto-detect (Native script)" },
  { value: "en-IN", label: "English (Indian Accent)" },
  { value: "hi-IN", label: "Hindi / Hinglish" },
  { value: "ta-IN", label: "Tamil / Tanglish" },
  { value: "te-IN", label: "Telugu" },
  { value: "kn-IN", label: "Kannada" },
  { value: "ml-IN", label: "Malayalam" },
  { value: "mr-IN", label: "Marathi" },
  { value: "gu-IN", label: "Gujarati" },
  { value: "pa-IN", label: "Punjabi" },
  { value: "od-IN", label: "Odia" },
  { value: "bn-IN", label: "Bengali" },
];

const NODE_TYPE_OPTIONS = [
  { value: "FACT", label: "Fact" },
  { value: "DECISION", label: "Decision" },
  { value: "CONSTRAINT", label: "Constraint" },
  { value: "ANTI_PATTERN", label: "Anti-Pattern" },
];

export default function PipelinePlayground() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Review States
  const [editableTranscript, setEditableTranscript] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editableNodes, setEditableNodes] = useState<KnowledgeNode[]>([]);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Playground state
  const [activeTab, setActiveTab] = useState<"audio" | "text">("audio");
  const [textInput, setTextInput] = useState("");
  const [language, setLanguage] = useState("multi");
  const [ttsLanguage, setTtsLanguage] = useState("auto");
  const [asrProvider, _setAsrProvider] = useState("router");

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAudio(file);
    }
  };

  const processAudio = async (audioData: Blob | File) => {
    setError(null);
    setResults(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("audio", audioData);
        formData.append("languageHint", language);
        formData.append("asrProvider", asrProvider);

        const res = await processAudioAction(formData);
        if (res.success) {
          const resultsData = res.results as any;
          setResults({
            transcriptId: resultsData.transcriptId,
            rawTranscript: resultsData.rawTranscript,
            correctedTranscript: resultsData.correctedTranscript,
            ourNodes: Array.isArray(resultsData.ourNodes)
              ? resultsData.ourNodes
              : [],
            baselines: resultsData.baselines,
            pipelineTimeMs: resultsData.pipelineTimeMs,
          });
          setEditableTranscript(resultsData.correctedTranscript || "");
          setEditableNodes(
            Array.isArray(resultsData.ourNodes) ? resultsData.ourNodes : [],
          );
          setReviewSaved(false);
          setReviewError(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to process audio.");
      }
    });
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    setError(null);
    setResults(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("text", textInput);
        formData.append("languageHint", language);
        formData.append("asrProvider", asrProvider);
        formData.append("ttsLanguage", ttsLanguage);

        const res = await processAudioAction(formData);
        if (res.success) {
          const resultsData = res.results as any;
          setResults({
            transcriptId: resultsData.transcriptId,
            rawTranscript: resultsData.rawTranscript,
            correctedTranscript: resultsData.correctedTranscript,
            ourNodes: Array.isArray(resultsData.ourNodes)
              ? resultsData.ourNodes
              : [],
            baselines: resultsData.baselines,
            pipelineTimeMs: resultsData.pipelineTimeMs,
          });
          setEditableTranscript(resultsData.correctedTranscript || "");
          setEditableNodes(
            Array.isArray(resultsData.ourNodes) ? resultsData.ourNodes : [],
          );
          setReviewSaved(false);
          setReviewError(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to process text.");
      }
    });
  };

  const handleAddNode = () => {
    setEditableNodes([
      ...editableNodes,
      { type: "FACT", title: "New Node", content: "", importance: 0.5 },
    ]);
  };

  const handleDeleteNode = (idx: number) => {
    setEditableNodes(editableNodes.filter((_, i) => i !== idx));
  };

  const handleUpdateNode = (idx: number, fields: Partial<KnowledgeNode>) => {
    const newNodes = [...editableNodes];
    newNodes[idx] = { ...newNodes[idx], ...fields };
    setEditableNodes(newNodes);
  };

  const handleConfirmReview = async () => {
    if (!results || !results.transcriptId) return;
    setIsSavingReview(true);
    setReviewError(null);
    try {
      const res = await confirmDoctorReviewAction(
        results.transcriptId,
        editableTranscript,
        editableNodes.map((n) => ({
          type: n.type || "FACT",
          title: n.title || "Untitled Node",
          content: n.content || "",
          importance: n.importance || 0.5,
        })),
      );
      if (res.success) {
        setReviewSaved(true);
      } else {
        setReviewError(res.error || "Failed to save review");
      }
    } catch (e: any) {
      setReviewError(e.message || "Failed to confirm doctor review");
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
      {/* Controls Section */}
      <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.6)] backdrop-blur-md relative flex flex-col gap-6 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-cyan-500/30 before:to-transparent">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Stethoscope className="text-cyan-400 w-6 h-6 animate-pulse" />
            Clinical Voice Pipeline
          </h2>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab("audio")}
              className={`px-4.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === "audio" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-950/20" : "text-zinc-400 hover:text-zinc-200 border border-transparent"}`}
            >
              Voice Note
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`px-4.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === "text" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-950/20" : "text-zinc-400 hover:text-zinc-200 border border-transparent"}`}
            >
              Text Input
            </button>
          </div>
        </div>

        {/* Global Selectors (Engine & Language) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
              ASR Routing Engine
            </label>
            <div className="w-full bg-zinc-950/50 border border-zinc-800/80 text-zinc-100 rounded-xl px-4 py-2.5 text-xs flex flex-col justify-center gap-1 min-h-[46px] shadow-inner">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Brahmo ASR Router
              </span>
              <span className="text-zinc-500 text-[10px] truncate">
                Groq (EN) &bull; Sarvam (Indic)
              </span>
            </div>
          </div>
          <div>
            <LanguageSearchSelect value={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Dynamic Input Area */}
        <div className="min-h-[220px] flex items-center justify-center border-2 border-dashed border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-8 bg-zinc-950/40 shadow-inner transition-all duration-300">
          {isPending ? (
            <div className="flex flex-col items-center gap-4 text-cyan-400 py-6">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              <p className="font-semibold tracking-wide text-sm animate-pulse text-zinc-350">
                Running medical intelligence extraction...
              </p>
            </div>
          ) : activeTab === "audio" ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-xl">
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-950/40 transition-all cursor-pointer border border-red-500/20"
                  >
                    <Mic className="w-5 h-5" />
                    Record Note
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all animate-pulse border border-zinc-700 cursor-pointer shadow-red-950/20"
                  >
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                    </span>
                    Stop & Process
                  </button>
                )}
                <div className="text-zinc-600 font-black text-xs tracking-wider uppercase">
                  OR
                </div>
                <label className="flex items-center justify-center gap-3 bg-zinc-800/80 hover:bg-zinc-700 hover:border-zinc-650 cursor-pointer text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all border border-zinc-750">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  Upload Audio
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full animate-in fade-in-50 duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 shadow-md">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-200">TTS Base Accent / Language</span>
                  <span className="text-[10px] text-zinc-500">Crucial for pronouncing transliterated Hinglish or regional languages correctly</span>
                </div>
                <ModernSelect
                  value={ttsLanguage}
                  onChange={setTtsLanguage}
                  options={TTS_LANG_OPTIONS}
                  buttonClassName="min-w-[200px]"
                  dropdownClassName="right-0 left-auto"
                />
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or paste the clinical notes text here (it will be synthesized to speech and run through ASR)..."
                className="w-full h-36 bg-zinc-900/50 border border-zinc-700/80 text-zinc-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none placeholder:text-zinc-600 text-sm leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all cursor-pointer border border-cyan-500/10"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Synthesize & Run ASR Router
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </section>

      {/* Results Section */}
      {results && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Sparkles className="text-cyan-400 w-5 h-5" />
              Pipeline Results
            </h3>
            <span className="text-xs font-mono bg-zinc-900/80 text-zinc-400 px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-md">
              Processed in {results.pipelineTimeMs}ms
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transcripts Column */}
            <div className="flex flex-col gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700" />
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Raw ASR Output
                </h4>
                <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                  {results.rawTranscript || "No transcript returned."}
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-cyan-900/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-teal-500" />
                <div className="flex justify-between items-center mb-3.5">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Corrected (Intelligence
                    Layer)
                  </h4>
                  <button
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20 transition-all font-bold cursor-pointer"
                  >
                    {isEditingTranscript ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Edit className="w-3.5 h-3.5" />
                    )}
                    {isEditingTranscript ? "Done" : "Edit"}
                  </button>
                </div>

                {isEditingTranscript ? (
                  <textarea
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full h-40 bg-zinc-950 border border-cyan-500/50 focus:border-cyan-500 text-zinc-100 rounded-xl p-4 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm leading-relaxed font-medium resize-none"
                  />
                ) : (
                  <p className="text-zinc-100 leading-relaxed text-sm font-semibold whitespace-pre-wrap">
                    {editableTranscript ||
                      results.correctedTranscript ||
                      "No corrected transcript."}
                  </p>
                )}
              </div>
            </div>

            {/* Extracted Nodes Column */}
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col h-full">
              <div className="flex justify-between items-center mb-4.5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Extracted Knowledge Nodes
                </h4>
                <button
                  onClick={handleAddNode}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Node
                </button>
              </div>

              <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                {editableNodes && editableNodes.length > 0 ? (
                  editableNodes.map((node, i) => (
                    <div
                      key={i}
                      className={`bg-zinc-950/80 border rounded-xl p-4 transition-all flex flex-col gap-3.5 relative group shrink-0
                      ${
                        node.type === "CONSTRAINT"
                          ? "border-rose-500/20 border-l-4 border-l-rose-500 bg-rose-950/5"
                          : node.type === "DECISION"
                            ? "border-amber-500/20 border-l-4 border-l-amber-500 bg-amber-950/5"
                            : node.type === "ANTI_PATTERN"
                              ? "border-orange-500/20 border-l-4 border-l-orange-500 bg-orange-950/5"
                              : "border-zinc-800/80 border-l-4 border-l-zinc-600 bg-zinc-900/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <ModernSelect
                          value={node.type || "FACT"}
                          onChange={(val) => handleUpdateNode(i, { type: val })}
                          options={NODE_TYPE_OPTIONS}
                          buttonClassName={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border-l-2 bg-zinc-900/85
                            ${
                              node.type === "CONSTRAINT"
                                ? "text-rose-450 border-rose-500/20 border-l-rose-550"
                                : node.type === "DECISION"
                                  ? "text-amber-450 border-amber-500/20 border-l-amber-550"
                                  : node.type === "ANTI_PATTERN"
                                    ? "text-orange-450 border-orange-500/20 border-l-orange-550"
                                    : "text-zinc-400 border-zinc-700 border-l-zinc-500"
                            }`}
                        />

                        <button
                          onClick={() => handleDeleteNode(i)}
                          className="text-zinc-650 hover:text-rose-450 transition-colors p-1 cursor-pointer"
                          title="Delete node"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={node.title || ""}
                          onChange={(e) =>
                            handleUpdateNode(i, { title: e.target.value })
                          }
                          placeholder="Node Title"
                          className="bg-zinc-900/40 border border-zinc-850/80 text-zinc-100 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-zinc-600"
                        />
                        <textarea
                          value={node.content || ""}
                          onChange={(e) =>
                            handleUpdateNode(i, { content: e.target.value })
                          }
                          placeholder="Node content or clinical explanation..."
                          rows={2}
                          className="bg-zinc-900/40 border border-zinc-850/80 text-zinc-300 rounded-lg p-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder:text-zinc-600 resize-none font-medium"
                        />
                      </div>

                      <div className="flex items-center gap-3 bg-zinc-900/30 p-2 rounded-lg border border-zinc-800/40 shadow-inner">
                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider whitespace-nowrap">
                          Clinical Importance:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={node.importance ?? 0.5}
                          onChange={(e) =>
                            handleUpdateNode(i, {
                              importance: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 accent-cyan-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-zinc-400 w-8 text-right">
                          {(node.importance ?? 0.5).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-zinc-500 border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20">
                    <Pill className="w-8 h-8 mb-3 opacity-20 animate-pulse text-cyan-400" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      No clinical nodes.
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Click &quot;Add Node&quot; to begin building context.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Final Doctor Review Approval Footer */}
            <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-zinc-950 to-zinc-900/70 border border-zinc-850/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-2 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-1.5 before:h-full before:bg-gradient-to-b before:from-cyan-500 before:to-teal-500">
              <div className="flex items-start gap-3.5">
                <AlertCircle className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-200">
                    Clinical Sign-off Required
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                    Review the raw audio transcript, medical intelligence
                    auto-corrections, and extracted nodes. Make edits where
                    necessary. Clicking confirm commits these nodes to the
                    Electronic Health Record (EHR).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                {reviewSaved ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-450 bg-emerald-500/10 px-5 py-3 rounded-xl border border-emerald-500/25 text-sm font-bold shadow-lg shadow-emerald-950/20 animate-in zoom-in-95">
                    <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                    EHR Commit Complete
                  </div>
                ) : (
                  <>
                    {reviewError && (
                      <div className="text-xs text-rose-450 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/25">
                        {reviewError}
                      </div>
                    )}
                    <button
                      onClick={handleConfirmReview}
                      disabled={isSavingReview || !results.transcriptId}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white px-7 py-3 rounded-xl font-bold shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50 disabled:hover:scale-100 min-w-[200px] border border-cyan-500/10 cursor-pointer"
                    >
                      {isSavingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving to EHR...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Confirm & Save to EHR
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
