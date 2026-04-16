import { Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useReadingList } from '../../src/features/reading-list/context/ReadingListProvider';

export default function LibraryScreen() {
  const { savedBooks, isHydrated } = useReadingList();

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
      <Text style={styles.title}>읽기 목록</Text>
      <Text style={styles.text}>저장한 도서를 모아보는 영역입니다.</Text>

      {savedBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>아직 저장한 도서가 없습니다.</Text>
          <Text style={styles.emptyText}>도서 상세 화면에서 읽기 목록에 추가해보세요.</Text>
        </View>
      ) : null}

      {savedBooks.map((book) => (
        <Link key={book.id} href={`/book/${book.id}`} style={styles.bookCard}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookMeta}>{book.author}</Text>
          <Text style={styles.bookMeta}>{book.ageRange}</Text>
        </Link>
      ))}
    </ScrollView>
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
  emptyState: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 16,
    gap: 4,
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
  bookCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 4,
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
});
