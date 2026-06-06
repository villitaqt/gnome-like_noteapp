import { useEffect, useRef, useState } from 'react';

const SUBTITLES = ['Empieza a Escribir...', 'Habia una vez...', 'Hoy...'];

interface Props {
  onStartTyping: (char: string) => void;
}

export function EmptyState({ onStartTyping }: Props) {
  const [subtitle] = useState(() => SUBTITLES[Math.floor(Math.random() * SUBTITLES.length)]);
  const callbackRef = useRef(onStartTyping);
  callbackRef.current = onStartTyping;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        callbackRef.current(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-bear">ʕ•ᴥ•ʔ</div>
        <div className="empty-state-subtitle">{subtitle}</div>
      </div>
      <div className="empty-state-hint">
        <kbd className="empty-state-kbd">Ctrl+O</kbd> para abrir un archivo
      </div>
    </div>
  );
}
