import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export async function openFile(): Promise<{ path: string; content: string } | null> {
  const result = await openDialog({
    multiple: false,
    filters: [
      {
        name: 'Text Files',
        extensions: ['txt', 'md', 'markdown', 'js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go', 'json', 'yaml', 'yml', 'toml', 'html', 'css', 'sh', 'c', 'cpp', 'h', 'java', 'rb', 'php', 'swift', 'kt', 'cs', 'lua', 'sql'],
      },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  if (!result || Array.isArray(result)) return null;
  const content = await readTextFile(result);
  return { path: result, content };
}

export async function saveFileAs(content: string): Promise<string | null> {
  const path = await saveDialog({
    filters: [{ name: 'All Files', extensions: ['*'] }],
  });
  if (!path) return null;
  await writeTextFile(path, content);
  return path;
}

export async function saveFile(path: string, content: string): Promise<void> {
  await writeTextFile(path, content);
}

export function fileNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}
