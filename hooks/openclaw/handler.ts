/**
 * WALVIS OpenClaw Hook Handler
 * Intercepts incoming messages for auto-bookmark detection
 */

import type { OpenClawEvent, OpenClawMessage } from '@openclaw/types';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const WALVIS_MANIFEST = join(homedir(), '.walvis', 'manifest.json');
const URL_REGEX = /^https?:\/\/[^\s]+$/;

interface WalvisManifest {
  agent: string;
  autoSave?: boolean;
  activeSpace: string;
}

function readManifestSafe(): WalvisManifest | null {
  try {
    if (!existsSync(WALVIS_MANIFEST)) return null;
    return JSON.parse(readFileSync(WALVIS_MANIFEST, 'utf-8'));
  } catch {
    return null;
  }
}

export async function handler(event: OpenClawEvent): Promise<void> {
  if (event.type !== 'message:received') return;

  const manifest = readManifestSafe();
  if (!manifest?.autoSave) return;

  const lastMessage = event.messages?.[event.messages.length - 1];
  if (!lastMessage?.content) return;

  const text = lastMessage.content.trim();

  // Only intercept bare URLs (no other text around them)
  if (!URL_REGEX.test(text)) return;

  // Rewrite as a walvis save command
  event.messages[event.messages.length - 1] = {
    ...lastMessage,
    content: `@${manifest.agent} ${text}`,
  };
}
