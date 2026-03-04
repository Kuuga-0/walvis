/**
 * Walrus storage client for the web frontend
 * Fetches manifests and space data from Walrus aggregator
 */

import type { BookmarkItem, Space, Manifest } from './types';

// Testnet aggregator
const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export async function fetchBlob<T>(blobId: string): Promise<T> {
  const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`);
  if (!res.ok) throw new Error(`Walrus fetch failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchManifest(blobId: string): Promise<Manifest> {
  return fetchBlob<Manifest>(blobId);
}

export async function fetchSpace(blobId: string): Promise<Space> {
  return fetchBlob<Space>(blobId);
}

export async function fetchAllSpaces(manifest: Manifest): Promise<Space[]> {
  const entries = Object.entries(manifest.spaces);
  const results = await Promise.allSettled(
    entries.map(([, { blobId }]) => fetchSpace(blobId))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<Space> => r.status === 'fulfilled')
    .map(r => r.value);
}

export function searchItems(spaces: Space[], query: string): Array<{ item: BookmarkItem; space: Space }> {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: Array<{ item: BookmarkItem; space: Space; score: number }> = [];

  for (const space of spaces) {
    for (const item of space.items) {
      let score = 0;
      if (item.title.toLowerCase().includes(q)) score += 10;
      if (item.tags.some(t => t.toLowerCase().includes(q))) score += 8;
      if (item.summary.toLowerCase().includes(q)) score += 5;
      if (item.content.toLowerCase().includes(q)) score += 2;
      if (score > 0) results.push({ item, space, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ item, space }) => ({ item, space }));
}

export function getAllTags(spaces: Space[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const space of spaces) {
    for (const item of space.items) {
      for (const tag of item.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
