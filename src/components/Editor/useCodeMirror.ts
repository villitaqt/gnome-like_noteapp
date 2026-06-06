import { useEffect, useRef, RefObject } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  bracketMatching,
  indentOnInput,
  foldGutter,
  foldKeymap,
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageDescription,
} from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import {
  closeBrackets,
  autocompletion,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

// Light theme: clean Adwaita-inspired
const lightTheme = EditorView.theme(
  {
    '&': { color: '#1c1c1c', backgroundColor: 'transparent', height: '100%' },
    '.cm-scroller': { overflow: 'auto' },
    '.cm-content': { caretColor: '#3584e4' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#3584e4', borderLeftWidth: '2px' },
    '.cm-selectionBackground, ::selection': { backgroundColor: '#3584e433 !important' },
  },
  { dark: false },
);

// Dark theme: one-dark + keep full height
const darkTheme = [
  oneDark,
  EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { overflow: 'auto' } }),
];

function isDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getInitialLangExtension(filePath: string | null) {
  if (!filePath) return markdown({ codeLanguages: languages });
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'markdown') return markdown({ codeLanguages: languages });
  const desc = LanguageDescription.matchFilename(languages, filePath);
  if (desc?.support) return desc.support;
  return [];
}

async function loadLangAsync(
  filePath: string | null,
  view: EditorView,
  compartment: Compartment,
) {
  if (!filePath) return;
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'markdown') return;

  const desc = LanguageDescription.matchFilename(languages, filePath);
  if (!desc) return;
  if (desc.support) {
    view.dispatch({ effects: compartment.reconfigure(desc.support) });
    return;
  }
  try {
    const support = await desc.load();
    if (!view.dom.isConnected) return;
    view.dispatch({ effects: compartment.reconfigure(support) });
  } catch {
    // Language load failed, keep plain text
  }
}

export function useCodeMirror(
  containerRef: RefObject<HTMLDivElement | null>,
  initialContent: string,
  filePath: string | null,
  onUpdate: (content: string) => void,
  showLineNumbers: boolean,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const langCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const lineNumsCompartment = useRef(new Compartment());
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const langComp = langCompartment.current;
    const themeComp = themeCompartment.current;
    const lineNumsComp = lineNumsCompartment.current;
    const dark = isDark();
    const initialTheme = dark ? darkTheme : [lightTheme, syntaxHighlighting(defaultHighlightStyle, { fallback: true })];

    const startState = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumsComp.of(showLineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : []),
        EditorView.lineWrapping,
        highlightActiveLine(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        langComp.of(getInitialLangExtension(filePath)),
        themeComp.of(initialTheme),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onUpdateRef.current(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });
    viewRef.current = view;

    // Watch for OS dark/light mode toggle
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSchemeChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches
        ? darkTheme
        : [lightTheme, syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
      view.dispatch({ effects: themeComp.reconfigure(newTheme) });
    };
    mq.addEventListener('change', onSchemeChange);

    loadLangAsync(filePath, view, langComp);

    return () => {
      mq.removeEventListener('change', onSchemeChange);
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle line numbers without remounting the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: lineNumsCompartment.current.reconfigure(
        showLineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : [],
      ),
    });
  }, [showLineNumbers]);
}
