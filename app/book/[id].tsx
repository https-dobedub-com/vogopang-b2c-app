import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBookById } from '../../src/features/books/api/getBookById';
import type { Book, BookEpisode } from '../../src/features/books/types/book';
import { useAppMode } from '../../src/features/mode/context/AppModeProvider';
import { useReadingList } from '../../src/features/reading-list/context/ReadingListProvider';

type BookTile = {
  id: string;
  image: ImageSourcePropType;
};

const TABLET_BREAKPOINT = 768;

const HOME_ASSETS = {
  logo: require('../../assets/figma/home/logo.png'),
  footer: require('../../assets/figma/home/footer.png'),
  footerTablet: require('../../assets/figma/tablet/footer.png'),
};

const DETAIL_ASSETS = {
  cover: require('../../assets/figma/book-detail/cover.png'),
  episode01: require('../../assets/figma/book-detail/episode-01.png'),
  episode02: require('../../assets/figma/book-detail/episode-02.png'),
  nextCover: require('../../assets/figma/book-detail/next-cover.png'),
};

const RECOMMEND_ASSETS = {
  book01: require('../../assets/figma/all-books/book-10.png'),
  book02: require('../../assets/figma/all-books/book-11.png'),
  book03: require('../../assets/figma/all-books/book-12.png'),
  book04: require('../../assets/figma/all-books/book-13.png'),
  book05: require('../../assets/figma/all-books/book-14.png'),
  book06: require('../../assets/figma/all-books/book-15.png'),
  book07: require('../../assets/figma/all-books/book-16.png'),
  book08: require('../../assets/figma/all-books/book-17.png'),
};

const EVENT_ASSETS = {
  event01: require('../../assets/figma/events/event-01.png'),
  event02: require('../../assets/figma/events/event-02.png'),
};

const RECOMMENDED_BOOKS: BookTile[] = [
  { id: 'book-105', image: RECOMMEND_ASSETS.book01 },
  { id: 'book-105', image: RECOMMEND_ASSETS.book02 },
  { id: 'book-105', image: RECOMMEND_ASSETS.book03 },
  { id: 'book-105', image: RECOMMEND_ASSETS.book04 },
  { id: 'book-101', image: RECOMMEND_ASSETS.book05 },
  { id: 'book-101', image: RECOMMEND_ASSETS.book06 },
  { id: 'book-103', image: RECOMMEND_ASSETS.book07 },
  { id: 'book-102', image: RECOMMEND_ASSETS.book08 },
];

export default function BookDetailScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bookId = typeof id === 'string' ? id : '';
  const { mode, isGuardianUnlocked } = useAppMode();
  const { isBookSaved, toggleBook } = useReadingList();

  const bookQuery = useQuery({
    queryKey: ['book-detail', bookId],
    queryFn: () => getBookById(bookId),
    enabled: Boolean(bookId),
  });

  const book = bookQuery.data;
  const isSaved = book ? isBookSaved(book.id) : false;
  const canOpenBook = book ? book.allowedModes.includes(mode) : false;

  if (bookQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerScreen}>
          <ActivityIndicator size="small" color="#6503F8" />
          <Text style={styles.helperText}>도서 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.screenFallback}>
          <Text style={styles.fallbackTitle}>도서를 찾을 수 없습니다.</Text>
          <Text style={styles.helperText}>요청한 도서 정보가 아직 준비되지 않았습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canOpenBook) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.screenFallback}>
          <Text style={styles.fallbackTitle}>보호자 인증이 필요합니다.</Text>
          <Text style={styles.helperText}>{book.title}은 보호자 모드에서만 볼 수 있습니다.</Text>
          <Pressable
            style={styles.fallbackButton}
            accessibilityRole="button"
            onPress={() => router.push(isGuardianUnlocked ? '/guardian' : '/guardian/unlock')}
          >
            <Text style={styles.fallbackButtonText}>보호자 모드로 이동</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const episodes = book.episodes.slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.screen, isTablet ? styles.screenTablet : null]}>
        <DetailHeader isTablet={isTablet} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, isTablet ? styles.contentTablet : null]}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection isTablet={isTablet} isSaved={isSaved} onToggleSave={() => toggleBook(book.id)} />
          <BookIntro book={book} isTablet={isTablet} />
          <EpisodeSection episodes={episodes} bookId={book.id} isTablet={isTablet} />
          <StorySection book={book} isTablet={isTablet} />
          <BookInfoSection book={book} isTablet={isTablet} />
          <NextBookSection isTablet={isTablet} />
          <RecommendedSection isTablet={isTablet} />
          <EventSection isTablet={isTablet} />
          <Image
            source={isTablet ? HOME_ASSETS.footerTablet : HOME_ASSETS.footer}
            style={[styles.footerImage, isTablet ? styles.footerImageTablet : null]}
            resizeMode="cover"
          />
        </ScrollView>

        <BottomNavigation isTablet={isTablet} />
      </View>
    </SafeAreaView>
  );
}

