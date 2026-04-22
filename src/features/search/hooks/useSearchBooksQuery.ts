import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../lib/queryKeys';
import type { AppMode } from '../../mode/context/AppModeProvider';
import { searchBooks } from '../api/searchBooks';

export function useSearchBooksQuery(query: string, mode: AppMode) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: queryKeys.searchBooks(normalizedQuery, mode),
    queryFn: () => searchBooks(normalizedQuery, { mode }),
    enabled: normalizedQuery.length > 0,
  });
}
