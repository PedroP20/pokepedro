"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function ClubFooter() {
  const path = usePathname();
  if (path === '/game' || path === '/login') return null;
  return <footer className="club-footer"><Link href="/" className="footer-brand">Poké<b>Club</b><span>2.0</span></Link><p>Feito para quem nunca deixa de ser treinador.</p><span>Projeto de fãs · Pokémon pertence aos seus criadores.</span></footer>;
}
