import { Tab as TabType } from '../../types';
import { Tab } from './Tab';
import { FileMenu } from './FileMenu';

interface Props {
  tabs: TabType[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onNewTab: () => void;
  onOpen: () => void;
  onShowShortcuts: () => void;
}

export function TabBar({ tabs, activeId, onActivate, onClose, onRename, onNewTab, onOpen, onShowShortcuts }: Props) {
  return (
    <div className="tab-bar-wrapper">
      <div className="titlebar-left-actions">
        <FileMenu onOpen={onOpen} onShowShortcuts={onShowShortcuts} />
        <button
          className="titlebar-action-btn"
          onClick={onNewTab}
          title="New tab (Ctrl+T)"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="titlebar-left-divider" />
      </div>
      <div
        className="tab-bar"
        data-tauri-drag-region
        onWheel={(e) => {
          if (e.deltaY !== 0) e.currentTarget.scrollLeft += e.deltaY;
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            onActivate={() => onActivate(tab.id)}
            onClose={() => onClose(tab.id)}
            onRename={(title) => onRename(tab.id, title)}
          />
        ))}
      </div>
      <div className="titlebar-left-divider" />
      <button
        className="titlebar-action-btn"
        onClick={onShowShortcuts}
        title="Keyboard shortcuts"
        tabIndex={-1}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M6.5 6C6.5 5.17 7.17 4.5 8 4.5C8.83 4.5 9.5 5.17 9.5 6C9.5 6.83 8 7.5 8 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}
