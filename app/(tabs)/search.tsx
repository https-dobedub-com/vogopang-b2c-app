import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBooksByMode } from '../../src/features/books/api/getBooksByMode';
import { ModeBottomNavigation } from '../../src/features/mode/components/ModeBottomNavigation';
import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

type AllBook = {
  id: string;
  image: ImageSourcePropType;
};

const HOME_ASSETS = {
  logo: require('../../assets/figma/home/logo.png'),
  footer: require('../../assets/figma/home/footer.png'),
  footerTablet: require('../../assets/figma/tablet/footer.png'),
};

const ALL_BOOK_ASSETS = {
  event: require('../../assets/figma/all-books/exclusive-event.png'),
  book01: require('../../assets/figma/all-books/book-01.png'),
  book02: require('../../assets/figma/all-books/book-02.png'),
  book03: require('../../assets/figma/all-books/book-03.png'),
  book04: require('../../assets/figma/all-books/book-04.png'),
  book05: require('../../assets/figma/all-books/book-05.png'),
  book06: require('../../assets/figma/all-books/book-06.png'),
  book07: require('../../assets/figma/all-books/book-07.png'),
  book08: require('../../assets/figma/all-books/book-08.png'),
  book09: require('../../assets/figma/all-books/book-09.png'),
  book10: require('../../assets/figma/all-books/book-10.png'),
  book11: require('../../assets/figma/all-books/book-11.png'),
  book12: require('../../assets/figma/all-books/book-12.png'),
  book13: require('../../assets/figma/all-books/book-13.png'),
  book14: require('../../assets/figma/all-books/book-14.png'),
  book15: require('../../assets/figma/all-books/book-15.png'),
  book16: require('../../assets/figma/all-books/book-16.png'),
  book17: require('../../assets/figma/all-books/book-17.png'),
  book18: require('../../assets/figma/all-books/book-18.png'),
  book19: require('../../assets/figma/all-books/book-19.png'),
  book20: require('../../assets/figma/all-books/book-20.png'),
  book21: require('../../assets/figma/all-books/book-21.png'),
  book22: require('../../assets/figma/all-books/book-22.png'),
};

const SEARCH_ASSETS = {
  emptyEvent: require('../../assets/figma/search/empty-event.png'),
  resultEvent: require('../../assets/figma/search/result-event.png'),
  resultCard: require('../../assets/figma/search/result-card.png'),
};

const EVENT_ASSETS = {
  event01: require('../../assets/figma/events/event-01.png'),
  event02: require('../../assets/figma/events/event-02.png'),
};

const ALL_BOOKS: AllBook[] = [
  { id: 'book-104', image: ALL_BOOK_ASSETS.book01 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book02 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book03 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book04 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book05 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book06 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book07 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book08 },
  { id: 'book-104', image: ALL_BOOK_ASSETS.book09 },
  { id: 'book-101', image: ALL_BOOK_ASSETS.book10 },
  { id: 'book-105', image: ALL_BOOK_ASSETS.book11 },
  { id: 'book-105', image: ALL_BOOK_ASSETS.book12 },
  { id: 'book-105', image: ALL_BOOK_ASSETS.book13 },
  { id: 'book-105', image: ALL_BOOK_ASSETS.book14 },
  { id: 'book-105', image: ALL_BOOK_ASSETS.book15 },
  { id: 'book-103', image: ALL_BOOK_ASSETS.book16 },
  { id: 'book-102', image: ALL_BOOK_ASSETS.book17 },
  { id: 'book-102', image: ALL_BOOK_ASSETS.book18 },
  { id: 'book-102', image: ALL_BOOK_ASSETS.book19 },
  { id: 'book-102', image: ALL_BOOK_ASSETS.book20 },
  { id: 'book-103', image: ALL_BOOK_ASSETS.book21 },
  { id: 'book-103', image: ALL_BOOK_ASSETS.book22 },
];
const GUARDIAN_BOOKS: AllBook[] = [
  { id: 'book-301', image: SEARCH_ASSETS.resultCard },
  { id: 'book-302', image: SEARCH_ASSETS.resultCard },
];

