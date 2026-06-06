import { useEffect, useState, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { useTabs } from './store/useTabs';
import { Titlebar } from './components/Titlebar/Titlebar';
import { EditorPane } from './components/Editor/EditorPane';
import { ShortcutsModal } from './components/ShortcutsModal';
import { openFile, saveFile, saveFileAs, fileNameFromPath } from './lib/fileOps';
import { loadSession, saveSession } from './lib/session';
import { loadConfig, ensureNotesFolder, nextAutoName, AppConfig } from './lib/appConfig';

export default function App() {
  const { tabs, activeId, activeTab, dispatch } = useTabs();
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  // Init config and session on mount
  useEffect(() => {
    async function init() {
      const { config: cfg, isFirstRun } = await loadConfig();
      setConfig(cfg);
      await ensureNotesFolder(cfg.notesFolderPath);
      if (isFirstRun) {
        showToast(`Notes folder: ${cfg.notesFolderPath}`);
      }

      const paths = await loadSession();
      if (paths.length === 0) {
        dispatch({ type: 'NEW_TAB' });
        return;
      }
      const restoredTabs = [];
      for (const filePath of paths) {
        try {
          const content = await readTextFile(filePath);
          restoredTabs.push({
            id: crypto.randomUUID(),
            title: fileNameFromPath(filePath),
            filePath,
            content,
            isDirty: false,
          });
        } catch {
          // File deleted, skip
        }
      }
      if (restoredTabs.length === 0) {
        dispatch({ type: 'NEW_TAB' });
      } else {
        dispatch({ type: 'RESTORE_SESSION', tabs: restoredTabs, activeId: restoredTabs[0].id });
      }
    }
    init();
  }, [dispatch]);

  // Listen for files opened from Windows Explorer
  useEffect(() => {
    const cleanup = listen<string[]>('open-files', async (event) => {
      for (const filePath of event.payload) {
        try {
          const content = await readTextFile(filePath);
          const title = fileNameFromPath(filePath);
          dispatch({ type: 'OPEN_FILE_TAB', filePath, content, title });
        } catch {
          // Unreadable, skip
        }
      }
    });
    return () => { cleanup.then((fn) => fn()); };
  }, [dispatch]);

  // Persist saved file paths in session
  useEffect(() => {
    const savedPaths = tabs
      .filter((t) => t.filePath !== null && !t.isDirty)
      .map((t) => t.filePath as string);
    saveSession(savedPaths);
  }, [tabs]);

  const handleSave = async () => {
    if (!activeTab || !config) return;
    if (activeTab.filePath) {
      await saveFile(activeTab.filePath, activeTab.content);
      dispatch({
        type: 'MARK_SAVED',
        id: activeTab.id,
        filePath: activeTab.filePath,
        title: fileNameFromPath(activeTab.filePath),
      });
    } else {
      // Auto-save to notes folder with generated name
      const filePath = await nextAutoName(config.notesFolderPath, config.defaultExtension);
      await saveFile(filePath, activeTab.content);
      dispatch({
        type: 'MARK_SAVED',
        id: activeTab.id,
        filePath,
        title: fileNameFromPath(filePath),
      });
    }
  };

  const handleSaveAs = async () => {
    if (!activeTab) return;
    const filePath = await saveFileAs(activeTab.content);
    if (filePath) {
      dispatch({
        type: 'MARK_SAVED',
        id: activeTab.id,
        filePath,
        title: fileNameFromPath(filePath),
      });
    }
  };

  const handleRename = (id: string, title: string) => {
    dispatch({ type: 'RENAME_TAB', id, title });
  };

  const handleOpen = async () => {
    const result = await openFile();
    if (result) {
      dispatch({
        type: 'OPEN_FILE_TAB',
        filePath: result.path,
        content: result.content,
        title: fileNameFromPath(result.path),
      });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if ((e.key === 's' || e.key === 'S') && e.shiftKey) {
        e.preventDefault();
        handleSaveAs();
      } else if (e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'NEW_TAB' });
      } else if (e.key === 't' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'NEW_TAB' });
      } else if (e.key === 'w' && !e.shiftKey) {
        e.preventDefault();
        if (activeTab) dispatch({ type: 'CLOSE_TAB', id: activeTab.id });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        dispatch({ type: 'NEXT_TAB' });
      } else if (e.key === 'o' && !e.shiftKey) {
        e.preventDefault();
        handleOpen();
      } else if (e.key === 'l' && !e.shiftKey) {
        e.preventDefault();
        setShowLineNumbers((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dispatch, config]);

  return (
    <div className="app">
      <Titlebar
        tabs={tabs}
        activeId={activeId}
        onActivate={(id) => dispatch({ type: 'ACTIVATE_TAB', id })}
        onClose={(id) => dispatch({ type: 'CLOSE_TAB', id })}
        onRename={handleRename}
        onNewTab={() => dispatch({ type: 'NEW_TAB' })}
        onOpen={handleOpen}
        onShowShortcuts={() => setShowShortcuts(true)}
      />
      {toast && <div className="toast">{toast}</div>}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {activeTab && (
        <EditorPane
          key={activeTab.id}
          tab={activeTab}
          onUpdate={(content) =>
            dispatch({ type: 'UPDATE_CONTENT', id: activeTab.id, content })
          }
          showLineNumbers={showLineNumbers}
        />
      )}
    </div>
  );
}
