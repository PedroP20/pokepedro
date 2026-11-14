"use client";
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ACHIEVEMENTS, type AchievementCategory, CATEGORY_LABELS, TIER_COLORS, TIER_LABELS } from '@/lib/achievements';
import { getAchievementValue, useAchievementStore } from '@/store/useAchievementStore';
import ClubIcon from '@/components/ui/ClubIcon';
type Filter = 'TODAS' | 'DESBLOQUEADAS' | 'BLOQUEADAS' | AchievementCategory;
const subscribe = () => () => {};
const date = (timestamp: number) => new Intl.DateTimeFormat('pt-BR', { dateStyle:'medium' }).format(timestamp);
export default function AchievementsPage() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const progress = useAchievementStore(s => s.progress);
  const [filter, setFilter] = useState<Filter>('TODAS');
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState('PROXIMAS');
  const unlocked = hydrated ? ACHIEVEMENTS.filter(item => progress.unlocked[item.id]) : [];
  const points = unlocked.reduce((sum,item) => sum + item.points,0);
  const list = ACHIEVEMENTS.filter(item => {
    const earned = hydrated && Boolean(progress.unlocked[item.id]);
    const text = item.secret && !earned ? '' : `${item.name} ${item.description}`;
    return (filter === 'TODAS' || (filter === 'DESBLOQUEADAS' && earned) || (filter === 'BLOQUEADAS' && !earned) || item.category === filter) && text.toLowerCase().includes(search.toLowerCase());
  }).sort((a,b) => order === 'RECENTES' ? (progress.unlocked[b.id] || 0) - (progress.unlocked[a.id] || 0) : order === 'RARIDADE' ? b.points - a.points : (a.target - getAchievementValue(progress,a))/a.target - (b.target-getAchievementValue(progress,b))/b.target);
  return <main id="main-content" className="club-page achievements-page"><header className="page-intro"><div><span className="eyebrow"><ClubIcon name="trophy" size={16}/> COLEÇÃO DE CONQUISTAS</span><h1>Cada desafio,<br className="sm:hidden"/> uma recompensa<span>.</span></h1><p>Marcos da sua jornada. Pequenas vitórias que fazem um grande treinador.</p></div><Link href="/play" className="club-button blue">Ir para o próximo desafio <ClubIcon name="arrow" size={18}/></Link></header>
    <section className="achievement-summary"><div className="achievement-level"><span className="level-medal"><ClubIcon name="trophy" size={32}/></span><div><span className="eyebrow">SEU NÍVEL DE TREINADOR</span><h2>Nível {Math.floor(points / 250) + 1}</h2><div className="club-progress"><span style={{width:`${points % 250 / 250 * 100}%`}}/></div><p>{points % 250} / 250 XP para o próximo nível</p></div></div><article><strong>{unlocked.length}<small> / {ACHIEVEMENTS.length}</small></strong><span>Conquistas desbloqueadas</span></article><article><strong>{points}<small> XP</small></strong><span>Pontos conquistados</span></article><article><strong>{Math.round(unlocked.length/ACHIEVEMENTS.length*100)}<small>%</small></strong><span>Da coleção completa</span></article></section>
    <section className="achievement-filters"><div className="achievement-tabs">{([['TODAS','Todas'],['DESBLOQUEADAS','Conquistadas'],['BLOQUEADAS','A caminho'],...Object.entries(CATEGORY_LABELS)] as [Filter,string][]).map(([id,label]) => <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label}</button>)}</div><div className="achievement-search"><label className="dex-search"><ClubIcon name="search" size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conquista" aria-label="Buscar conquista"/></label><select value={order} aria-label="Ordenar conquistas" onChange={e => setOrder(e.target.value)}><option value="PROXIMAS">Mais próximas</option><option value="RECENTES">Recentes</option><option value="RARIDADE">Raridade</option></select></div></section>
    <div className="achievement-grid">{list.map(item => {
      const earned = hydrated ? progress.unlocked[item.id] : undefined;
      const value = hydrated ? getAchievementValue(progress,item) : 0;
      const percent = Math.min(100,Math.round(value/item.target*100));
      const hidden = item.secret && !earned;
      return <article key={item.id} className={`achievement-card ${earned ? 'is-earned' : ''}`}><div className="achievement-card-top"><span className="achievement-emblem">{hidden ? '🔒' : item.icon}</span><span className={`achievement-tier ${TIER_COLORS[item.tier]}`}>{TIER_LABELS[item.tier]}</span></div><h2>{hidden ? 'Conquista secreta' : item.name}</h2><p>{hidden ? 'Continue explorando. Esta surpresa espera por você.' : item.description}</p><div className="achievement-meter"><span>{value} / {item.target}</span><b>{percent}%</b></div><div className="club-progress"><span style={{width:`${percent}%`}}/></div><div className="achievement-card-footer"><b>+{item.points} XP</b><span>{earned ? `✓ ${date(earned)}` : 'Em progresso'}</span></div></article>;
    })}</div>{!list.length && <section className="club-empty"><ClubIcon name="search" size={36}/><h2>Nenhuma conquista encontrada.</h2><p>Experimente outra busca ou categoria.</p></section>}
  </main>;
}
