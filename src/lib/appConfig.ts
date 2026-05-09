import { appDataDir, documentDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';

export interface AppConfig {
  defaultExtension: 'md' | 'txt';
  notesFolderPath: string;
}

const CONFIG_FILE = 'config.json';
const NOTES_FOLDER_NAME = 'Text Editor';

async function getConfigPath(): Promise<string> {
  const dir = await appDataDir();
  const sep = dir.includes('\\') ? '\\' : '/';
  return `${dir}${sep}${CONFIG_FILE}`;
}

async function buildDefaultConfig(): Promise<AppConfig> {
  const docs = await documentDir();
  const sep = docs.includes('\\') ? '\\' : '/';
  return {
    defaultExtension: 'md',
    notesFolderPath: `${docs}${sep}${NOTES_FOLDER_NAME}`,
  };
}

export async function loadConfig(): Promise<{ config: AppConfig; isFirstRun: boolean }> {
  try {
    const path = await getConfigPath();
    const fileExists = await exists(path);
    if (!fileExists) {
      const config = await buildDefaultConfig();
      await saveConfig(config);
      return { config, isFirstRun: true };
    }
    const raw = await readTextFile(path);
    const config = JSON.parse(raw) as AppConfig;
    return { config, isFirstRun: false };
  } catch {
    const config = await buildDefaultConfig();
    return { config, isFirstRun: true };
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    const dir = await appDataDir();
    await mkdir(dir, { recursive: true });
    const path = await getConfigPath();
    await writeTextFile(path, JSON.stringify(config, null, 2));
  } catch {
    // Non-critical
  }
}

export async function ensureNotesFolder(folderPath: string): Promise<void> {
  try {
    const folderExists = await exists(folderPath);
    if (!folderExists) {
      await mkdir(folderPath, { recursive: true });
    }
  } catch {
    // Non-critical
  }
}

export async function nextAutoName(
  folderPath: string,
  ext: string,
): Promise<string> {
  const sep = folderPath.includes('\\') ? '\\' : '/';
  for (let i = 1; i <= 9999; i++) {
    const name = `note${i}.${ext}`;
    const full = `${folderPath}${sep}${name}`;
    try {
      const fileExists = await exists(full);
      if (!fileExists) return full;
    } catch {
      return full;
    }
  }
  return `${folderPath}${sep}note${Date.now()}.${ext}`;
}
