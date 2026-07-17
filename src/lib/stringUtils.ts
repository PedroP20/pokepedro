// src/lib/stringUtils.ts

/**
 * Calcula a Distância de Levenshtein (quantas edições são necessárias para transformar a em b).
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deleção
        matrix[i][j - 1] + 1,      // Inserção
        matrix[i - 1][j - 1] + cost // Substituição
      );
    }
  }
  return matrix[a.length][b.length];
}

export interface MatchResult {
  isExact: boolean;
  isPartial: boolean;
  isWrong: boolean;
}

/**
 * Avalia a resposta digitada pelo usuário comparando com o nome oficial.
 */
export function checkTypingMatch(typed: string, correct: string): MatchResult {
  // Limpa espaços, acentos, traços e deixa tudo em minúsculo
  const cleanTyped = typed.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const cleanCorrect = correct.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  if (!cleanTyped) {
    return { isExact: false, isPartial: false, isWrong: true };
  }

  // 1. Acerto Exato
  if (cleanTyped === cleanCorrect) {
    return { isExact: true, isPartial: false, isWrong: false };
  }

  // 2. Acerto Parcial (Fuzzy Matching)
  const distance = levenshtein(cleanTyped, cleanCorrect);
  const maxLen = Math.max(cleanTyped.length, cleanCorrect.length);
  const similarity = (maxLen - distance) / maxLen;

  // Aceita até 2 erros de digitação se a similaridade for maior que 70% e o nome tiver 3+ letras
  if (distance <= 2 && similarity >= 0.70 && cleanTyped.length >= 3) {
    return { isExact: false, isPartial: true, isWrong: false };
  }

  // 3. Erro Total (Ex: Digitar "Chikorita" no lugar de "Bayleef")
  return { isExact: false, isPartial: false, isWrong: true };
}