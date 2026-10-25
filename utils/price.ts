export const round2 = (value: number): number => Math.round(value * 100) / 100;

export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) {
    throw new Error(`Unable to parse a number from "${text}"`);
  }
  return Number(match[0]);
}

export const formatAmount = (value: number): string => String(round2(value));

export const lineAmount = (price: number, quantity: number): number => round2(price * quantity);

export const sumAmounts = (amounts: number[]): number => round2(amounts.reduce((sum, amount) => sum + amount, 0));

export const discountedTotal = (total: number, discountPercent: number): number =>
  round2(total - (total * discountPercent) / 100);
