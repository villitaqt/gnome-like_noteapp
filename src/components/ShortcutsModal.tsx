interface Props {
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Ctrl + S', desc: 'Save' },
  { key: 'Ctrl + Shift + S', desc: 'Save as…' },
  { key: 'Ctrl + N / Ctrl + T', desc: 'New tab' },
  { key: 'Ctrl + W', desc: 'Close tab' },
  { key: 'Ctrl + Tab', desc: 'Next tab' },
  { key: 'Ctrl + O', desc: 'Open file' },
  { key: 'Ctrl + L', desc: 'Toggle line numbers' },
];

export function ShortcutsModal({ onClose }: Props) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="shortcuts-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="shortcuts-title">Keyboard Shortcuts</h3>
        <div className="shortcuts-list">
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} className="shortcut-row">
              <kbd className="shortcut-key">{key}</kbd>
              <span className="shortcut-desc">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
