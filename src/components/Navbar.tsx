"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import UserAvatar from "@/components/UserAvatar";
import { useAuthStore } from "@/store/useAuthStore";

const destinations = [
  { href: "/events", label: "Eventos", icon: "✦", index: "01" },
  { href: "/pokedex", label: "Pokédex", icon: "◉", index: "02" },
  { href: "/academy", label: "Combate", icon: "⚔", index: "03" },
  { href: "/play", label: "Jogar", icon: "▶", index: "04" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  if (pathname === "/game" || pathname === "/login" || !user) return null;

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`) || (href === "/play" && pathname === "/review");
  const closeMenu = () => setIsMenuOpen(false);
  const handleLogout = async () => {
    closeMenu();
    await logout();
    router.push("/login");
  };

  return (
    <header className="site-header sticky top-0 z-50 w-full">
      <div className="site-header-inner mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
        <Link href="/events" onClick={closeMenu} className="site-brand group shrink-0" aria-label="PokéPedro, ir para eventos">
          <span className="brand-ball" aria-hidden="true"><span /></span>
          <span className="font-heading text-xl font-black tracking-tight sm:text-2xl">Poké<span>Pedro</span><small>CLUB</small></span>
        </Link>

        <nav className="site-nav hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {destinations.map((item) => (
            <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className={`site-nav-link ${active(item.href) ? "is-active" : ""}`}>
              <span className="site-nav-index">{item.index}</span><span className="site-nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/achievements" className="site-utility-link" aria-label="Conquistas" title="Conquistas">★</Link>
          <Link href="/profile" className="site-profile" aria-label="Abrir perfil">
            <UserAvatar user={user} alt="Perfil" size={34} className="h-9 w-9 rounded-full object-cover" />
            <span className="max-w-24 truncate text-sm font-bold">{user.displayName?.split(" ")[0] || user.email?.split("@")[0]}</span>
          </Link>
          <button onClick={handleLogout} className="site-logout" aria-label="Sair da conta" title="Sair da conta">↗</button>
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="site-menu-button lg:hidden" aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={isMenuOpen}>
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="site-mobile-menu lg:hidden" aria-label="Navegação móvel">
            <div className="mx-auto grid max-w-7xl gap-2 px-4 pb-5 pt-2 sm:px-6">
              {destinations.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={active(item.href) ? "page" : undefined} className={`site-mobile-link ${active(item.href) ? "is-active" : ""}`}>
                  <span>{item.index}</span><b aria-hidden="true">{item.icon}</b>{item.label}<i aria-hidden="true">↗</i>
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-white/15 pt-4">
                <Link href="/profile" onClick={closeMenu} className="site-profile"><UserAvatar user={user} alt="Perfil" size={34} className="h-9 w-9 rounded-full object-cover" /><span className="text-sm font-bold">Meu perfil</span></Link>
                <Link href="/achievements" onClick={closeMenu} className="site-utility-link" aria-label="Conquistas">★</Link>
                <button onClick={handleLogout} className="site-logout px-4" aria-label="Sair da conta">Sair ↗</button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
