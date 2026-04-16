import type { AppMode } from '../../mode/context/AppModeProvider';
import { MOCK_BOOKS } from '../data/mockBooks';
import type { Book } from '../types/book';

export function getBooksByMode(mode: AppMode): Book[] {
  return MOCK_BOOKS.filter((book) => book.allowedModes.includes(mode));
}