const CATEGORIES = ['전체', '필독', '창의·언어', '함께하는 문화', '위인', '역사', '신화', '예술·감각', '수·과학', '기타 백과'];
const TABLET_BREAKPOINT = 768;

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const { mode } = useAppMode();
  const isTablet = width >= TABLET_BREAKPOINT;
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const availableBooks = useMemo(() => getBooksByMode(mode), [mode]);
  const availableBookIds = useMemo(() => new Set(availableBooks.map((book) => book.id)), [availableBooks]);
  const visibleAllBooks = useMemo(() => {
    const visibleBooks = ALL_BOOKS.filter((book) => availableBookIds.has(book.id));
    return mode === 'guardian' ? [...GUARDIAN_BOOKS, ...visibleBooks] : visibleBooks;
  }, [availableBookIds, mode]);
  const searchResults = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    return availableBooks.filter((book) => {
      const searchableText = `${book.title} ${book.author} ${book.ageRange} ${book.category}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [availableBooks, trimmedQuery]);
  const searchState = !trimmedQuery ? 'all' : searchResults.length > 0 ? 'result' : 'empty';

  const isSearching = searchState !== 'all';
  const eventImage = searchState === 'empty' ? SEARCH_ASSETS.emptyEvent : searchState === 'result' ? SEARCH_ASSETS.resultEvent : ALL_BOOK_ASSETS.event;
  const tabletEventImages = searchState === 'all' ? [EVENT_ASSETS.event01, EVENT_ASSETS.event02] : [eventImage, EVENT_ASSETS.event02];
  const resultCountLabel = searchState === 'all' ? `총 (${visibleAllBooks.length})` : `검색 결과 (${searchResults.length})`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, isTablet ? styles.screenTablet : null]}>
        <View style={[styles.header, isTablet ? styles.headerTablet : null]}>
          <Link href="/" asChild>
            <Pressable accessibilityRole="button">
              <Image source={HOME_ASSETS.logo} style={styles.logoImage} resizeMode="contain" />
            </Pressable>
          </Link>
          <View style={styles.headerActions}>
            <Ionicons name="search-outline" size={isTablet ? 36 : 24} color="#111111" />
            <Pressable style={styles.loginButton} accessibilityRole="button">
              <Text style={styles.loginText}>로그인</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.topMenu, isTablet ? styles.topMenuTablet : null]}>
          <Link href="/" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null]}>홈</Text>
            </Pressable>
          </Link>
          <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null, styles.topMenuTextActive]}>전체 도서</Text>
          <Link href="/events" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null]}>이벤트</Text>
            </Pressable>
          </Link>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isTablet ? styles.scrollContentTablet : null]} showsVerticalScrollIndicator={false}>
          <View style={[styles.searchBox, isTablet ? styles.searchBoxTablet : null]}>
            <TextInput
              style={[styles.searchInput, isTablet ? styles.searchInputTablet : null]}
              placeholder="작품명 검색"
              placeholderTextColor="#B7B7B7"
              returnKeyType="search"
              value={query}
              onChangeText={setQuery}
            />
            {isSearching ? (
              <Pressable style={[styles.clearButton, isTablet ? styles.clearButtonTablet : null]} accessibilityRole="button" onPress={() => setQuery('')}>
                <Ionicons name="close" size={isTablet ? 24 : 18} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Ionicons name="search-outline" size={isTablet ? 36 : 24} color="#111111" />
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryList, isTablet ? styles.categoryListTablet : null]}>
            {CATEGORIES.map((category, index) => (
              <Text key={category} style={[styles.categoryText, isTablet ? styles.categoryTextTablet : null, index === 0 ? styles.categoryTextActive : null]}>
                {category}
              </Text>
            ))}
          </ScrollView>

          <View style={[styles.sortRow, isTablet ? styles.sortRowTablet : null]}>
            <Text style={[styles.sortTextStrong, isTablet ? styles.sortTextTablet : null]}>
              {resultCountLabel}
            </Text>
            <Text style={[styles.sortTextStrong, isTablet ? styles.sortTextTablet : null]}>ㅣ</Text>
            <Text style={[styles.sortText, isTablet ? styles.sortTextTablet : null]}>이름 오름차순</Text>
            <Ionicons name="chevron-down" size={isTablet ? 24 : 12} color="#000000" />
          </View>

          {searchState === 'all' ? (
            <View style={[styles.bookGrid, isTablet ? styles.bookGridTablet : null]}>
              {visibleAllBooks.map((book, index) => (
                <Link key={`${book.id}-${index}`} href={`/book/${book.id}`} asChild>
                  <Pressable style={[styles.bookCard, isTablet ? styles.bookCardTablet : null]} accessibilityRole="button">
                    <Image source={book.image} style={[styles.bookImage, isTablet ? styles.bookImageTablet : null]} resizeMode="contain" />
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : null}

          {searchState === 'result' ? (
            <View style={[styles.searchResultArea, isTablet ? styles.searchResultAreaTablet : null]}>
              {searchResults.map((book) => {
                const image = visibleAllBooks.find((item) => item.id === book.id)?.image ?? SEARCH_ASSETS.resultCard;

                return (
                  <Link key={book.id} href={`/book/${book.id}`} asChild>
                    <Pressable style={[styles.bookCard, isTablet ? styles.bookCardTablet : null]} accessibilityRole="button">
                      <Image source={image} style={[styles.bookImage, isTablet ? styles.bookImageTablet : null]} resizeMode="contain" />
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          ) : null}

          {searchState === 'empty' ? (
            <View style={[styles.emptyArea, isTablet ? styles.emptyAreaTablet : null]}>
              <Text style={[styles.emptyText, isTablet ? styles.emptyTextTablet : null]}>‘{trimmedQuery}’에 대한{'\n'}검색 결과가 없습니다.</Text>
            </View>
          ) : null}

          <View style={[styles.eventSection, isTablet ? styles.eventSectionTablet : null]}>
            <View style={[styles.sectionTitleRow, isTablet ? styles.sectionTitleRowTablet : null]}>
              <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>오직 보고팡에서만!</Text>
              <View style={styles.sectionControls}>
                <Text style={[styles.moreText, isTablet ? styles.moreTextTablet : null]}>더보기</Text>
                <Ionicons name="chevron-back" size={isTablet ? 32 : 24} color="#D0D0D0" />
                <Ionicons name="chevron-forward" size={isTablet ? 32 : 24} color="#333333" />
              </View>
            </View>
            {isTablet ? (
              <View style={styles.eventImageGridTablet}>
                {tabletEventImages.map((image, index) => (
                  <Image key={index} source={image} style={styles.eventImageTablet} resizeMode="cover" />
                ))}
              </View>
            ) : (
              <Image source={eventImage} style={styles.eventImage} resizeMode="cover" />
            )}
          </View>

          <Image
            source={isTablet ? HOME_ASSETS.footerTablet : HOME_ASSETS.footer}
            style={[styles.footerImage, isTablet ? styles.footerImageTablet : null]}
            resizeMode="cover"
          />
        </ScrollView>

        <ModeBottomNavigation isTablet={isTablet} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 393,
    backgroundColor: '#FFFFFF',
  },
  screenTablet: {
    maxWidth: 1024,
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  headerTablet: {
    height: 84,
    paddingHorizontal: 40,
  },
  logoImage: {
    width: 78,
    height: 28,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    minWidth: 68,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6503F8',
    backgroundColor: '#DFE9FF',
  },
  loginText: {
    color: '#6503F8',
    fontSize: 16,
    fontWeight: '400',
  },
  topMenu: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  topMenuTablet: {
    height: 64,
    gap: 32,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  topMenuText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
  },
  topMenuTextTablet: {
    fontSize: 20,
    letterSpacing: 0.4,
  },
  topMenuTextActive: {
    color: '#6503F8',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 112,
  },
  scrollContentTablet: {
    paddingTop: 32,
    paddingBottom: 134,
  },
  searchBox: {
    height: 40,
    marginHorizontal: 20,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBoxTablet: {
    height: 52,
    marginHorizontal: 40,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    color: '#000000',
    fontSize: 16,
    fontWeight: '400',
  },
  searchInputTablet: {
    height: 36,
    fontSize: 20,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
  },
  clearButtonTablet: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  categoryListTablet: {
    paddingHorizontal: 40,
    paddingTop: 32,
    gap: 32,
  },
  categoryText: {
    color: '#B4B3B3',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
  },
  categoryTextTablet: {
    fontSize: 20,
    letterSpacing: 0.4,
  },
  categoryTextActive: {
    color: '#000000',
  },
  sortRow: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortRowTablet: {
    marginTop: 32,
    marginHorizontal: 40,
    gap: 8,
  },
  sortTextStrong: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  sortText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
  },
  sortTextTablet: {
    fontSize: 24,
    letterSpacing: 0.96,
  },
  bookGrid: {
    marginTop: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  bookGridTablet: {
    marginTop: 32,
    paddingHorizontal: 40,
    rowGap: 32,
  },
  bookCard: {
    width: 110,
    height: 237,
  },
  bookCardTablet: {
    width: 221,
    height: 440,
  },
  bookImage: {
    width: 110,
    height: 237,
  },
  bookImageTablet: {
    width: 221,
    height: 440,
  },
  searchResultArea: {
    height: 275,
    marginTop: 20,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  searchResultAreaTablet: {
    height: 472,
    marginTop: 32,
    paddingHorizontal: 40,
  },
  emptyArea: {
    height: 275,
    marginTop: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAreaTablet: {
    height: 472,
    marginTop: 32,
    paddingHorizontal: 40,
  },
  emptyText: {
    width: '100%',
    color: '#B7B7B7',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyTextTablet: {
    fontSize: 24,
    lineHeight: 32,
  },
  eventSection: {
    marginTop: 32,
    gap: 16,
  },
  eventSectionTablet: {
    marginTop: 64,
    gap: 20,
  },
  sectionTitleRow: {
    minHeight: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleRowTablet: {
    minHeight: 38,
    paddingHorizontal: 40,
  },
  sectionTitle: {
    flexShrink: 1,
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitleTablet: {
    fontSize: 32,
    letterSpacing: 1.28,
  },
  sectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreText: {
    color: '#B7B7B7',
    fontSize: 12,
    fontWeight: '400',
  },
  moreTextTablet: {
    fontSize: 16,
  },
  eventImage: {
    marginHorizontal: 16,
    width: 361,
    height: 180,
  },
  eventImageGridTablet: {
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventImageTablet: {
    width: 462,
    height: 230,
  },
  footerImage: {
    marginTop: 80,
    width: '100%',
    height: 736,
  },
  footerImageTablet: {
    marginTop: 150,
    height: 731,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 89,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    paddingTop: 8,
  },
  bottomNavTablet: {
    height: 134,
    paddingHorizontal: 180,
    paddingTop: 16,
  },
  bottomNavItem: {
    width: 52,
    alignItems: 'center',
    gap: 2,
  },
  bottomNavText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomNavTextTablet: {
    fontSize: 16,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    width: 140,
    height: 5,
    marginLeft: -70,
    borderRadius: 3,
    backgroundColor: '#5C5C5C',
  },
});
