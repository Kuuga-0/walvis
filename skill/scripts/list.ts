/**
 * WALVIS list command — outputs message tool calls as JSON
 *
 * Usage:
 *   node --import tsx/esm list.ts [page] [spaceName]
 *
 * Output: JSON array of message tool call payloads.
 * The AI should call the `message` tool once per array element,
 * passing each element's fields directly as parameters.
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { Space, Manifest, BookmarkItem } from './types.js';

const WALVIS_DIR = join(homedir(), '.walvis');
const MANIFEST_PATH = join(WALVIS_DIR, 'manifest.json');
const PAGE_SIZE = 5;

function loadManifest(): Manifest {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

function loadSpace(spaceId: string): Space {
  return JSON.parse(readFileSync(join(WALVIS_DIR, 'spaces', `${spaceId}.json`), 'utf8'));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDomain(url?: string): string {
  if (!url) return '';
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function buildItemMessage(item: BookmarkItem) {
  const domain = getDomain(item.url);
  const date = formatDate(item.createdAt);
  const tags = item.tags.slice(0, 4).map(t => `#${t}`).join(' ');
  const summary = item.summary.length > 80 ? item.summary.slice(0, 80) + '…' : item.summary;
  const typeIcon = item.type === 'image' ? '🖼' : item.type === 'text' ? '📝' : '📌';

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
  const page = parseInt(args[0] ?? '1', 10) || 1;
  const spaceName = args[1] ?? null;

  if (!existsSync(MANIFEST_PATH)) {
    printError('WALVIS not initialized. Run: npx walvis');
  }

  let manifest: Manifest;
  try {
    manifest = loadManifest();
  } catch {
    printError('Failed to read ~/.walvis/manifest.json');
  }

  // Resolve space
  let spaceId = manifest.activeSpace;
  if (spaceName) {
    const entry = Object.entries(manifest.spaces).find(([, s]) => s.name === spaceName);
    if (!entry) {
      printError(`Space "${spaceName}" not found.`);
    }
    spaceId = entry[0];
  }

  const spacePath = join(WALVIS_DIR, 'spaces', `${spaceId}.json`);
  if (!existsSync(spacePath)) {
    printError(`Space "${spaceId}" not found.`);
  }

  let space: Space;
  try {
    space = loadSpace(spaceId);
  } catch {
    printError(`Failed to read space file for "${spaceId}".`);
  }

  const items = [...space.items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (items.length === 0) {
    printJson({ empty: true });
    process.exit(0);
  }

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const pageIndex = page - 1;
  const pageItems = items.slice(pageIndex * PAGE_SIZE, page * PAGE_SIZE);

  const messages = pageItems.map(buildItemMessage);

  // Pagination footer
  if (totalPages > 1) {
    const paginationButtons: { text: string; callback_data: string }[] = [];
    if (page > 1) paginationButtons.push({ text: '⬅️ Prev', callback_data: `w:page:${pageIndex - 1}` });
    if (page < totalPages) paginationButtons.push({ text: '➡️ Next', callback_data: `w:page:${pageIndex + 1}` });

    messages.push({
      action: 'send',
      channel: 'telegram',
      message: `📄 Page ${page}/${totalPages}`,
      buttons: [paginationButtons],
    });
  }

  printJson(messages);
}

main();
