"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOUR_STEPS = [
  { icon: "🏠", title: "Início", description: "Configure seu desafio: escolha região, filtros, tipo de mídia e como quer responder." },
  { icon: "📖", title: "Pokédex", description: "Explore os Pokémon das nove gerações, com filtros por região e tipo." },
  { icon: "🎓", title: "Academia", description: "Entenda vantagens, fraquezas e os melhores tipos para cada batalha." },
  { icon: "⚡", title: "GOFEST", description: "Acompanhe o calendário do evento, marque capturas e consulte estratégias de reide." },
  { icon: "📚", title: "Revisão", description: "Treine os Pokémon que você errou ou marcou como difíceis." },
  { icon: "🎮", title: "Jogar Agora", description: "Comece uma partida com as configurações escolhidas e acompanhe seu progresso." },
];

const storageKey = (userId: string) => `pokepedro-home-tour-hidden:${userId}`;

export default function HomeTour({ userId }: { userId: string }) {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hideForever, setHideForever] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const isHidden = window.localStorage.getItem(storageKey(userId)) === "true";
      setHideForever(isHidden);
      setIsOpen(!isHidden);
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [userId]);

  const closeTour = () => {
    if (hideForever) window.localStorage.setItem(storageKey(userId), "true");
    setIsOpen(false);
  };

  const openTour = () => {
    setStep(0);
    setHideForever(false);
    setIsOpen(true);
  };

  if (!isReady) return null;
  const currentStep = TOUR_STEPS[step];
  const isLastStep = step === TOUR_STEPS.length - 1;

  return <>
    {hideForever && !isOpen && (
      <button onClick={openTour} className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#1B4F9C] bg-[#FFCB05] text-xl shadow-lg transition hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2A75BB]/40" aria-label="Abrir apresentação do PokéPedro" title="Conheça o PokéPedro">
        ❔
      </button>
    )}

    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1E1E1E]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="tour-title">
          <button className="absolute inset-0 cursor-default" onClick={closeTour} aria-label="Fechar apresentação" />
          <motion.section key={step} initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -14 }} transition={{ duration: 0.2 }} className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#FFCB05] bg-white shadow-2xl font-navbar">
            <div className="bg-gradient-to-r from-[#1B4F9C] via-[#2A75BB] to-[#1B4F9C] px-6 pb-8 pt-5 text-center text-white">
              <button onClick={closeTour} className="absolute right-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-sm font-black hover:bg-black/35" aria-label="Fechar">✕</button>
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-4xl shadow-inner">{currentStep.icon}</span>
              <p className="mt-3 text-[10px] font-stats font-black tracking-[0.2em] text-[#FFCB05]">TOUR DO TREINADOR</p>
              <h2 id="tour-title" className="mt-1 font-heading text-3xl font-black">{currentStep.title}</h2>
            </div>
            <div className="space-y-5 p-6 text-center">
              <p className="min-h-12 text-sm leading-relaxed text-[#1E1E1E]/75">{currentStep.description}</p>
              <div className="flex justify-center gap-1.5" aria-label={`Etapa ${step + 1} de ${TOUR_STEPS.length}`}>{TOUR_STEPS.map((item, index) => <span key={item.title} className={`h-2 rounded-full transition-all ${index === step ? "w-6 bg-[#EE1515]" : "w-2 bg-[#D9D9D9]"}`} />)}</div>
              <label className="flex cursor-pointer items-center justify-center gap-2 text-xs font-button font-bold text-[#1E1E1E]/65"><input type="checkbox" checked={hideForever} onChange={(event) => setHideForever(event.target.checked)} className="h-4 w-4 accent-[#EE1515]" />Não mostrar novamente</label>
              <div className="flex gap-2"><button onClick={closeTour} className="rounded-xl px-4 py-2.5 text-xs font-button font-black text-[#1E1E1E]/60 hover:bg-[#F5F5F5]">Pular</button>{step > 0 && <button onClick={() => setStep((current) => current - 1)} className="rounded-xl border border-[#D9D9D9] px-4 py-2.5 text-xs font-button font-black text-[#1B4F9C] hover:bg-[#F5F5F5]">Voltar</button>}<button onClick={() => isLastStep ? closeTour() : setStep((current) => current + 1)} className="ml-auto rounded-xl bg-[#EE1515] px-5 py-2.5 text-xs font-button font-black text-white shadow-md hover:bg-[#cc1010]">{isLastStep ? "Começar!" : "Próximo →"}</button></div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  </>;
}
