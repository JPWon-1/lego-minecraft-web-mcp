export interface BonusInput {
  turnCount: number;
  batchToolUses: number;
}

export function efficiencyBonus(input: BonusInput): number {
  const { turnCount, batchToolUses } = input;
  let base: number;
  if (turnCount < 5) base = 15;
  else if (turnCount <= 10) base = 10;
  else if (turnCount <= 20) base = 5;
  else base = 0;
  const batchBonus = Math.min(batchToolUses, 5);
  return base + batchBonus;
}
