/**
 * WALVIS list command — outputs message tool call payloads as JSON
 * Usage: node list.mjs [page] [spaceName]
 */

import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const WALVIS_DIR = join(homedir(), '.walvis');
const PAGE_SIZE = 5;
const MANIFEST_PATH = join(WALVIS_DIR, 'manifest.json');

function printJson(payload) {
  console.log(JSON.stringify(payload));
}

function printError(message) {
  printJson({ error: message });
  process.exit(0);
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDomain(url) {
  if (!url) return '';
  try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
}

function buildItemMessage(item) {
  const domain = getDomain(item.url);
  const date = formatDate(item.createdAt);
  const tags = item.tags.slice(0, 4).map(t => `#${t}`).join(' ');
  const summary = item.summary.length > 80 ? item.summary.slice(0, 80) + '…' : item.summary;
  const typeIcon = item.type === 'image' ? '🖼' : item.type === 'text' ? '📝' : '📌';

  const parts = [`${typeIcon} ${item.title}`, summary];
  if (tags) parts.push(tags);
  const meta = [domain && `🔗 ${domain}`, `📅 ${date}`].filter(Boolean).join(' · ');
  if (meta) parts.push(meta);

  return {
    action: 'send',
    channel: 'telegram',
    message: parts.join('\n'),
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

const args = process.argv.slice(2);
const page = parseInt(args[0] ?? '1', 10) || 1;
const spaceName = args[1] ?? null;

if (!existsSync(MANIFEST_PATH)) {
  printError('WALVIS not initialized. Run: npx walvis');
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch {
  printError('Failed to read ~/.walvis/manifest.json');
}

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

let space;
try {
  space = JSON.parse(readFileSync(spacePath, 'utf8'));
} catch {
  printError(`Failed to read space file for "${spaceId}".`);
}

const items = [...space.items].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

if (items.length === 0) {
  printJson({ empty: true });
} else {
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const messages = pageItems.map(buildItemMessage);

  if (totalPages > 1) {
    const btns = [];
    if (page > 1) btns.push({ text: '⬅️ Prev', callback_data: `w:page:${page - 2}` });
    if (page < totalPages) btns.push({ text: '➡️ Next', callback_data: `w:page:${page}` });
    messages.push({
      action: 'send',
      channel: 'telegram',
      message: `📄 Page ${page}/${totalPages}`,
      buttons: [btns],
    });
  }

  printJson(messages);
}
