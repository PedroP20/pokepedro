"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTypeQuizQuestions } from '@/lib/typeQuiz';
import TypeBadge from '@/components/ui/TypeBadge';
import ClubIcon from '@/components/ui/ClubIcon';
export default function TypeGuide() {
  const [view, setView] = useState<'ALL' | 'SOLO' | 'DUAL'>('ALL');
  const { data: questions = [], isPending, isError, refetch } = useQuery({ queryKey: ['existingTypeCombinations'], queryFn: fetchTypeQuizQuestions, staleTime: Infinity });
  const visible = questions.filter(q => view === 'ALL' || (view === 'SOLO' ? q.defendingTypes.length === 1 : q.defendingTypes.length === 2));
  return <section className="type-guide"><header className="type-guide-header"><span className="guide-book"><ClubIcon name="book" size={28}/></span><div><h2>Conhecer é o primeiro movimento.</h2><p>Fraquezas de tipos únicos e combinações encontradas em Pokémon reais.</p></div></header><div className="guide-tabs" role="group" aria-label="Tipagens no guia">{([['ALL','Todas as tipagens'],['SOLO','Tipos únicos'],['DUAL','Combinações reais']] as const).map(([id,label]) => <button key={id} onClick={() => setView(id)} aria-pressed={view === id}>{label}</button>)}<span>{visible.length} tipagens</span></div>{isError ? <div className="club-empty" role="alert"><h3>O guia não carregou.</h3><button onClick={() => void refetch()} className="club-button blue">Tentar novamente</button></div> : isPending ? <div className="profile-skeleton" role="status">Preparando o guia de tipos…</div> : <div className="guide-grid">{visible.map(q => <article key={q.key}><div className="guide-defenders">{q.defendingTypes.map(type => <TypeBadge key={type} type={type}/>)}</div><span className="guide-arrow">↓</span><span className="guide-label">VULNERÁVEL A</span><div className="guide-attackers">{q.effectiveTypes.map(type => <TypeBadge key={type} type={type}/>)}</div>{!q.effectiveTypes.length && <p>Sem fraquezas de tipo.</p>}</article>)}</div>}</section>;
}
