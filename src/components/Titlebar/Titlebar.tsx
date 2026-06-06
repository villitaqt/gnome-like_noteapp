import { getCurrentWindow } from '@tauri-apps/api/window';
import { Tab } from '../../types';
import { TabBar } from './TabBar';
import { WindowControls } from './WindowControls';

const appWindow = getCurrentWindow();

interface Props {
  tabs: Tab[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onNewTab: () => void;
  onOpen: () => void;
  onShowShortcuts: () => void;
}

export function Titlebar({ tabs, activeId, onActivate, onClose, onRename, onNewTab, onOpen, onShowShortcuts }: Props) {
  return (
    <div className="titlebar" data-tauri-drag-region>
      <TabBar
        tabs={tabs}
        activeId={activeId}
        onActivate={onActivate}
        onClose={onClose}
        onRename={onRename}
        onNewTab={onNewTab}
        onOpen={onOpen}
        onShowShortcuts={onShowShortcuts}
      />
      <div className="titlebar-spacer" data-tauri-drag-region />
      <WindowControls
        onMinimize={() => appWindow.minimize()}
        onMaximize={() => appWindow.toggleMaximize()}
        onClose={() => appWindow.close()}
      />
    </div>
  );
}
