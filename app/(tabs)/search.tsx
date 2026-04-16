import { useDeferredValue, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';
import { SearchResultCard } from '../../src/features/search/components/SearchResultCard';
import { useSearchBooksQuery } from '../../src/features/search/hooks/useSearchBooksQuery';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { mode, isKidsMode } = useAppMode();

  const searchBooksQuery = useSearchBooksQuery(deferredQuery, mode);
  const hasQuery = deferredQuery.trim().length > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>도서 검색</Text>

      {isKidsMode ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>키즈모드에서는 아동용 콘텐츠만 검색됩니다.</Text>
        </View>
      ) : (
        <View style={styles.noticeBoxGuardian}>
          <Text style={styles.noticeTextGuardian}>보호자용 자료까지 포함해 검색됩니다.</Text>
        </View>
      )}

      <TextInput
        placeholder="도서명 또는 작가명을 입력하세요"
        placeholderTextColor="#94A3B8"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />

      {!hasQuery ? <Text style={styles.caption}>검색어를 입력하면 결과를 표시합니다.</Text> : null}

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
  noticeBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: '#1D4ED8',
    fontSize: 12,
  },
  noticeBoxGuardian: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeTextGuardian: {
    color: '#047857',
    fontSize: 12,
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
