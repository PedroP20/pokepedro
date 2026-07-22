// src/components/AuthWrapper.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  
  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  return <>{children}</>;
}