function DetailHeader({ isTablet }: { isTablet: boolean }) {
  const router = useRouter();

  return (
    <View style={[styles.header, isTablet ? styles.headerTablet : null]}>
      <Pressable style={styles.headerIconButton} accessibilityRole="button" onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={isTablet ? 36 : 24} color="#111111" />
      </Pressable>
      <View style={styles.headerActions}>
        <Ionicons name="search-outline" size={isTablet ? 36 : 24} color="#111111" />
        <Pressable style={styles.loginButton} accessibilityRole="button">
          <Text style={styles.loginText}>로그인</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeroSection({ isTablet, isSaved, onToggleSave }: { isTablet: boolean; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <View style={[styles.heroStage, isTablet ? styles.heroStageTablet : null]}>
      <Image source={DETAIL_ASSETS.cover} style={[styles.heroCover, isTablet ? styles.heroCoverTablet : null]} resizeMode="cover" />
      <Pressable
        style={[styles.heroBookmark, isTablet ? styles.heroBookmarkTablet : null, isSaved ? styles.heroBookmarkActive : null]}
        accessibilityRole="button"
        accessibilityLabel={isSaved ? '읽기 목록에서 제거' : '읽기 목록에 추가'}
        onPress={onToggleSave}
      >
        <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={isTablet ? 32 : 20} color={isSaved ? '#6503F8' : '#CFCFCF'} />
      </Pressable>
    </View>
  );
}

function BookIntro({ book, isTablet }: { book: Book; isTablet: boolean }) {
  return (
    <View style={[styles.introSection, isTablet ? styles.introSectionTablet : null]}>
      <View style={styles.introTopRow}>
        <View style={[styles.categoryBadge, isTablet ? styles.categoryBadgeTablet : null]}>
          <Text style={[styles.categoryText, isTablet ? styles.categoryTextTablet : null]}>{book.category}</Text>
        </View>
        <Text style={[styles.seriesLink, isTablet ? styles.seriesLinkTablet : null]}>전체 시리즈 확인하기</Text>
      </View>
      <Text style={[styles.detailTitle, isTablet ? styles.detailTitleTablet : null]}>{book.title}</Text>
      <Text style={[styles.detailMeta, isTablet ? styles.detailMetaTablet : null]}>{book.author}</Text>
      <View style={styles.readerRow}>
        <Ionicons name="bookmark-outline" size={isTablet ? 16 : 14} color="#B7B7B7" />
        <Text style={[styles.readerText, isTablet ? styles.readerTextTablet : null]}>{book.readerCount}명이 읽었어요.</Text>
      </View>
    </View>
  );
}

function EpisodeSection({ episodes, bookId, isTablet }: { episodes: BookEpisode[]; bookId: string; isTablet: boolean }) {
  const episodeImages = [DETAIL_ASSETS.episode01, DETAIL_ASSETS.episode02];

  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>회차 ({episodes.length})</Text>
      <View style={styles.episodeList}>
        {episodes.map((episode, index) => (
          <EpisodeRow
            key={episode.id}
            bookId={bookId}
            episode={episode}
            episodeNumber={index + 1}
            image={episodeImages[index]}
            isTablet={isTablet}
          />
        ))}
      </View>
    </View>
  );
}

function EpisodeRow({
  bookId,
  episode,
  episodeNumber,
  image,
  isTablet,
}: {
  bookId: string;
  episode: BookEpisode;
  episodeNumber: number;
  image: ImageSourcePropType;
  isTablet: boolean;
}) {
  return (
    <Link href={`/player/${bookId}/${episode.id}`} asChild>
      <Pressable style={[styles.episodeRow, isTablet ? styles.episodeRowTablet : null]} accessibilityRole="button">
        <View style={styles.episodeInfoRow}>
          <Image source={image} style={[styles.episodeThumb, isTablet ? styles.episodeThumbTablet : null]} resizeMode="cover" />
          <View style={styles.episodeTexts}>
            <Text style={[styles.episodeStatus, isTablet ? styles.episodeStatusTablet : null]}>미열람</Text>
            <Text style={[styles.episodeTitle, isTablet ? styles.episodeTitleTablet : null]}>{episode.title}</Text>
            <Text style={[styles.episodeTime, isTablet ? styles.episodeStatusTablet : null]}>{episode.durationMinutes}분</Text>
          </View>
        </View>
        <Ionicons name="play" size={isTablet ? 64 : 30} color="#F6D042" />
      </Pressable>
    </Link>
  );
}

function StorySection({ book, isTablet }: { book: Book; isTablet: boolean }) {
  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>줄거리</Text>
      <Text style={[styles.bodyText, isTablet ? styles.bodyTextTablet : null]}>{book.summary}</Text>
      <Text style={[styles.moreLink, isTablet ? styles.moreLinkTablet : null]}>더보기</Text>
    </View>
  );
}

