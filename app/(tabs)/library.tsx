import { useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Book } from '../../src/features/books/types/book';
import { useAppMode } from '../../src/features/mode/context/AppModeProvider';
import { useReadingList } from '../../src/features/reading-list/context/ReadingListProvider';

type SortMode = 'recent' | 'title';

export default function LibraryScreen() {
  const { savedBooks, savedBookIds, isHydrated, removeBook, clearList } = useReadingList();
  const { mode } = useAppMode();
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const modeBooks = savedBooks.filter((book) => book.allowedModes.includes(mode));
  const visibleBooks = sortBooks(modeBooks, savedBookIds, sortMode);

  if (!isHydrated) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.helperText}>읽기 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>읽기 목록</Text>
          <Text style={styles.text}>{visibleBooks.length}권 저장됨</Text>
        </View>

        {visibleBooks.length > 0 ? (
          <Pressable style={styles.clearButton} onPress={clearList}>
            <Text style={styles.clearButtonText}>비우기</Text>
          </Pressable>
        ) : null}
      </View>

      {visibleBooks.length > 0 ? (
        <View style={styles.segmentedControl}>
          <SortButton label="최근 추가" value="recent" currentValue={sortMode} onPress={setSortMode} />
          <SortButton label="이름순" value="title" currentValue={sortMode} onPress={setSortMode} />
        </View>
      ) : null}

      {visibleBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>아직 저장한 도서가 없습니다.</Text>
          <Text style={styles.emptyText}>홈이나 검색에서 도서를 열고 읽기 목록에 추가해보세요.</Text>
          <Link href="/" style={styles.emptyLink}>
            홈에서 도서 찾기
          </Link>
        </View>
      ) : null}

      {visibleBooks.map((book) => (
        <View key={book.id} style={styles.bookCard}>
          <Link href={`/book/${book.id}`} style={styles.bookContent}>
            <Text style={styles.bookCategory}>{book.category}</Text>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookMeta}>{book.author}</Text>
            <Text style={styles.bookMeta}>{book.ageRange}</Text>
          </Link>
          <Pressable style={styles.removeButton} onPress={() => removeBook(book.id)}>
            <Text style={styles.removeButtonText}>삭제</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function sortBooks(books: Book[], savedBookIds: string[], sortMode: SortMode) {
  if (sortMode === 'title') {
    return [...books].sort((firstBook, secondBook) => firstBook.title.localeCompare(secondBook.title));
  }

  return [...books].sort((firstBook, secondBook) => {
    return savedBookIds.indexOf(firstBook.id) - savedBookIds.indexOf(secondBook.id);
  });
}

type SortButtonProps = {
  label: string;
  value: SortMode;
  currentValue: SortMode;
  onPress: (value: SortMode) => void;
};

function SortButton({ label, value, currentValue, onPress }: SortButtonProps) {
  const isActive = value === currentValue;

  return (
    <Pressable style={[styles.sortButton, isActive ? styles.sortButtonActive : null]} onPress={() => onPress(value)}>
      <Text style={[styles.sortButtonText, isActive ? styles.sortButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  text: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
  },
  clearButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    padding: 4,
    gap: 4,
  },
  sortButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sortButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  sortButtonTextActive: {
    color: '#0F172A',
  },
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 16,
    gap: 8,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyLink: {
    marginTop: 4,
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  bookCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 10,
  },
  bookContent: {
    gap: 4,
  },
  bookCategory: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  removeButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
});
