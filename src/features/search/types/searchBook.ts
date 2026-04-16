import type { AppMode } from '../../mode/context/AppModeProvider';

export type SearchBook = {
  id: string;
  title: string;
  author: string;
  ageRange: string;
  allowedModes: AppMode[];
};
