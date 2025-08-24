import { Item, PlayedItem } from "../types/item";
import { createWikimediaImage } from "./image";

function getURLParameter(paramName: string): string {
  const params = new URLSearchParams(window.location.search);
  if (params.get(paramName)) { return params.get(paramName); }
  return "2"
}


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

//    const logBase = 10;
  const urlParam = parseFloat(getURLParameter('logBase'));
  const logBase = isNaN(urlParam) || urlParam <= 1 ? 2 : urlParam;
  console.log('log base is', logBase)

    const itemsWithLogWeights = availableItems.map(item => ({
      item,
      logWeight: Math.log(item.page_views + 1) / Math.log(logBase)
    }));

    // Calculate total weight (sum of all log-transformed weights)
    const totalWeight = itemsWithLogWeights.reduce((sum, { logWeight }) => sum + logWeight, 0);

    // Generate random number between 0 and totalWeight
    const randomWeight = Math.random() * totalWeight;

    // Find the item that corresponds to this weight
    let currentWeight = 0;
    for (const { item, logWeight } of itemsWithLogWeights) {
      currentWeight += logWeight;
      if (randomWeight <= currentWeight) {
      console.log('found item', item, item.page_views, logWeight);
        return item;
      }
    }

console.log('fallback')

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
