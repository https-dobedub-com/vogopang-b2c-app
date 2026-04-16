import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getBookById } from '../../src/features/books/api/getBookById';
import { useReadingList } from '../../src/features/reading-list/context/ReadingListProvider';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = typeof id === 'string' ? id : '';
  const { isBookSaved, toggleBook } = useReadingList();

  const bookQuery = useQuery({
    queryKey: ['book-detail', bookId],
    queryFn: () => getBookById(bookId),
    enabled: Boolean(bookId),
  });

  const book = bookQuery.data;
  const isSaved = book ? isBookSaved(book.id) : false;

  if (bookQuery.isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.helperText}>도서 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.screenFallback}>
        <Stack.Screen options={{ title: '도서 상세' }} />
        <Text style={styles.title}>도서를 찾을 수 없습니다.</Text>
        <Text style={styles.text}>요청한 도서 정보가 아직 준비되지 않았습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: book.title }} />

      <View style={styles.heroCard}>
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverCategory}>{book.category}</Text>
          <Text style={styles.coverTitle}>{book.title}</Text>
        </View>
        <View style={styles.heroMeta}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.meta}>{book.author}</Text>
          <Text style={styles.meta}>{book.ageRange}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{book.episodeCount}</Text>
          <Text style={styles.statLabel}>에피소드</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{book.readerCount}+</Text>
          <Text style={styles.statLabel}>읽은 보호자</Text>
        </View>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.sectionTitle}>소개</Text>
        <Text style={styles.text}>{book.summary}</Text>
      </View>

      <Pressable style={[styles.saveButton, isSaved ? styles.saveButtonActive : null]} onPress={() => toggleBook(book.id)}>
        <Text style={[styles.saveButtonText, isSaved ? styles.saveButtonTextActive : null]}>
          {isSaved ? '읽기 목록에서 제거' : '읽기 목록에 추가'}
        </Text>
      </Pressable>
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
  screenFallback: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  heroCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  coverPlaceholder: {
    minHeight: 178,
    backgroundColor: '#111827',
    padding: 18,
    justifyContent: 'flex-end',
  },
  coverCategory: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  coverTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  heroMeta: {
    padding: 14,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    color: '#64748B',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  statValue: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 18,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  infoBlock: {
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  text: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  helperText: {
    fontSize: 13,
    color: '#64748B',
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: '#111827',
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButtonTextActive: {
    color: '#1D4ED8',
  },
});
