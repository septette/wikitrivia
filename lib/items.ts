import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

// export function getRandomItem(deck: Item[], played: Item[]): Item {
//   const periods: [number, number][] = [
//     [-100000, 1000],
//     [1000, 1800],
//     [1800, 2020],
//   ];
//   const [fromYear, toYear] =
//     periods[Math.floor(Math.random() * periods.length)];
//   const avoidPeople = Math.random() > 0.5;
//   const candidates = deck.filter((candidate) => {
//     if (avoidPeople && candidate.instance_of.includes("human")) {
//       return false;
//     }
//     if (candidate.year < fromYear || candidate.year > toYear) {
//       return false;
//     }
//     if (tooClose(candidate, played)) {
//       return false;
//     }
//     return true;
//   });
//
//   if (candidates.length > 0) {
//     return candidates[Math.floor(Math.random() * candidates.length)];
//   }
//   return deck[Math.floor(Math.random() * deck.length)];
// }

export function getRandomItem(deck: Item[], played: Item[]): Item {
  // Create a set of played item IDs for efficient lookup
  const playedIds = new Set(played.map(item => item.id));

  const avoidPeople = Math.random() > 0.5;

  // Filter out played items and municipalities
  const availableItems = deck.filter(item => {
    // Skip if already played
    if (playedIds.has(item.id)) {
      return false;
    }

    // Skip if instance_of contains anything related to municipality
    const hasMunicipality = item.instance_of.some(instanceType =>
      instanceType.toLowerCase().includes('municipality')
    );

    if (hasMunicipality) {
        return false;
    }

    if (avoidPeople && item.instance_of.includes("human")) {
            return false;
    }

      if (tooClose(item, played)) {
        return false;
      }

      return true;
 });

  // filtered out all, random case
  if (availableItems.length == 0) {
     return deck[Math.floor(Math.random() * deck.length)];
  }

  // Calculate total weight (sum of all page_views)
  const totalWeight = availableItems.reduce((sum, item) => sum + item.page_views, 0);

  // Generate random number between 0 and totalWeight
  const randomWeight = Math.random() * totalWeight;

  // Find the item that corresponds to this weight
  let currentWeight = 0;
  for (const item of availableItems) {
    currentWeight += item.page_views;
    if (randomWeight <= currentWeight) {
      return item;
    }
  }

  // Fallback (should never reach here, but TypeScript requires it)
  return availableItems[availableItems.length - 1];
}

function tooClose(item: Item, played: Item[]) {
  let distance = (played.length < 40) ? 5 : 1;
  if (played.length < 11)
    distance = 110 - 10 * played.length;

  return played.some((p) => Math.abs(item.year - p.year) < distance);
}

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.year - b.year);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

export function preloadImage(url: string): HTMLImageElement {
  const img = new Image();
  img.src = createWikimediaImage(url);
  return img;
}
