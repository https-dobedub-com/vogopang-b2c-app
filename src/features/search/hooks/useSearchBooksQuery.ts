import { useQuery } from '@tanstack/react-query';

import { searchBooks } from '../api/searchBooks';

export function useSearchBooksQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ['search-books', normalizedQuery],
    queryFn: () => searchBooks(normalizedQuery),
    enabled: normalizedQuery.length > 0,
  });
}
