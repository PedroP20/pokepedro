"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import ClubIcon, { type ClubIconName } from '@/components/ui/ClubIcon';
import { useAuthStore } from '@/store/useAuthStore';

const destinations: { href: string; label: string; icon: ClubIconName; description: string }[] = [
  { href: '/', label: 'Início', icon: 'home', description: 'Seu ponto de partida' },
  { href: '/pokedex', label: 'Pokédex', icon: 'dex', description: 'Descubra cada Pokémon' },
  { href: '/academy', label: 'Combate', icon: 'battle', description: 'Prepare sua estratégia' },
  { href: '/events', label: 'Eventos', icon: 'events', description: 'Acompanhe a próxima aventura' },
  { href: '/wild-area', label: 'Área Selvagem', icon: 'wild', description: 'Checklist do evento Aço & Dragão' },
  { href: '/play', label: 'Jogar', icon: 'play', description: 'Coloque seu conhecimento à prova' },
];
export default function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isMenuOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [isMenuOpen]);
  useEffect(() => {
    if (!isMenuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [isMenuOpen]);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1100) setIsMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setIsMenuOpen(false);
  if (pathname === '/game') return null;
  return <>
    <a href="#main-content" className="skip-link">Pular para o conteúdo</a>
    <header className="club-header">
      <div className="club-header-inner">
        <Link href="/" className="club-brand" aria-label="PokéClub, início"><span className="brand-ball" aria-hidden="true"><span/></span><span>Poké<b>Club</b><small>SEU UNIVERSO POKÉMON</small></span><span className="brand-version">2.0</span></Link>
        <nav className="club-desktop-nav" aria-label="Navegação principal">{destinations.map(item => <Link href={item.href} key={item.href} aria-current={active(item.href) ? 'page' : undefined} className={`club-nav-link ${active(item.href) ? 'is-active' : ''}`}><ClubIcon name={item.icon} size={18}/>{item.label}</Link>)}</nav>
        <div className="club-header-actions"><Link href="/achievements" className="club-icon-button" aria-label="Conquistas"><ClubIcon name="trophy" size={20}/></Link><Link href={user ? '/profile' : '/login'} className="club-account" aria-label={user ? 'Meu perfil' : 'Entrar'}>{user ? <UserAvatar user={user} alt="" size={34} className="club-avatar"/> : <ClubIcon name="user" size={18}/>}<span>{user ? 'Meu perfil' : 'Entrar'}</span></Link><button ref={toggle} className={`club-menu-toggle ${isMenuOpen ? 'is-open' : ''}`} onClick={() => setIsMenuOpen(v => !v)} aria-label="Abrir menu" aria-expanded={isMenuOpen} aria-controls="club-mobile-menu"><span/><span/><span/></button></div>
      </div>
    </header>
    <dialog ref={dialog} id="club-mobile-menu" className="club-drawer" aria-label="Menu principal do PokéClub" onCancel={close} onClose={() => { close(); toggle.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="club-drawer-inner"><div className="club-drawer-heading"><span className="eyebrow">EXPLORE O CLUBE</span><button autoFocus onClick={close} className="club-icon-button" aria-label="Fechar menu">✕</button></div><h2>Qual é a próxima<br/><em>aventura?</em></h2><nav aria-label="Navegação móvel">{destinations.map((item, i) => <Link href={item.href} key={item.href} onClick={close} className={`club-drawer-link ${active(item.href) ? 'is-active' : ''}`} aria-current={active(item.href) ? 'page' : undefined} style={{ animationDelay: `${i * 40}ms` }}><span className="club-drawer-icon"><ClubIcon name={item.icon}/></span><span><b>{item.label}</b><small>{item.description}</small></span><ClubIcon name="arrow" size={18}/></Link>)}</nav><div className="club-drawer-bottom"><Link href="/profile" onClick={close}><ClubIcon name="user" size={18}/> Meu perfil</Link><Link href="/achievements" onClick={close}><ClubIcon name="trophy" size={18}/> Conquistas</Link></div><p>Um clube. Infinitas descobertas.</p></div>
    </dialog>
  </>;
}
