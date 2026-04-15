import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import type { SearchBook } from '../types/searchBook';

type SearchResultCardProps = {
  book: SearchBook;
};

export function SearchResultCard({ book }: SearchResultCardProps) {
  return (
    <Link href={`/book/${book.id}`} style={styles.card}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.meta}>{book.author}</Text>
      <Text style={styles.meta}>{book.ageRange}</Text>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
});
