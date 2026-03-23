import { calculateDistance } from "./utils";

export interface Recommandable {
  id: string;
  type: string;
  category?: string; // e.g., 'villa', 'sedan', 'cinema'
  location: string;
  price: number;
  lat: number;
  lng: number;
}

/**
 * Calculates a similarity score (0 to 1) between two items.
 * 1 is identical, 0 is completely different.
 */
export function calculateSimilarity(a: Recommandable, b: Recommandable): number {
  if (a.id === b.id) return 0; // Don't recommend self

  let score = 0;

  // 1. Category/Type Match (Weight: 0.5)
  if (a.type === b.type) {
    score += 0.25;
    if (a.category && b.category && a.category === b.category) {
      score += 0.25;
    }
  }

  // 2. Proximity Match (Weight: 0.3)
  const dist = calculateDistance(a.lat, a.lng, b.lat, b.lng);
  if (dist < 5) score += 0.3; // Very close
  else if (dist < 15) score += 0.2; // Nearby
  else if (dist < 50) score += 0.1; // Same region

  // 3. Price Similarity (Weight: 0.2)
  const priceDiff = Math.abs(a.price - b.price);
  const avgPrice = (a.price + b.price) / 2;
  if (avgPrice > 0) {
    const relativeDiff = priceDiff / avgPrice;
    if (relativeDiff < 0.1) score += 0.2;
    else if (relativeDiff < 0.3) score += 0.1;
  }

  return score;
}

export function getRecommendations<T extends Recommandable>(
  target: T,
  pool: T[],
  limit = 4
): T[] {
  return pool
    .map(item => ({ item, score: calculateSimilarity(target, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.item);
}
