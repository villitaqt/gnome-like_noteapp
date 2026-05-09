import { Tab as TabType } from '../../types';
import { Tab } from './Tab';

interface Props {
  tabs: TabType[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  onNewTab: () => void;
  onOpen: () => void;
}

export function TabBar({ tabs, activeId, onActivate, onClose, onNewTab, onOpen }: Props) {
  return (
    <div className="tab-bar-wrapper">
      <div className="titlebar-left-actions">
        <button
          className="titlebar-action-btn"
          onClick={onOpen}
          title="Open file (Ctrl+O)"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.586a1 1 0 0 1 .707.293L8 4h5.5A1.5 1.5 0 0 1 15 5.5v7A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5v-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </button>
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
      <div className="tab-bar" data-tauri-drag-region>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            onActivate={() => onActivate(tab.id)}
            onClose={() => onClose(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}
