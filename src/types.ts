export interface Tab {
  id: string;
  title: string;
  filePath: string | null;
  content: string;
  isDirty: boolean;
}

export interface TabsState {
  tabs: Tab[];
  activeId: string | null;
}
