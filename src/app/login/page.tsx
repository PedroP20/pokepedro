// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, isLoading } = useAuthStore();

  // Se já estiver logado, joga para a página inicial automaticamente!
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // O useEffect acima vai detectar o login e fazer o redirecionamento
    } catch (error) {
      console.error("Erro no login:", error);
      alert("⚠️ Erro ao conectar com o Google. Feche o aviso e tente novamente.");
      setIsLoggingIn(false);
    }
  };

  // Tela de carregamento enquanto o Firebase decide se o usuário está logado
  if (isLoading || user) {
    return (
      <div className="h-screen bg-[#F5F5F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1B4F9C] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-button font-black text-[#1B4F9C] animate-pulse uppercase tracking-widest">Carregando Cofre...</p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F5F5F5] font-body h-screen relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2A75BB] rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#EE1515] rounded-full blur-3xl opacity-10" />

      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border-4 border-[#1B4F9C] w-full max-w-md text-center relative z-10 font-card">
        
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#FFCB05] rounded-full flex items-center justify-center border-4 border-white shadow-md rotate-12">
          <span className="text-3xl">⭐</span>
        </div>

        <div className="space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto border-4 border-[#2A75BB] flex items-center justify-center text-5xl shadow-inner mb-2">
            📱
          </div>
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#1B4F9C] leading-tight">
              Acesso de<br/><span className="text-[#EE1515] drop-shadow-sm">Treinador</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mt-3 uppercase tracking-wider">Faça login para salvar suas 3 Estrelas na nuvem!</p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-gray-800 font-button font-black py-4 sm:py-5 px-6 rounded-2xl shadow-lg border-2 border-gray-200 transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <span className="animate-pulse">Conectando...</span>
              ) : (
                <>
                  <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" width={28} height={28} />
                  <span className="text-sm sm:text-base">Entrar com o Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}