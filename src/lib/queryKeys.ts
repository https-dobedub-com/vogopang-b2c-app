import type { AppMode } from '../features/mode/context/AppModeProvider';

export const queryKeys = {
  homeFeed: ['home-feed'] as const,
  bookDetail: (bookId: string) => ['book-detail', bookId] as const,
  playerInfo: (seriesId: number, episodeId: number) => ['player-info', seriesId, episodeId] as const,
  searchBooks: (query: string, mode: AppMode) => ['search-books', query, mode] as const,
};
