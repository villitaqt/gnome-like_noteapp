interface Props {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export function WindowControls({ onMinimize, onMaximize, onClose }: Props) {
  return (
    <div className="window-controls">
      <button
        className="wm-btn minimize no-drag"
        onClick={onMinimize}
        title="Minimize"
        tabIndex={-1}
      >
        <span className="wm-icon" />
      </button>
      <button
        className="wm-btn maximize no-drag"
        onClick={onMaximize}
        title="Maximize"
        tabIndex={-1}
      >
        <span className="wm-icon" />
      </button>
      <button
        className="wm-btn close no-drag"
        onClick={onClose}
        title="Close"
        tabIndex={-1}
      >
        <span className="wm-close-x">✕</span>
      </button>
    </div>
  );
}
