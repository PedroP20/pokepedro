"use client";
import { useState, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useLearningStore } from '@/store/useLearningStore';
import { useAchievementStore } from '@/store/useAchievementStore';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { fetchPokemonMasterList } from '@/queries/pokeApi';
import UserAvatar from '@/components/UserAvatar';
import ClubIcon from '@/components/ui/ClubIcon';
const subscribe = () => () => {};
export default function ProfilePage() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const { user, logout, isLoading, isSyncing } = useAuthStore();
  const stats = useLearningStore(s => s.stats);
  const progress = useAchievementStore(s => s.progress);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const { data: catalog = [] } = useQuery({ queryKey: ['pokemonMasterList'], queryFn: fetchPokemonMasterList, staleTime: Infinity, enabled: Boolean(user) });
  const all = hydrated ? Object.values(stats) : [];
  const mastered = all.filter(p => p.comboStars === 3);
  const learning = all.filter(p => p.comboStars > 0 && p.comboStars < 3);
  const answers = all.reduce((sum, p) => sum + p.timesEncountered, 0);
  const correct = all.reduce((sum, p) => sum + p.timesCorrect, 0);
  const unlocked = hydrated ? ACHIEVEMENTS.filter(a => progress.unlocked[a.id]) : [];
  const points = unlocked.reduce((sum, a) => sum + a.points, 0);
  const recent = [...all].sort((a, b) => b.lastEncounter - a.lastEncounter).slice(0, 4);
  const name = user?.displayName || user?.email?.split('@')[0] || 'Treinador';
  const logoutAccount = async () => {
    setLoggingOut(true); setError('');
    try { await logout(); } catch { setError('Não foi possível sair. Tente novamente.'); } finally { setLoggingOut(false); }
  };
  return <main id="main-content" className="club-page profile-page">
    <header className="page-intro"><div><span className="eyebrow"><ClubIcon name="user" size={16}/> SUA JORNADA</span><h1>Todo treino<br className="sm:hidden"/> deixa uma marca<span>.</span></h1><p>Seu espaço para acompanhar, celebrar e continuar evoluindo.</p></div><Link href="/achievements" className="club-button light"><ClubIcon name="trophy" size={18}/> Conquistas</Link></header>
    {isLoading ? <div className="profile-skeleton" role="status">Preparando seu perfil…</div> : !user ? <section className="profile-guest"><div className="profile-guest-icon"><ClubIcon name="user" size={44}/></div><span className="eyebrow">SEU LUGAR NO CLUBE</span><h2>Uma jornada com a sua cara.</h2><p>Entre com sua conta para salvar seu progresso, reunir estrelas e acompanhar suas conquistas em qualquer dispositivo.</p><Link href="/login" className="club-button blue">Entrar no PokéClub <ClubIcon name="arrow" size={18}/></Link></section> : <>
    {isSyncing && <p className="profile-sync" role="status"><span className="loading-dot"/> Sincronizando seu progresso com a nuvem…</p>}
    <div className="profile-layout"><aside className="trainer-card"><div className="trainer-card-top"><span>POKÉCLUB</span><span>TRAINER PASS</span></div><div className="trainer-avatar"><UserAvatar user={user} alt="Foto do treinador" size={110} className="h-full w-full rounded-full object-cover"/><span><ClubIcon name="spark" size={17}/></span></div><h2>{name}</h2><p>Membro do PokéClub</p><span className="trainer-level">TREINADOR · NÍVEL {Math.floor(points / 250) + 1}</span><div className="trainer-xp"><div><span>Próximo nível</span><b>{points % 250} / 250 XP</b></div><div className="club-progress"><span style={{ width: `${(points % 250) / 250 * 100}%` }}/></div></div><div className="trainer-email"><small>CONTA CONECTADA</small><span>{user.email}</span></div><div className="trainer-card-bottom"><span>Vamos mais longe.</span><span className="mini-ball"/></div></aside>
      <div className="profile-dashboard"><section className="profile-stats"><article><span className="profile-stat-icon yellow"><ClubIcon name="trophy"/></span><strong>{mastered.length}</strong><span>Pokémon dominados</span><small>Três estrelas de maestria</small></article><article><span className="profile-stat-icon red"><ClubIcon name="spark"/></span><strong>{learning.length}</strong><span>Em treinamento</span><small>Novas estrelas a caminho</small></article><article><span className="profile-stat-icon blue"><ClubIcon name="shield"/></span><strong>{answers ? Math.round(correct / answers * 100) : 0}<i>%</i></strong><span>Taxa de acerto</span><small>{answers} respostas registradas</small></article></section>
      <section className="profile-mastery"><div className="section-heading"><div><span className="eyebrow">UM PASSO DE CADA VEZ</span><h2>Sua Pokédex de maestria</h2></div><b>{mastered.length} <span>/ 1.025</span></b></div><div className="club-progress"><span style={{ width: `${mastered.length / 1025 * 100}%` }}/></div><p>{mastered.length ? 'Continue treinando para adicionar novas espécies à sua coleção.' : 'Sua primeira estrela começa com um desafio. Vamos nessa?'}</p><Link href="/play" className="club-button blue">Continuar treinando <ClubIcon name="arrow" size={18}/></Link></section>
      <section className="profile-gallery"><div className="section-heading"><div><span className="eyebrow">SUA COLEÇÃO</span><h2>Galeria de estrelas</h2></div><span>★★★</span></div>{mastered.length ? <div className="mastery-gallery">{mastered.map(p => <Link href="/pokedex" key={p.id} title={catalog.find(c => c.id === p.id)?.name || `Pokémon #${p.id}`}><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={`Pokémon dominado #${p.id}`} width={80} height={80} unoptimized/><b>#{String(p.id).padStart(3, '0')}</b><span>★★★</span></Link>)}</div> : <div className="gallery-empty"><ClubIcon name="trophy" size={34}/><p>Aqui vão brilhar os Pokémon que você dominar.</p><span>Acerte três vezes seguidas para conquistar a maestria.</span></div>}</section>
      <div className="profile-bottom-grid"><section className="profile-activity"><span className="eyebrow">ÚLTIMOS TREINOS</span><h2>Você passou por aqui</h2>{recent.length ? recent.map(p => <div className="profile-activity-item" key={p.id}><Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt="" width={42} height={42} unoptimized/><div><b>{catalog.find(c => c.id === p.id)?.name || `Pokémon #${p.id}`}</b><small>{new Date(p.lastEncounter).toLocaleDateString('pt-BR')}</small></div><span>{'★'.repeat(p.comboStars)}{'☆'.repeat(3 - p.comboStars)}</span></div>) : <p>Seus próximos treinos aparecerão aqui.</p>}</section><Link href="/achievements" className="profile-achievements"><ClubIcon name="trophy" size={30}/><strong>{unlocked.length}</strong><h3>Conquistas desbloqueadas</h3><p>Cada desafio tem sua recompensa.</p><span>Ver minha coleção <ClubIcon name="arrow" size={18}/></span></Link></div>
      </div></div><div className="profile-account-row"><span><ClubIcon name="shield" size={17}/> Seu progresso acompanha sua conta.</span><button disabled={loggingOut} onClick={() => void logoutAccount()}><ClubIcon name="logout" size={16}/>{loggingOut ? 'Saindo…' : 'Sair da conta'}</button></div>{error && <p role="alert">{error}</p>}
    </>}
  </main>;
}
