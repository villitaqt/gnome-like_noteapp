import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';

async function getSessionPath(): Promise<string> {
  const dir = await appDataDir();
  return dir.endsWith('\\') || dir.endsWith('/')
    ? `${dir}session.json`
    : `${dir}${dir.includes('\\') ? '\\' : '/'}session.json`;
}

export async function loadSession(): Promise<string[]> {
  try {
    const path = await getSessionPath();
    const fileExists = await exists(path);
    if (!fileExists) return [];
    const raw = await readTextFile(path);
    const data = JSON.parse(raw) as { openFilePaths?: unknown };
    return Array.isArray(data.openFilePaths) ? (data.openFilePaths as string[]) : [];
  } catch {
    return [];
  }
}

export async function saveSession(openFilePaths: string[]): Promise<void> {
  try {
    const dir = await appDataDir();
    await mkdir(dir, { recursive: true });
    const path = await getSessionPath();
    await writeTextFile(path, JSON.stringify({ openFilePaths }, null, 2));
  } catch {
    // Non-critical
  }
}
