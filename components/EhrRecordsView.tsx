"use client";

import {
  Calendar,
  FileCheck,
  FileText,
  HeartPulse,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";

type KnowledgeNode = {
  id: number;
  type: "CONSTRAINT" | "DECISION" | "ANTI_PATTERN" | "FACT";
  title: string;
  content: string;
  importance: string;
};

type EhrRecord = {
  id: number;
  doctorId: string;
  patientId: string | null;
  languageCode: string;
  asrProvider: string;
  rawTranscript: string;
  correctedTranscript: string | null;
  confirmedTranscript: string | null;
  overallConfidence: string | null;
  pipelineTimeMs: number | null;
  confirmedAt: Date | string | null;
  createdAt: Date | string;
  knowledgeNodes?: KnowledgeNode[];
};

export default function EhrRecordsView({
  records = [],
}: {
  records: EhrRecord[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(
    records.length > 0 ? records[0].id : null,
  );

  // Filter records based on search query
  const filteredRecords = records.filter((rec) => {
    const query = searchQuery.toLowerCase();
    return (
      rec.doctorId.toLowerCase().includes(query) ||
      (rec.patientId || "").toLowerCase().includes(query) ||
      (rec.confirmedTranscript || "").toLowerCase().includes(query) ||
      rec.asrProvider.toLowerCase().includes(query)
    );
  });

  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNodeTypeStyles = (type: string) => {
    switch (type) {
      case "CONSTRAINT":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "DECISION":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "ANTI_PATTERN":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50";
    }
  };

  const getAsrBadgeStyles = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes("whisper"))
      return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    if (p.includes("sarvam"))
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
    return "bg-zinc-800 text-zinc-400 border-zinc-700";
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px] items-stretch">
      {/* Left Column: Search & Records List */}
      <div className="lg:col-span-4 flex flex-col gap-4 bg-zinc-950 border border-zinc-800/60 rounded-3xl p-5 shadow-2xl h-[650px]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search records by doctor, patient, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
          {filteredRecords.length === 0 ? (
            <div className="text-zinc-500 text-xs py-16 text-center font-medium font-sans">
              No EHR records found
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isActive = rec.id === selectedRecordId;
              return (
                <button
                  type="button"
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-2.5 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900/90 border-cyan-500/40 shadow-lg"
                      : "bg-zinc-900/20 border-zinc-850 hover:bg-zinc-900/40 hover:border-zinc-805"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-zinc-200 font-mono">
                      #{rec.id}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${getAsrBadgeStyles(
                        rec.asrProvider,
                      )}`}
                    >
                      {rec.asrProvider}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {rec.confirmedTranscript || rec.rawTranscript}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 border-t border-zinc-800/40 pt-2.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 shrink-0 text-zinc-650" />
                      {rec.doctorId}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-zinc-650" />
                      {
                        formatDate(rec.confirmedAt || rec.createdAt).split(
                          ",",
                        )[0]
                      }
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Detailed Record View */}
      <div className="lg:col-span-8 flex flex-col gap-6 bg-zinc-950 border border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl h-[650px] overflow-y-auto custom-scrollbar">
        {selectedRecord ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-150 flex items-center gap-2">
                  <FileCheck className="text-cyan-400 w-5 h-5" />
                  EHR Capture Record #{selectedRecord.id}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                  Sign-off Date:{" "}
                  {formatDate(
                    selectedRecord.confirmedAt || selectedRecord.createdAt,
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Status: Signed
                </span>
              </div>
            </div>

            {/* Meta Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-900/10 border border-zinc-900 p-4 rounded-2xl">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Attending Doctor
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1 font-mono">
                  {selectedRecord.doctorId}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  ASR Provider
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1 uppercase font-mono">
                  {selectedRecord.asrProvider}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Pipeline Latency
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1 font-mono">
                  {selectedRecord.pipelineTimeMs
                    ? `${(selectedRecord.pipelineTimeMs / 1000).toFixed(2)}s`
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Source Script
                </div>
                <div className="text-xs font-semibold text-zinc-300 mt-1 font-mono">
                  {selectedRecord.languageCode === "mix"
                    ? "Code-Mixed"
                    : selectedRecord.languageCode}
                </div>
              </div>
            </div>

            {/* Transcript Panel */}
            <div className="bg-zinc-900/20 border border-zinc-905 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-850 pb-2.5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  Final Confirmed Transcript
                </h4>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedRecord.confirmedTranscript ||
                  selectedRecord.correctedTranscript ||
                  selectedRecord.rawTranscript}
              </p>
            </div>

            {/* Final Extracted EHR Nodes */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                Final EHR Knowledge Nodes (
                {selectedRecord.knowledgeNodes?.length || 0})
              </h4>

              {selectedRecord.knowledgeNodes &&
              selectedRecord.knowledgeNodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedRecord.knowledgeNodes.map((node) => {
                    const isConstraint = node.type === "CONSTRAINT";
                    const isAntiPattern = node.type === "ANTI_PATTERN";
                    const isDecision = node.type === "DECISION";

                    return (
                      <div
                        key={node.id}
                        className="bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all duration-300"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded ${getNodeTypeStyles(
                                node.type,
                              )}`}
                            >
                              {node.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold font-mono">
                              Imp: {node.importance}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-zinc-200 mb-1 leading-snug">
                            {node.title}
                          </h5>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            {node.content}
                          </p>
                        </div>

                        {/* Slider indicator (read only) */}
                        <div className="mt-4 pt-3 border-t border-zinc-850/50">
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isConstraint
                                  ? "bg-rose-500"
                                  : isAntiPattern
                                    ? "bg-amber-500"
                                    : isDecision
                                      ? "bg-cyan-500"
                                      : "bg-zinc-500"
                              }`}
                              style={{
                                width: `${parseFloat(node.importance) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-zinc-650 text-xs py-8 text-center bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                  No knowledge nodes were extracted or saved for this record.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-550 gap-3 font-sans">
            <Sparkles className="w-8 h-8 text-zinc-700" />
            <p className="text-sm">
              Select an EHR record from the left panel to inspect details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
