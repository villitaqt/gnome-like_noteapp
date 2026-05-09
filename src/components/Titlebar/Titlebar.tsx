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
  onNewTab: () => void;
  onOpen: () => void;
}

export function Titlebar({ tabs, activeId, onActivate, onClose, onNewTab, onOpen }: Props) {
  return (
    <div className="titlebar" data-tauri-drag-region>
      <TabBar
        tabs={tabs}
        activeId={activeId}
        onActivate={onActivate}
        onClose={onClose}
        onNewTab={onNewTab}
        onOpen={onOpen}
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
