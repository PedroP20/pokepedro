"use client";
import GameGlyph from "./GameGlyph";

interface OptionButtonProps {
  name: string;
  index?: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onClick: () => void;
  disabled: boolean;
}
export default function OptionButton({ name, index = 0, isSelected, isCorrect, isRevealed, onClick, disabled }: OptionButtonProps) {
  const state = isRevealed && isCorrect ? "is-correct" : isRevealed && isSelected ? "is-wrong" : "";
  return <button type="button" className={`arena-option ${state} ${isSelected ? "is-selected" : ""}`} disabled={disabled} onClick={onClick}><span className="arena-option-letter" aria-hidden="true">{isRevealed && isCorrect ? <GameGlyph name="check" /> : String.fromCharCode(65 + index)}</span><span>{name}</span><span className="arena-option-arrow" aria-hidden="true">{isRevealed && isSelected && !isCorrect ? "×" : <GameGlyph name="arrow" />}</span></button>;
}
