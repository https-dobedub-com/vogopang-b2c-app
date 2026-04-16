import type { AppMode } from '../../mode/context/AppModeProvider';

export type Book = {
  id: string;
  title: string;
  author: string;
  ageRange: string;
  category: string;
  summary: string;
  episodeCount: number;
  readerCount: number;
  allowedModes: AppMode[];
};
