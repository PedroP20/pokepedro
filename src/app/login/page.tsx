"use client";
import { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth, firebaseConfigurationError, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { googleLoginError } from '@/lib/authErrors';
import ClubIcon from '@/components/ui/ClubIcon';
export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (user && !isLoading) router.replace('/'); }, [user, isLoading, router]);
  const login = async () => {
    if (!auth || !googleProvider) { setError(firebaseConfigurationError || 'Login indisponível neste ambiente.'); return; }
    setLoggingIn(true); setError('');
    try { await signInWithPopup(auth, googleProvider); } catch (e) { setError(googleLoginError(e)); } finally { setLoggingIn(false); }
  };
  return <main id="main-content" className="club-page login-page"><section className="login-shell"><div className="login-welcome"><span className="eyebrow">SEU UNIVERSO POKÉMON</span><h1>Sua jornada.<br/>Seu clube.<br/><span>Seu próximo nível.</span></h1><p>O conhecimento evolui. As conquistas ficam.<br/>Comece sua história no PokéClub.</p><Image src="/images/pikachu.png" alt="Pikachu" width={310} height={310} className="login-pikachu" priority/></div><div className="login-form"><span className="login-icon"><ClubIcon name="user" size={30}/></span><span className="eyebrow">BEM-VINDO, TREINADOR</span><h2>Vamos nessa?</h2><p>Entre para guardar suas estrelas, acompanhar seu progresso e continuar sua jornada de onde parou.</p><button className="google-login" onClick={() => void login()} disabled={loggingIn || isLoading || Boolean(user) || !auth}><span className="google-letter" aria-hidden="true">G</span>{loggingIn ? 'Conectando ao Google…' : isLoading || user ? 'Preparando sua conta…' : 'Continuar com Google'}<ClubIcon name="arrow" size={18}/></button>{(error || firebaseConfigurationError) && <p className="login-error" role="alert">{error || firebaseConfigurationError}</p>}<div className="login-benefits"><span><ClubIcon name="shield" size={18}/> Progresso salvo na sua conta</span><span><ClubIcon name="trophy" size={18}/> Conquistas para celebrar</span><span><ClubIcon name="spark" size={18}/> Uma jornada no seu ritmo</span></div><Link href="/" className="login-back">← Explorar o clube</Link></div></section></main>;
}