function BookInfoSection({ book, isTablet }: { book: Book; isTablet: boolean }) {
  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>도서 정보</Text>
      <View style={styles.infoList}>
        <InfoItem label="종이책 출판일" value="2011년 7월 30일" isTablet={isTablet} />
        <InfoItem label="도서 분류" value={book.category} isTablet={isTablet} />
        <Text style={[styles.hashText, isTablet ? styles.hashTextTablet : null]}>#{book.category}</Text>
        <Text style={[styles.hashText, isTablet ? styles.hashTextTablet : null]}>#{book.ageRange}</Text>
      </View>
    </View>
  );
}

function InfoItem({ label, value, isTablet }: { label: string; value: string; isTablet: boolean }) {
  return (
    <View style={styles.infoItem}>
      <Text style={[styles.infoLabel, isTablet ? styles.infoLabelTablet : null]}>{label}</Text>
      <Text style={[styles.infoValue, isTablet ? styles.infoValueTablet : null]}>{value}</Text>
    </View>
  );
}

function NextBookSection({ isTablet }: { isTablet: boolean }) {
  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>다음 책</Text>
      <Link href="/book/book-104" asChild>
        <Pressable style={[styles.nextCard, isTablet ? styles.nextCardTablet : null]} accessibilityRole="button">
          <View style={[styles.nextCoverWrap, isTablet ? styles.nextCoverWrapTablet : null]}>
            <Image source={DETAIL_ASSETS.nextCover} style={[styles.nextCover, isTablet ? styles.nextCoverTablet : null]} resizeMode="cover" />
          </View>
          <View style={styles.nextTextWrap}>
            <Text style={[styles.nextTitle, isTablet ? styles.nextTitleTablet : null]}>그리스 로마 신화 : 제우스의 탄생과 신들의 전쟁 2</Text>
            <Text style={[styles.infoValue, isTablet ? styles.infoValueTablet : null]}>총 2에피소드</Text>
          </View>
          <Ionicons name="chevron-forward" size={isTablet ? 36 : 24} color="#D0D0D0" />
        </Pressable>
      </Link>
    </View>
  );
}

