import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { getBooksByIds } from '../../books/api/getBookById';
import type { Book } from '../../books/types/book';

const READING_LIST_STORAGE_KEY = 'vogopang:reading-list';

type ReadingListContextValue = {
  savedBookIds: string[];
  savedBooks: Book[];
  isHydrated: boolean;
  isBookSaved: (bookId: string) => boolean;
  toggleBook: (bookId: string) => void;
  removeBook: (bookId: string) => void;
  clearList: () => void;
};

const ReadingListContext = createContext<ReadingListContextValue | null>(null);

export function ReadingListProvider({ children }: PropsWithChildren) {
  const [savedBookIds, setSavedBookIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateReadingList() {
      try {
        const storedValue = await AsyncStorage.getItem(READING_LIST_STORAGE_KEY);
        const parsedValue = storedValue ? JSON.parse(storedValue) : [];

        if (isMounted && Array.isArray(parsedValue)) {
          setSavedBookIds(parsedValue.filter((item): item is string => typeof item === 'string'));
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateReadingList();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistIds = (nextIds: string[]) => {
    void AsyncStorage.setItem(READING_LIST_STORAGE_KEY, JSON.stringify(nextIds));
  };

  const toggleBook = (bookId: string) => {
    setSavedBookIds((currentIds) => {
      const nextIds = currentIds.includes(bookId)
        ? currentIds.filter((currentId) => currentId !== bookId)
        : [bookId, ...currentIds];

      persistIds(nextIds);
      return nextIds;
    });
  };

  const removeBook = (bookId: string) => {
    setSavedBookIds((currentIds) => {
      const nextIds = currentIds.filter((currentId) => currentId !== bookId);
      persistIds(nextIds);
      return nextIds;
    });
  };

  const clearList = () => {
    setSavedBookIds([]);
    void AsyncStorage.removeItem(READING_LIST_STORAGE_KEY);
  };

  const value = useMemo<ReadingListContextValue>(
    () => ({
      savedBookIds,
      savedBooks: getBooksByIds(savedBookIds),
      isHydrated,
      isBookSaved: (bookId: string) => savedBookIds.includes(bookId),
      toggleBook,
      removeBook,
      clearList,
    }),
    [savedBookIds, isHydrated],
  );

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (!context) {
    throw new Error('useReadingList must be used within ReadingListProvider');
  }
  return context;
}
