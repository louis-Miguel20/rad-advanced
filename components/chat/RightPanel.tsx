"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Source {
  title: string;
  page?: number;
  content: string;
  similarity?: number; // 0-1
  url?: string;
}

export interface Trace {
  step: string;
  query: string;
  latency: number;
  resultCount: number;
  timestamp: string;
}

interface RightPanelProps {
  sources: Source[];
  traces?: Trace[];
}

export function RightPanel({ sources = [], traces = [] }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'traces'>('sources');

  // Las trazas actualmente no se usan pero se mantienen para implementación futura
  // console.log(traces);

  return (
    <div className="w-[320px] bg-gradient-to-b from-[#0f172a] to-[#020617] border-l border-[#1e293b] flex flex-col h-full shrink-0">
      <div className="flex border-b border-[#1e293b] bg-[#020617]/30 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('sources')}
          className={cn(
            "flex-1 py-3 text-xs font-semibold tracking-wider transition-all border-b-2",
            activeTab === 'sources' 
              ? "border-[#22d3ee] text-[#22d3ee] bg-[#0891b2]/5" 
              : "border-transparent text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]/30"
          )}
        >
          FUENTES
        </button>
        <button
          onClick={() => setActiveTab('traces')}
          className={cn(
            "flex-1 py-3 text-xs font-semibold tracking-wider transition-all border-b-2",
            activeTab === 'traces' 
              ? "border-[#22d3ee] text-[#22d3ee] bg-[#0891b2]/5" 
              : "border-transparent text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1e293b]/30"
          )}
        >
          TRAZAS
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'sources' ? (
          <div className="space-y-4">
            {sources.length === 0 ? (
              <div className="text-center text-[#64748b] py-8 text-sm italic">
                No hay fuentes recuperadas para mostrar.
              </div>
            ) : (
              sources.map((source, index) => (
                <Card key={index} className="bg-[#1e293b]/20 border-[#1e293b] text-[#f8fafc] backdrop-blur-sm shadow-lg hover:border-[#0891b2]/30 transition-all duration-300 group">
                  <CardHeader className="p-3 pb-2 space-y-0">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-sm font-medium leading-none flex items-center gap-2 text-[#e2e8f0]">
                        <FileText className="w-3.5 h-3.5 text-[#22d3ee]" />
                        <span className="truncate max-w-[140px] group-hover:text-[#22d3ee] transition-colors" title={source.title}>{source.title}</span>
                        {source.page && <span className="text-[#64748b] text-[10px] font-mono whitespace-nowrap bg-[#0f172a] px-1.5 py-0.5 rounded">p.{source.page}</span>}
                      </CardTitle>
                      {source.similarity !== undefined && (
                        <span className="bg-[#0891b2]/10 text-[#22d3ee] text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap border border-[#0891b2]/20 shadow-[0_0_10px_-3px_rgba(8,145,178,0.3)]">
                          {Math.round(source.similarity * 100)}%
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-xs text-[#94a3b8] line-clamp-3 mb-3 font-mono bg-[#020617]/50 p-2 rounded border border-[#1e293b]/50 leading-relaxed">
                      {source.content}
                    </p>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-[#22d3ee] text-xs hover:text-[#67e8f9] font-medium"
                      onClick={() => source.url && window.open(source.url, '_blank')}
                      disabled={!source.url}
                    >
                      Ver documento completo <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {traces.length === 0 ? (
              <div className="text-center text-[#71717a] py-8 text-sm">
                No hay trazas disponibles.
              </div>
            ) : (
              traces.map((trace, index) => (
                <Card key={index} className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5]">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium text-[#0891b2] flex justify-between">
                      <span>Paso: {trace.step}</span>
                      <span className="text-[#71717a] text-xs">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-xs space-y-2">
                    <div>
                      <span className="text-[#71717a]">Query:</span>
                      <p className="font-mono bg-black/30 p-1 rounded mt-1">{trace.query}</p>
                    </div>
                    <div className="flex justify-between text-[#a1a1aa]">
                      <span>Resultados: {trace.resultCount}</span>
                      <span>Latencia: {trace.latency}ms</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
