import type { AppMode } from '../../mode/context/AppModeProvider';
import { getBooksByMode } from '../../books/api/getBooksByMode';
import type { SearchBook } from '../types/searchBook';

type SearchBooksOptions = {
  mode: AppMode;
};

export async function searchBooks(query: string, options: SearchBooksOptions): Promise<SearchBook[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return getBooksByMode(options.mode).filter((book) => {
    const target = `${book.title} ${book.author} ${book.ageRange} ${book.category}`.toLowerCase();
    return target.includes(normalizedQuery);
  });
}
