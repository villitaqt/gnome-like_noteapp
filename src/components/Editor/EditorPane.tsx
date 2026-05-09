import { useRef } from 'react';
import { Tab } from '../../types';
import { useCodeMirror } from './useCodeMirror';

interface Props {
  tab: Tab;
  onUpdate: (content: string) => void;
  showLineNumbers: boolean;
}

export function EditorPane({ tab, onUpdate, showLineNumbers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  useCodeMirror(containerRef, tab.content, tab.filePath, onUpdate, showLineNumbers);

  return <div className={`editor-pane${showLineNumbers ? '' : ' no-gutter'}`} ref={containerRef} />;
}
