import { useDeferredValue, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchResultCard } from '../../src/features/search/components/SearchResultCard';
import { useSearchBooksQuery } from '../../src/features/search/hooks/useSearchBooksQuery';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const searchBooksQuery = useSearchBooksQuery(deferredQuery);
  const hasQuery = deferredQuery.trim().length > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>도서 검색</Text>

      <TextInput
        placeholder="도서명 또는 작가명을 입력하세요"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />

      {!hasQuery ? (
        <Text style={styles.caption}>검색어를 입력하면 결과를 표시합니다.</Text>
      ) : null}

      {searchBooksQuery.isFetching && hasQuery ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>검색 중...</Text>
        </View>
      ) : null}

      {hasQuery && !searchBooksQuery.isFetching && searchBooksQuery.data?.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : null}

      {searchBooksQuery.data?.map((book) => (
        <SearchResultCard key={book.id} book={book} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#1D4ED8',
    fontSize: 13,
  },
  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  emptyText: {
    color: '#475569',
    fontSize: 13,
  },
});
