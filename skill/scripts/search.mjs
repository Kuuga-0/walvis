/**
 * WALVIS search command — outputs message tool call payloads as JSON
 * Usage: node search.mjs <query> [page]
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const WALVIS_DIR = join(homedir(), '.walvis');
const PAGE_SIZE = 5;
const SPACES_DIR = join(WALVIS_DIR, 'spaces');

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
  const typeIcon = item.type === 'image' ? '🖼' : item.type === 'text' ? '📝' : '🔍';

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
if (!args[0]) {
  console.error('Usage: node search.mjs <query> [page]');
  process.exit(1);
}

const query = args[0];
const page = parseInt(args[1] ?? '1', 10) || 1;
const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

if (!existsSync(SPACES_DIR)) {
  printError('WALVIS not initialized. Run: npx walvis');
}

let spaceFiles;
try {
  spaceFiles = readdirSync(SPACES_DIR).filter(f => f.endsWith('.json'));
} catch {
  printError('Failed to read ~/.walvis/spaces');
}

let allItems = [];
for (const file of spaceFiles) {
  try {
    const space = JSON.parse(readFileSync(join(SPACES_DIR, file), 'utf8'));
    allItems.push(...space.items);
  } catch {
    printError(`Failed to read space file "${file}".`);
  }
}

const results = allItems
  .filter(item => {
    const hay = [item.title, item.summary, item.content, ...item.tags, item.notes]
      .join(' ').toLowerCase();
    return terms.every(t => hay.includes(t));
  })
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

if (results.length === 0) {
  printJson({ empty: true, query });
} else {
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const messages = pageItems.map(buildItemMessage);

  if (totalPages > 1) {
    const btns = [];
    if (page > 1) btns.push({ text: '⬅️ Prev', callback_data: `w:sp:${page - 2}:${query}` });
    if (page < totalPages) btns.push({ text: '➡️ Next', callback_data: `w:sp:${page}:${query}` });
    messages.push({
      action: 'send',
      channel: 'telegram',
      message: `🔍 "${query}" — ${results.length} result${results.length !== 1 ? 's' : ''}, page ${page}/${totalPages}`,
      buttons: [btns],
    });
  }

  printJson(messages);
}
