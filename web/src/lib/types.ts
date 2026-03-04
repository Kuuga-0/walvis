/**
 * Shared TypeScript types for web frontend
 * Mirror of skill/scripts/types.ts
 */

export type ItemType = 'link' | 'text' | 'image' | 'note';
export type ItemSource = 'telegram' | 'web' | 'manual';

export interface BookmarkItem {
  id: string;
  type: ItemType;
  url?: string;
  title: string;
  summary: string;
  tags: string[];
  content: string;
  createdAt: string;
  source: ItemSource;
  analyzedBy: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  items: BookmarkItem[];
  createdAt: string;
  updatedAt: string;
  walrusBlobId?: string;
  syncedAt?: string;
}

export interface Manifest {
  agent: string;
  spaces: Record<string, { blobId: string; syncedAt: string }>;
  suiAddress?: string;
  network: string;
  activeSpace: string;
  llmEndpoint: string;
  llmModel: string;
  walrusPublisher: string;
  walrusAggregator: string;
}
