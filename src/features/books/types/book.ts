import type { AppMode } from '../../mode/context/AppModeProvider';

export type BookEpisode = {
  id: string;
  title: string;
  summary: string;
  durationMinutes: number;
  isFree: boolean;
};

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
  episodes: BookEpisode[];
};
