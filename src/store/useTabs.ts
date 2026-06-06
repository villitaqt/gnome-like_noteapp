import { useReducer } from 'react';
import { Tab, TabsState } from '../types';

type Action =
  | { type: 'NEW_TAB'; content?: string }
  | { type: 'CLOSE_TAB'; id: string }
  | { type: 'ACTIVATE_TAB'; id: string }
  | { type: 'UPDATE_CONTENT'; id: string; content: string }
  | { type: 'MARK_SAVED'; id: string; filePath: string; title: string }
  | { type: 'RENAME_TAB'; id: string; title: string }
  | { type: 'RESTORE_SESSION'; tabs: Tab[]; activeId: string }
  | { type: 'OPEN_FILE_TAB'; filePath: string; content: string; title: string }
  | { type: 'NEXT_TAB' };

function createBlankTab(): Tab {
  return {
    id: crypto.randomUUID(),
    title: 'Untitled',
    filePath: null,
    content: '',
    isDirty: false,
  };
}

function reducer(state: TabsState, action: Action): TabsState {
  switch (action.type) {
    case 'NEW_TAB': {
      const tab = {
        ...createBlankTab(),
        content: action.content ?? '',
        isDirty: !!action.content,
      };
      return { tabs: [...state.tabs, tab], activeId: tab.id };
    }

    case 'CLOSE_TAB': {
      const idx = state.tabs.findIndex((t) => t.id === action.id);
      const newTabs = state.tabs.filter((t) => t.id !== action.id);
      if (newTabs.length === 0) {
        return { tabs: [], activeId: null };
      }
      let newActiveId = state.activeId;
      if (state.activeId === action.id) {
        newActiveId = newTabs[Math.min(idx, newTabs.length - 1)].id;
      }
      return { tabs: newTabs, activeId: newActiveId };
    }

    case 'ACTIVATE_TAB':
      return { ...state, activeId: action.id };

    case 'UPDATE_CONTENT':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, content: action.content, isDirty: true } : t
        ),
      };

    case 'MARK_SAVED':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id
            ? { ...t, filePath: action.filePath, title: action.title, isDirty: false }
            : t
        ),
      };

    case 'RENAME_TAB':
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === action.id ? { ...t, title: action.title } : t
        ),
      };

    case 'RESTORE_SESSION':
      return { tabs: action.tabs, activeId: action.activeId };

    case 'OPEN_FILE_TAB': {
      // If this file is already open, just activate it
      const existing = state.tabs.find((t) => t.filePath === action.filePath);
      if (existing) {
        return { ...state, activeId: existing.id };
      }
      const tab: Tab = {
        id: crypto.randomUUID(),
        title: action.title,
        filePath: action.filePath,
        content: action.content,
        isDirty: false,
      };
      return { tabs: [...state.tabs, tab], activeId: tab.id };
    }

    case 'NEXT_TAB': {
      if (state.tabs.length <= 1) return state;
      const idx = state.tabs.findIndex((t) => t.id === state.activeId);
      const nextIdx = (idx + 1) % state.tabs.length;
      return { ...state, activeId: state.tabs[nextIdx].id };
    }

    default:
      return state;
  }
}

const initialState: TabsState = {
  tabs: [],
  activeId: null,
};

export function useTabs() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const activeTab = state.tabs.find((t) => t.id === state.activeId) ?? null;
  return { tabs: state.tabs, activeId: state.activeId, activeTab, dispatch };
}
