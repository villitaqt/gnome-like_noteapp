import { useState } from 'react';
import { Tab as TabType } from '../../types';

interface Props {
  tab: TabType;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onRename: (title: string) => void;
}

export function Tab({ tab, isActive, onActivate, onClose, onRename }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) onClose();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(tab.title);
    setIsEditing(true);
  };

  const confirmRename = () => {
    const next = editValue.trim() || tab.title;
    onRename(next);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') confirmRename();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div
      className={`tab no-drag${isActive ? ' active' : ''}`}
      onClick={isEditing ? undefined : onActivate}
      onDoubleClick={handleDoubleClick}
      title={isEditing ? undefined : (tab.filePath ?? tab.title)}
    >
      {tab.isDirty && !isEditing && <span className="tab-dirty-dot" title="Unsaved changes" />}
      {isEditing ? (
        <input
          className="tab-rename-input"
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={confirmRename}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="tab-title">{tab.title}</span>
      )}
      <button
        className="tab-close no-drag"
        onClick={handleClose}
        title="Close tab"
        tabIndex={-1}
      >
        ✕
      </button>
    </div>
  );
}
