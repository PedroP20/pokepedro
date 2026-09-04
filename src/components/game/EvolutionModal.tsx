"use client";

import { EvolutionNode, EvolutionTreeNode } from "@/types/pokemon";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  evolutions: EvolutionNode[];
  evolutionTree?: EvolutionTreeNode | null;
  currentId: number;
  onNavigate?: (id: number) => void;
}

interface TreeEntry { node: EvolutionTreeNode; stage: number }

const buildStages = (root: EvolutionTreeNode): TreeEntry[][] => {
  const stages: TreeEntry[][] = [];
  const walk = (node: EvolutionTreeNode, stage: number) => {
    (stages[stage] ||= []).push({ node, stage });
    node.evolvesTo.forEach((child) => walk(child, stage + 1));
  };
  walk(root, 0);
  return stages;
};

function EvolutionCard({ entry, currentId, onNavigate }: { entry: TreeEntry; currentId: number; onNavigate?: (id: number) => void }) {
  const { node, stage } = entry;
  const isCurrent = node.id === currentId;
  return (
    <button
      onClick={() => onNavigate?.(node.id)}
      disabled={!onNavigate || isCurrent}
      className={`relative w-[132px] sm:w-[148px] rounded-2xl border p-2.5 text-center transition shadow-sm disabled:cursor-default ${isCurrent ? "bg-[#2A75BB]/10 border-[#2A75BB] ring-2 ring-[#2A75BB]/20 shadow-[#2A75BB]/15" : "bg-[#FFFFFF] border-[#D9D9D9] hover:border-[#2A75BB] hover:-translate-y-0.5 hover:shadow-md"}`}
      aria-label={`Abrir detalhes de ${node.name}`}
    >
      <span className="absolute left-2 top-2 rounded-full bg-[#F5F5F5] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-[#1E1E1E]/55">Estágio {stage + 1}</span>
      <div className="relative mx-auto mt-2 h-16 w-16 sm:h-[72px] sm:w-[72px]">
        <Image src={node.spriteUrl} alt={node.name} fill sizes="72px" className="object-contain drop-shadow-sm" unoptimized />
      </div>
      <p className="mt-1 text-[10px] font-bold text-[#1E1E1E]/55">#{String(node.id).padStart(4, "0")}</p>
      <p className={`truncate text-xs sm:text-sm font-black ${isCurrent ? "text-[#1B4F9C]" : "text-[#1E1E1E]"}`}>{node.name}</p>
      {isCurrent && <span className="mt-1 inline-block rounded-full bg-[#EE1515] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">Atual</span>}
      {!isCurrent && onNavigate && <span className="mt-1 block text-[9px] font-bold text-[#2A75BB]">Ver detalhes ↗</span>}
      {node.conditions.length > 0 && <div className="mt-2 border-t border-[#D9D9D9]/70 pt-1.5">{node.conditions.slice(0, 2).map((condition) => <p key={condition} className="text-[9px] leading-tight text-[#1E1E1E]/65">{condition}</p>)}{node.conditions.length > 2 && <p className="text-[9px] text-[#1E1E1E]/50">+{node.conditions.length - 2} condição(ões)</p>}</div>}
    </button>
  );
}

export default function EvolutionModal({ isOpen, onClose, evolutions, evolutionTree, currentId, onNavigate }: EvolutionModalProps) {
  if (!isOpen) return null;
  const tree = evolutionTree || (evolutions[0] ? { ...evolutions[0], conditions: [], evolvesTo: [] } : null);
  const stages = tree ? buildStages(tree) : [];
  const hasEvolution = Boolean(tree?.evolvesTo.length);
  const navigate = (id: number) => { if (id !== currentId && onNavigate) { onClose(); onNavigate(id); } };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative z-10 flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-[#D9D9D9] bg-[#FFFFFF] shadow-2xl font-navbar" role="dialog" aria-modal="true" aria-label="Cadeia evolutiva">
          <div className="flex items-start justify-between gap-3 border-b border-[#D9D9D9] bg-gradient-to-r from-[#F5F5F5] to-[#FFFFFF] px-4 py-4 sm:px-6">
            <div><h3 className="flex items-center gap-2 text-lg sm:text-2xl font-black text-[#1B4F9C] font-heading"><span>🧬</span> Cadeia Evolutiva</h3><p className="mt-0.5 text-[11px] sm:text-sm font-medium text-[#1E1E1E]/65">Toque em uma forma para abrir seus detalhes.</p></div>
            <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D9D9D9] bg-[#FFFFFF] font-bold text-[#1E1E1E] transition hover:bg-[#F5F5F5]" aria-label="Fechar cadeia evolutiva">✕</button>
          </div>
          {!tree || !hasEvolution ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center"><span className="text-5xl">🌱</span><h4 className="text-lg font-black text-[#1E1E1E] font-heading">Este Pokémon não possui uma cadeia evolutiva.</h4><p className="max-w-sm text-sm text-[#1E1E1E]/60">Ele já está na sua forma final ou não possui evoluções conhecidas.</p></div>
          ) : (
            <div className="flex-1 overflow-auto bg-[#F5F5F5]/70 p-3 sm:p-6 custom-scrollbar">
              <div className="mb-3 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-[#1E1E1E]/50"><span className="rounded-full bg-[#2A75BB]/10 px-2 py-1 text-[#1B4F9C]">{stages.length} estágios</span><span className="hidden sm:inline">Role horizontalmente para explorar todos os caminhos</span><span className="sm:hidden">Deslize para explorar os caminhos</span></div>
              <div className="flex min-w-max items-center gap-2 sm:gap-5 pb-3">{stages.map((entries, stageIndex) => <div key={stageIndex} className="flex items-center gap-2 sm:gap-5"><div className={`grid gap-2 sm:gap-3 ${entries.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{entries.map((entry, entryIndex) => <EvolutionCard key={`${entry.node.id}-${entryIndex}`} entry={entry} currentId={currentId} onNavigate={navigate} />)}</div>{stageIndex < stages.length - 1 && <span className="text-xl sm:text-3xl font-black text-[#2A75BB]/45" aria-hidden="true">→</span>}</div>)}</div>
            </div>
          )}
          <div className="border-t border-[#D9D9D9] p-3 sm:p-4"><button onClick={onClose} className="w-full rounded-xl bg-[#1B4F9C] py-3 text-xs sm:text-sm font-black text-white shadow-md transition hover:bg-[#2A75BB] font-button">Voltar para a Pokédex</button></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
