import { useState, useRef, useEffect } from 'react';

interface Props {
  onOpen: () => void;
  onShowShortcuts: () => void;
}

export function FileMenu({ onOpen, onShowShortcuts }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="file-menu-container">
      <button
        className="titlebar-action-btn"
        onClick={() => setOpen((v) => !v)}
        title="File menu"
        tabIndex={-1}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h3.586a1 1 0 0 1 .707.293L8 4h5.5A1.5 1.5 0 0 1 15 5.5v7A1.5 1.5 0 0 1 13.5 14h-11A1.5 1.5 0 0 1 1 12.5v-9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="file-menu-dropdown">
          <button
            className="file-menu-item"
            onClick={() => { setOpen(false); onOpen(); }}
          >
            Open file…
            <span className="file-menu-shortcut">Ctrl+O</span>
          </button>
          <div className="file-menu-divider" />
          <button
            className="file-menu-item"
            onClick={() => { setOpen(false); onShowShortcuts(); }}
          >
            Keyboard shortcuts
          </button>
        </div>
      )}
    </div>
  );
}
