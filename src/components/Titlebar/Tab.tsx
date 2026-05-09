import { Tab as TabType } from '../../types';

interface Props {
  tab: TabType;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, onActivate, onClose }: Props) {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={`tab no-drag${isActive ? ' active' : ''}`}
      onClick={onActivate}
      title={tab.filePath ?? tab.title}
    >
      {tab.isDirty && <span className="tab-dirty-dot" title="Unsaved changes" />}
      <span className="tab-title">{tab.title}</span>
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
