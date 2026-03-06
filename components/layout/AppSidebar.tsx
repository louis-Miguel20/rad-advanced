"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Database, 
  Brain, 
  LayoutGrid,
  Zap,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [topK, setTopK] = useState(5);
  const [creativity, setCreativity] = useState(0.7);
  const [documents, setDocuments] = useState<{id: string, name: string}[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Efecto para cargar documentos al inicio
  useEffect(() => {
    fetchDocuments();
    window.addEventListener('document-uploaded', fetchDocuments);
    return () => window.removeEventListener('document-uploaded', fetchDocuments);
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 240 && newWidth < 480) {
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  function handleDeleteClick(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!documentToDelete) return;
    
    try {
      const res = await fetch(`/api/documents?id=${documentToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== documentToDelete));
        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado correctamente."
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar documento",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  }

  return (
    <div 
      ref={sidebarRef}
      className={cn("bg-gradient-to-b from-[#0f172a] to-[#020617] border-r border-[#1e293b] flex flex-col h-full text-[#f8fafc] shrink-0 relative group/sidebar", className)}
      style={{ width: width }}
    >
      {/* Resizer Handle */}
      <div
        className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-cyan-500/50 transition-colors z-50"
        onMouseDown={startResizing}
      />

      {/* Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center gap-3 shrink-0 bg-[#020617]/30 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center shadow-lg shadow-[#0891b2]/20 ring-1 ring-[#22d3ee]/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-[#cbd5e1]">Nexus RAG</span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6 pb-10">
          
          {/* Espacio de Trabajo */}
          <section>
            <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-1">
              Espacio de Trabajo
            </h3>
            <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] hover:bg-[#2a2a2a] hover:text-white font-normal">
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#0891b2]" />
                Mi Espacio
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </section>

          {/* Bases de Conocimiento */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
                Bases de Conocimiento
              </h3>
            </div>
            <div className="space-y-1 mb-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center px-3 py-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors text-[#71717a] hover:text-[#f5f5f5]">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-[#71717a] hover:text-red-500 hover:bg-red-500/10 shrink-0 mr-2"
                      onClick={(e) => handleDeleteClick(doc.id, e)}
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                      <Database className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate" title={doc.name}>{doc.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-[#71717a] italic">
                  No hay documentos
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full justify-start text-[#0891b2] hover:text-[#0891b2] hover:bg-[#0891b2]/10 h-8 text-xs font-medium px-2" onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.click();
            }}>
              <Plus className="w-3 h-3 mr-2" />
              Agregar nueva fuente
            </Button>
          </section>

          {/* Configuración RAG */}
          <section className="space-y-4 pt-4 border-t border-[#2a2a2a]">
            <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider px-1">
              Configuración RAG
            </h3>
            
            {/* Top-K Slider */}
            <div className="space-y-3 px-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#d4d4d8]">Top-K</span>
                <span className="font-mono text-[#0891b2] bg-[#0891b2]/10 px-1.5 rounded text-xs">{topK}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                style={{accentColor: '#22c55e'}}
              />
            </div>

            {/* Creatividad Slider */}
            <div className="space-y-3 px-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#d4d4d8]">Creatividad</span>
                <span className="font-mono text-[#0891b2] bg-[#0891b2]/10 px-1.5 rounded text-xs">{creativity}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={creativity}
                onChange={(e) => setCreativity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                style={{accentColor: '#22c55e'}}
              />
            </div>

            {/* Dropdowns */}
            <div className="space-y-3 px-1">
              <div className="space-y-1.5">
                <label className="text-xs text-[#71717a]">Modelo</label>
                <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] h-9 text-xs font-normal hover:bg-[#2a2a2a] hover:text-white">
                  <span>GPT-4o</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#71717a]">Estrategia de búsqueda</label>
                <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] h-9 text-xs font-normal hover:bg-[#2a2a2a] hover:text-white">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#eab308]" />
                    Híbrida
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5]">
          <DialogHeader>
            <DialogTitle>¿Eliminar documento?</DialogTitle>
            <DialogDescription className="text-[#a1a1aa]">
              Esta acción no se puede deshacer. El documento será eliminado permanentemente de la base de conocimiento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-transparent border-[#2a2a2a] text-[#f5f5f5] hover:bg-[#2a2a2a] hover:text-white">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-900">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
