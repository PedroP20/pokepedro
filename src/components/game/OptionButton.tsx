"use client";

import { motion } from "framer-motion";

interface OptionButtonProps {
  name: string;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function OptionButton({
  name,
  isSelected,
  isCorrect,
  isRevealed,
  onClick,
  disabled,
}: OptionButtonProps) {
  let buttonStyle =
    "bg-[#FFFFFF] hover:bg-[#F5F5F5] text-[#1E1E1E] border-[#D9D9D9] shadow-sm";

  if (isRevealed) {
    if (isCorrect) {
      buttonStyle =
        "bg-[#2A75BB] text-[#FFFFFF] border-[#1B4F9C] shadow-md shadow-[#2A75BB]/30 font-black scale-102";
    } else if (isSelected && !isCorrect) {
      buttonStyle =
        "bg-[#EE1515] text-[#FFFFFF] border-[#cc1010] shadow-md shadow-[#EE1515]/30 font-bold opacity-95";
    } else {
      buttonStyle = "bg-[#F5F5F5] text-[#1E1E1E]/40 border-[#D9D9D9] opacity-50";
    }
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 px-6 rounded-xl border font-extrabold text-lg tracking-wide transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
    >
      <span>{name}</span>
      {isRevealed && isCorrect && <span className="text-xl">✓</span>}
      {isRevealed && isSelected && !isCorrect && <span className="text-xl">✗</span>}
    </motion.button>
  );
}