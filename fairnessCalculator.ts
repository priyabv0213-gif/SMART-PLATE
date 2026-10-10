import { Recipient } from '../types';

/**
 * Calculates Jain's Fairness Index across eligible recipients.
 * Score ranges from 1/N (most unfair) to 1.0 (completely fair proportion of demand satisfied).
 */
export function calculateJainsFairnessIndex(
  recipients: Recipient[],
  fulfilledDemandMap: Map<string, number>
): number {
  const activeRecipients = recipients.filter((r) => r.active && r.demandQuantity > 0);
  if (activeRecipients.length <= 1) return 1.0;

  const ratios: number[] = [];

  for (const r of activeRecipients) {
    const fulfilled = fulfilledDemandMap.get(r.id) || 0;
    const ratio = Math.min(1.0, fulfilled / r.demandQuantity);
    ratios.push(ratio);
  }

  const n = ratios.length;
  const sum = ratios.reduce((acc, val) => acc + val, 0);
  const sumSquares = ratios.reduce((acc, val) => acc + val * val, 0);

  if (sumSquares === 0) {
    // If no one received anything yet, equity is baseline 1.0
    return 1.0;
  }

  const index = (sum * sum) / (n * sumSquares);
  return Number(Math.min(1.0, Math.max(0, index)).toFixed(3));
}
