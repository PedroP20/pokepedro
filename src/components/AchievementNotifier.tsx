"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, TIER_LABELS } from "@/lib/achievements";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function AchievementNotifier() {
  const progress = useAchievementStore((state) => state.progress);
  const queuedId = useAchievementStore((state) => state.notificationQueue[0]);
  const dismiss = useAchievementStore((state) => state.dismissNotification);
  const user = useAuthStore((state) => state.user);
  const isSynced = useAchievementStore((state) => state.isSynced);
  const achievement = ACHIEVEMENTS.find((item) => item.id === queuedId);

  useEffect(() => {
    if (!queuedId) return;
    const timer = window.setTimeout(dismiss, 4600);
    return () => window.clearTimeout(timer);
  }, [queuedId, dismiss]);

  useEffect(() => {
    if (user && db && isSynced) void setDoc(doc(db, "users", user.uid, "achievements", "progress"), progress);
  }, [progress, user, isSynced]);

  return <AnimatePresence>{achievement && <motion.aside initial={{ opacity: 0, x: 40, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: 40 }} className="fixed right-3 top-3 z-[100] w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-2xl border border-[#FFCB05]/70 bg-[#1B4F9C] p-1 shadow-2xl">
    <div className="flex gap-3 rounded-[13px] bg-gradient-to-br from-[#2A75BB] to-[#1B4F9C] p-4 text-white"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFCB05] text-2xl shadow-lg">{achievement.icon}</span><div className="min-w-0"><p className="text-[10px] font-black tracking-[0.16em] text-[#FFCB05]">CONQUISTA DESBLOQUEADA</p><h2 className="truncate text-lg font-black font-heading">{achievement.name}</h2><p className="text-xs text-white/80">{achievement.description}</p><span className="mt-2 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">{TIER_LABELS[achievement.tier]} · +{achievement.points} pts</span></div></div>
  </motion.aside>}</AnimatePresence>;
}
