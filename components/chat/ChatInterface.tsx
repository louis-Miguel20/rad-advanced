"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RightPanel, Source, Trace } from "./RightPanel";
import { Message } from "ai";
import { Pencil, MoreHorizontal, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInterfaceProps {
  initialMessages?: Message[];
  id?: string;
}

interface RawSource {
  documentTitle?: string;
  title?: string;
  content?: string;
  similarity?: number;
  score?: number;
  page?: number;
  url?: string;
}

interface StreamItem {
  type?: string;
  sources?: RawSource[];
  trace?: Trace;
}

export function ChatInterface({ initialMessages = [], id }: ChatInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, data, append } = useChat({
    api: "/api/chat",
    initialMessages,
    body: { conversationId: id },
    onFinish: () => {
        scrollToBottom();
    },
    onError: (err) => {
        toast({
            title: "Error",
            description: err.message,
            variant: "destructive"
        })
    }
  });

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Extraer fuentes y trazas del flujo de datos o mensajes
  let rawSources: RawSource[] = [];
  let traces: Trace[] = [];
  
  // 1. Intentar obtener fuentes y trazas desde StreamData (método preferido)
  if (data && data.length > 0) {
    const streamItems = data as unknown as StreamItem[];
    const lastSourceData = [...streamItems].reverse().find((item) => item && item.type === 'sources');
    if (lastSourceData && lastSourceData.sources) {
      rawSources = lastSourceData.sources;
    }
    
    // Recopilar todas las trazas
    traces = streamItems
      .filter((item) => item && item.type === 'trace' && item.trace)
      .map((item) => item.trace!);
  }

  // 2. Usar anotaciones como respaldo si el flujo de datos está vacío (para compatibilidad con versiones anteriores)
  if (rawSources.length === 0) {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
        const msg = lastAssistantMessage as Message & { sources?: RawSource[] };
        if (lastAssistantMessage.annotations && lastAssistantMessage.annotations.length > 0) {
            const annotation = lastAssistantMessage.annotations[0] as unknown as { sources: RawSource[] };
            if (annotation?.sources) rawSources = annotation.sources;
        }
        if (msg.sources) rawSources = msg.sources;
    }
  }
  
  // Filtrar fuentes válidas
  const currentSources: Source[] = rawSources
    .filter((s) => s.content)
    .map((s) => ({
      title: s.documentTitle || s.title || "Documento sin título",
      content: s.content || "",
      similarity: s.similarity || s.score,
      page: s.page,
      url: s.url
    }));

  return (
    <div className="flex h-[100dvh] bg-[#0a0a0a] overflow-hidden text-[#f5f5f5] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <AppSidebar className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 md:z-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)' }}>
        {/* Header */}
        <header className="h-14 border-b border-[#1e293b] flex items-center justify-between px-4 md:px-6 bg-[#020617]/50 backdrop-blur-md shrink-0 z-10">
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden h-8 w-8 text-[#71717a] hover:text-[#f5f5f5] -ml-2"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="w-4 h-4" />
                </Button>
                <h2 className="text-[#f5f5f5] font-medium text-sm flex items-center gap-2">
                    Nueva conversación
                    <span className="text-[#71717a] text-xs font-normal ml-2 hidden sm:inline">Hoy, 10:23 AM</span>
                </h2>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-4 scroll-smooth" ref={scrollRef}>
          <div className="max-w-3xl mx-auto w-full pt-4">
            <MessageList messages={messages} />
            {isLoading && <TypingIndicator />}
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 text-red-500 text-sm mt-4 text-center border border-red-500/20">
                    Error: {error.message}
                </div>
            )}
            {/* Spacer for bottom input */}
            <div className="h-4" />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-transparent shrink-0 z-10 border-t border-transparent">
          <ChatInput 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={handleSubmit} 
              isLoading={isLoading}
              append={append}
          />
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel sources={currentSources} traces={traces} />
    </div>
  );
}
