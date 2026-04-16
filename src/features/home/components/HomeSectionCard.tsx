import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { HomeBook, HomeSection } from '../types/homeFeed';

type HomeSectionCardProps = {
  section: HomeSection;
};

export function HomeSectionCard({ section }: HomeSectionCardProps) {
  if (section.type === 'main-banner' && section.banners?.length) {
    return (
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {section.banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              {banner.badge ? <Text style={styles.badge}>{banner.badge}</Text> : null}
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if ((section.type === 'new-books' || section.type === 'recommended-books') && section.books?.length) {
    return (
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.description ? <Text style={styles.description}>{section.description}</Text> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {section.books.map((book) => (
            <BookShelfCard key={book.id} book={book} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (section.type === 'events' && section.events?.length) {
    return (
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventSummary}>{event.summary}</Text>
          </View>
        ))}
      </View>
    );
  }

  return null;
}

function BookShelfCard({ book }: { book: HomeBook }) {
  return (
    <Link href={`/book/${book.id}`} asChild>
      <Pressable style={styles.bookCard} accessibilityRole="button" accessibilityLabel={`${book.title} 상세 보기`}>
        <View style={styles.bookCover}>
          <Text style={styles.bookCategory}>{book.category}</Text>
          <Text style={styles.bookCoverTitle}>{book.title}</Text>
        </View>
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookMeta}>{book.author}</Text>
          <Text style={styles.bookMeta}>{book.ageRange}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  horizontalList: {
    gap: 10,
    paddingRight: 12,
  },
  bannerCard: {
    width: 290,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#BFDBFE',
    fontSize: 13,
    lineHeight: 18,
  },
  bookCard: {
    width: 142,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  bookCover: {
    height: 132,
    backgroundColor: '#111827',
    padding: 10,
    justifyContent: 'space-between',
  },
  bookCategory: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  bookCoverTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  bookInfo: {
    padding: 10,
    gap: 4,
  },
  bookTitle: {
    color: '#0F172A',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  bookMeta: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 15,
  },
  eventCard: {
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  eventSummary: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
});