function RecommendedSection({ isTablet }: { isTablet: boolean }) {
  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <SectionTitleRow title="엄마들이 추천한 보고팡 도서" isTablet={isTablet} />
      <View style={[styles.bookGrid, isTablet ? styles.bookGridTablet : null]}>
        {RECOMMENDED_BOOKS.map((book, index) => (
          <Link key={`${book.id}-${index}`} href={`/book/${book.id}`} asChild>
            <Pressable style={[styles.bookTile, isTablet ? styles.bookTileTablet : null]} accessibilityRole="button">
              <Image source={book.image} style={[styles.bookImage, isTablet ? styles.bookImageTablet : null]} resizeMode="contain" />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

function EventSection({ isTablet }: { isTablet: boolean }) {
  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <SectionTitleRow title="이벤트" showMore isTablet={isTablet} />
      <View style={[styles.eventGrid, isTablet ? styles.eventGridTablet : null]}>
        <Image source={EVENT_ASSETS.event01} style={[styles.eventImage, isTablet ? styles.eventImageTablet : null]} resizeMode="cover" />
        <Image source={EVENT_ASSETS.event02} style={[styles.eventImage, isTablet ? styles.eventImageTablet : null]} resizeMode="cover" />
      </View>
    </View>
  );
}

function SectionTitleRow({ title, showMore = false, isTablet }: { title: string; showMore?: boolean; isTablet: boolean }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>{title}</Text>
      <View style={styles.sectionControls}>
        {showMore ? <Text style={[styles.moreText, isTablet ? styles.moreTextTablet : null]}>더보기</Text> : null}
        <Ionicons name="chevron-back" size={isTablet ? 32 : 24} color="#D0D0D0" />
        <Ionicons name="chevron-forward" size={isTablet ? 32 : 24} color="#333333" />
      </View>
    </View>
  );
}

function BottomNavigation({ isTablet }: { isTablet: boolean }) {
  return (
    <View style={[styles.bottomNav, isTablet ? styles.bottomNavTablet : null]}>
      <Link href="/" asChild>
        <Pressable style={styles.bottomNavItem} accessibilityRole="button">
          <Ionicons name="albums-outline" size={isTablet ? 36 : 24} color="#2C2C2C" />
          <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null]}>푸딩</Text>
        </Pressable>
      </Link>
      <Pressable style={styles.bottomNavItem} accessibilityRole="button">
        <Ionicons name="sparkles-outline" size={isTablet ? 36 : 24} color="#000000" />
        <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null]}>아티스트</Text>
      </Pressable>
      <Link href="/library" asChild>
        <Pressable style={styles.bottomNavItem} accessibilityRole="button">
          <Ionicons name="book-outline" size={isTablet ? 36 : 24} color="#000000" />
          <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null]}>내 서재</Text>
        </Pressable>
      </Link>
      <Link href="/more" asChild>
        <Pressable style={styles.bottomNavItem} accessibilityRole="button">
          <Ionicons name="grid-outline" size={isTablet ? 36 : 24} color="#000000" />
          <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null]}>더보기</Text>
        </Pressable>
      </Link>
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
  screenFallback: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  fallbackButton: {
    marginTop: 8,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 112,
  },
  contentTablet: {
    paddingBottom: 134,
  },
  header: {
    height: 44,
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
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  heroStage: {
    height: 251,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStageTablet: {
    height: 435,
  },
  heroCover: {
    width: 150,
    height: 198,
  },
  heroCoverTablet: {
    width: 330,
    height: 435,
  },
  heroBookmark: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBookmarkTablet: {
    right: 71,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  heroBookmarkActive: {
    borderColor: '#6503F8',
  },
  introSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  introSectionTablet: {
    paddingHorizontal: 40,
    paddingTop: 30,
    gap: 16,
  },
  introTopRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: '#FF3434',
    backgroundColor: 'rgba(169,37,37,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  categoryBadgeTablet: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  categoryText: {
    color: '#FF3434',
    fontSize: 10,
    fontWeight: '700',
  },
  categoryTextTablet: {
    fontSize: 16,
    letterSpacing: 0.48,
  },
  seriesLink: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  seriesLinkTablet: {
    fontSize: 16,
  },
  detailTitle: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  detailTitleTablet: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 1.8,
  },
  detailMeta: {
    color: '#B7B7B7',
    fontSize: 12,
    lineHeight: 17,
  },
  detailMetaTablet: {
    fontSize: 16,
    lineHeight: 19,
  },
  readerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerText: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  readerTextTablet: {
    fontSize: 16,
  },
  section: {
    marginTop: 36,
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionTablet: {
    marginTop: 64,
    paddingHorizontal: 40,
    gap: 20,
  },
  sectionTitleRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitleTablet: {
    fontSize: 24,
    letterSpacing: 0.96,
  },
  sectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreText: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  moreTextTablet: {
    fontSize: 16,
  },
  episodeList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  episodeRow: {
    minHeight: 78,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  episodeRowTablet: {
    minHeight: 122,
    paddingVertical: 20,
  },
  episodeInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  episodeThumb: {
    width: 88,
    height: 48,
  },
  episodeThumbTablet: {
    width: 150,
    height: 82,
  },
  episodeTexts: {
    flex: 1,
    gap: 4,
  },
  episodeStatus: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  episodeStatusTablet: {
    fontSize: 16,
  },
  episodeTitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  episodeTitleTablet: {
    fontSize: 24,
    letterSpacing: 0.96,
  },
  episodeTime: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  bodyText: {
    color: '#333333',
    fontSize: 12,
    lineHeight: 20,
  },
  bodyTextTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  moreLink: {
    color: '#B7B7B7',
    fontSize: 12,
  },
  moreLinkTablet: {
    fontSize: 16,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    gap: 8,
  },
  infoLabel: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  infoLabelTablet: {
    fontSize: 20,
    letterSpacing: 0.4,
  },
  infoValue: {
    color: '#333333',
    fontSize: 12,
    lineHeight: 17,
  },
  infoValueTablet: {
    fontSize: 16,
    lineHeight: 19,
  },
  hashText: {
    color: '#B7B7B7',
    fontSize: 11,
  },
  hashTextTablet: {
    fontSize: 14,
  },
  nextCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  nextCardTablet: {
    minHeight: 218,
  },
  nextCoverWrap: {
    width: 108,
    height: 112,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCoverWrapTablet: {
    width: 284,
    height: 218,
  },
  nextCover: {
    width: 76,
    height: 100,
  },
  nextCoverTablet: {
    width: 165,
    height: 218,
  },
  nextTextWrap: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  nextTitle: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  nextTitleTablet: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 1.8,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  bookGridTablet: {
    rowGap: 32,
  },
  bookTile: {
    width: 85,
    height: 183,
  },
  bookTileTablet: {
    width: 221,
    height: 440,
  },
  bookImage: {
    width: 85,
    height: 183,
  },
  bookImageTablet: {
    width: 221,
    height: 440,
  },
  eventGrid: {
    gap: 12,
  },
  eventGridTablet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventImageTablet: {
    width: 462,
    height: 230,
  },
  footerImage: {
    marginTop: 64,
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bottomNavTablet: {
    height: 134,
    paddingHorizontal: 40,
    paddingTop: 16,
  },
  bottomNavItem: {
    width: 72,
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
  fallbackTitle: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '700',
  },
  helperText: {
    color: '#64748B',
    fontSize: 13,
  },
});
