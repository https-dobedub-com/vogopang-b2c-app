import { MOCK_BOOKS } from '../data/mockBooks';
import type { Book } from '../types/book';

export async function getBookById(id: string): Promise<Book | null> {
  await new Promise((resolve) => setTimeout(resolve, 160));
  return MOCK_BOOKS.find((book) => book.id === id) ?? null;
}

export function getBooksByIds(ids: string[]): Book[] {
  const idSet = new Set(ids);
  return MOCK_BOOKS.filter((book) => idSet.has(book.id));
}
