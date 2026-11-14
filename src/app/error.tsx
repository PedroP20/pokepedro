"use client";
import Link from 'next/link';
import ClubIcon from '@/components/ui/ClubIcon';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main id="main-content" className="club-page"><section className="club-empty" role="alert"><ClubIcon name="dex" size={44}/><h1>Vamos tentar de novo?</h1><p>Não foi possível abrir esta parte do clube. Recarregue a aba para continuar.</p><button onClick={reset} className="club-button blue">Tentar novamente</button><Link href="/" className="club-button light">Voltar ao início</Link></section></main>;
}
