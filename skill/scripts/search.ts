/**
 * WALVIS search command — outputs message tool call payloads as JSON
 *
 * Usage:
 *   node --import tsx/esm search.ts <query> [page]
 *
 * Output: JSON array of message tool call payloads.
 * The AI should call the `message` tool once per array element.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Space, BookmarkItem } from './types.js';

const WALVIS_DIR = join(homedir(), '.walvis');
const SPACES_DIR = join(WALVIS_DIR, 'spaces');
const PAGE_SIZE = 5;

function loadAllItems(): BookmarkItem[] {
  const files = readdirSync(SPACES_DIR).filter(f => f.endsWith('.json'));
  const items: BookmarkItem[] = [];
  for (const file of files) {
    const space: Space = JSON.parse(readFileSync(join(SPACES_DIR, file), 'utf8'));
    items.push(...space.items);
  }
  return items;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDomain(url?: string): string {
  if (!url) return '';
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function matchesQuery(item: BookmarkItem, terms: string[]): boolean {
  const haystack = [item.title, item.summary, item.content, ...item.tags, item.notes]
    .join(' ').toLowerCase();
  return terms.every(t => haystack.includes(t));
}

function buildItemMessage(item: BookmarkItem) {
  const domain = getDomain(item.url);
  const date = formatDate(item.createdAt);
  const tags = item.tags.slice(0, 4).map(t => `#${t}`).join(' ');
  const summary = item.summary.length > 80 ? item.summary.slice(0, 80) + '…' : item.summary;
  const typeIcon = item.type === 'image' ? '🖼' : item.type === 'text' ? '📝' : '🔍';

  const lines = [
    `${typeIcon} ${item.title}`,
    summary,
    tags,
    [domain && `🔗 ${domain}`, `📅 ${date}`].filter(Boolean).join(' · '),
  ].filter(Boolean).join('\n');

  return {
    action: 'send',
    channel: 'telegram',
    message: lines,
    buttons: [
      [
        { text: '🔄 Refetch', callback_data: `w:refetch:${item.id}` },
        { text: '🏷 Tags',    callback_data: `w:tags:${item.id}` },
        { text: '📝 Note',    callback_data: `w:note:${item.id}` },
      ],
      [
        { text: '📸 SS',      callback_data: `w:ss:${item.id}` },
        { text: '🗑 Del',     callback_data: `w:del:${item.id}` },
      ],
    ],
  };
}

function printJson(payload: unknown): void {
  console.log(JSON.stringify(payload));
}

function printError(message: string): never {
  printJson({ error: message });
  process.exit(0);
}

function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    printJson({ error: 'Usage: search.ts <query> [page]' });
    process.exit(1);
  }

  const query = args[0];
  const page = parseInt(args[1] ?? '1', 10) || 1;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  if (!existsSync(SPACES_DIR)) {
    printError('WALVIS not initialized. Run: npx walvis');
  }

  let allItems: BookmarkItem[];
  try {
    allItems = loadAllItems();
  } catch {
    printError('Failed to read ~/.walvis/spaces');
  }

  const results = allItems
  .filter(item => matchesQuery(item, terms))
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (results.length === 0) {
    printJson({ empty: true, query });
    process.exit(0);
  }

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const messages = pageItems.map(buildItemMessage);

  // Pagination footer
  if (totalPages > 1) {
    const paginationButtons: { text: string; callback_data: string }[] = [];
    if (page > 1) paginationButtons.push({ text: '⬅️ Prev', callback_data: `w:sp:${page - 2}:${query}` });
    if (page < totalPages) paginationButtons.push({ text: '➡️ Next', callback_data: `w:sp:${page}:${query}` });

    messages.push({
      action: 'send',
      channel: 'telegram',
      message: `🔍 "${query}" — ${results.length} result${results.length > 1 ? 's' : ''}, page ${page}/${totalPages}`,
      buttons: [paginationButtons],
    });
  }

  printJson(messages);
}

main();
