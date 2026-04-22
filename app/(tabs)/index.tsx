import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getBooksByMode } from '../../src/features/books/api/getBooksByMode';
import { ModeBottomNavigation } from '../../src/features/mode/components/ModeBottomNavigation';
import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

type HeroBanner = {
  id: string;
  title: string;
  subtitle: string;
  caption: string;
  backgroundColor: string;
  accentColor: string;
  image: ImageSourcePropType;
  eventImage: ImageSourcePropType;
};

type LandscapeBook = {
  id: string;
  title: string;
  author: string;
  ageRange: string;
  coverColor: string;
  badge: string;
  image: ImageSourcePropType;
};

type BookCard = {
  id: string;
  title: string;
  episodeCount: number;
  readerText: string;
  coverColor: string;
  image: ImageSourcePropType;
};

const FIGMA_HOME_ASSETS = {
  logo: require('../../assets/figma/home/logo.png'),
  mainBanner: require('../../assets/figma/home/main-banner.png'),
  eventPopular: require('../../assets/figma/home/event-popular.png'),
  eventRecommend: require('../../assets/figma/home/event-recommend.png'),
  eventCuration: require('../../assets/figma/home/event-curation.png'),
  eventFinal: require('../../assets/figma/home/event-final.png'),
  new01: require('../../assets/figma/home/new-01.png'),
  new02: require('../../assets/figma/home/new-02.png'),
  new03: require('../../assets/figma/home/new-03.png'),
  card01: require('../../assets/figma/home/card-01.png'),
  card02: require('../../assets/figma/home/card-02.png'),
  card03: require('../../assets/figma/home/card-03.png'),
  card04: require('../../assets/figma/home/card-04.png'),
  card05: require('../../assets/figma/home/card-05.png'),
  card06: require('../../assets/figma/home/card-06.png'),
  card201: require('../../assets/figma/home/card2-01.png'),
  card202: require('../../assets/figma/home/card2-02.png'),
  card203: require('../../assets/figma/home/card2-03.png'),
  card204: require('../../assets/figma/home/card2-04.png'),
  card205: require('../../assets/figma/home/card2-05.png'),
  card206: require('../../assets/figma/home/card2-06.png'),
  myth01: require('../../assets/figma/home/myth-01.png'),
  myth02: require('../../assets/figma/home/myth-02.png'),
  myth03: require('../../assets/figma/home/myth-03.png'),
  leader01: require('../../assets/figma/home/leader-01.png'),
  leader02: require('../../assets/figma/home/leader-02.png'),
  leader03: require('../../assets/figma/home/leader-03.png'),
  series01: require('../../assets/figma/home/series-01.png'),
  series02: require('../../assets/figma/home/series-02.png'),
  footer: require('../../assets/figma/home/footer.png'),
  footerTablet: require('../../assets/figma/tablet/footer.png'),
};

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 'book-104',
    title: '그리스 로마 신화',
    subtitle: '처음 만나는 상상력 가득한 신화 이야기',
    caption: '보고팡 추천 컬렉션',
    backgroundColor: '#7C3AED',
    accentColor: '#FFE66D',
    image: FIGMA_HOME_ASSETS.mainBanner,
    eventImage: FIGMA_HOME_ASSETS.eventRecommend,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    subtitle: '도전과 성장을 배우는 위인전 시리즈',
    caption: '이번 주 인기',
    backgroundColor: '#2F80ED',
    accentColor: '#FFFFFF',
    image: FIGMA_HOME_ASSETS.eventPopular,
    eventImage: FIGMA_HOME_ASSETS.eventPopular,
  },
];

const GUARDIAN_BANNERS: HeroBanner[] = [
  {
    id: 'book-301',
    title: '학부모 가이드',
    subtitle: '독서 습관을 함께 설계하는 보호자 자료',
    caption: '보호자 추천',
    backgroundColor: '#111827',
    accentColor: '#F6D042',
    image: FIGMA_HOME_ASSETS.eventCuration,
    eventImage: FIGMA_HOME_ASSETS.eventCuration,
  },
  {
    id: 'book-302',
    title: '학습 리포트 해설집',
    subtitle: '읽기 활동 데이터를 쉽게 해석하는 방법',
    caption: '리포트 가이드',
    backgroundColor: '#2563EB',
    accentColor: '#FFFFFF',
    image: FIGMA_HOME_ASSETS.eventRecommend,
    eventImage: FIGMA_HOME_ASSETS.eventRecommend,
  },
];

const NEW_BOOKS: LandscapeBook[] = [
  {
    id: 'book-101',
    title: '일리어드',
    author: '글 작가 / 그림 작가',
    ageRange: '4 ~ 5세과정',
    coverColor: '#FDE68A',
    badge: '신화',
    image: FIGMA_HOME_ASSETS.new01,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    author: '글 작가 / 그림 작가',
    ageRange: '5 ~ 7세 과정',
    coverColor: '#BAE6FD',
    badge: '위인',
    image: FIGMA_HOME_ASSETS.new02,
  },
  {
    id: 'book-103',
    title: '만화 삼국지 도원결의',
    author: '보고팡 출판',
    ageRange: '6 ~ 8세',
    coverColor: '#FBCFE8',
    badge: '역사',
    image: FIGMA_HOME_ASSETS.new03,
  },
];

const POPULAR_BOOKS: BookCard[] = [
  {
    id: 'book-101',
    title: '일리어드',
    episodeCount: 8,
    readerText: '200명 이상',
    coverColor: '#D8B4FE',
    image: FIGMA_HOME_ASSETS.card01,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    episodeCount: 12,
    readerText: '100명 이상',
    coverColor: '#93C5FD',
    image: FIGMA_HOME_ASSETS.card02,
  },
  {
    id: 'book-103',
    title: '만화 삼국지 도원결의',
    episodeCount: 2,
    readerText: '20명 이상',
    coverColor: '#FCD34D',
    image: FIGMA_HOME_ASSETS.card03,
  },
  {
    id: 'book-104',
    title: '그리스 로마 신화',
    episodeCount: 10,
    readerText: '100명 이상',
    coverColor: '#C4B5FD',
    image: FIGMA_HOME_ASSETS.card04,
  },
  {
    id: 'book-105',
    title: '100 시리즈',
    episodeCount: 20,
    readerText: '100명 이상',
    coverColor: '#67E8F9',
    image: FIGMA_HOME_ASSETS.card05,
  },
  {
    id: 'book-201',
    title: '함께하는 문화',
    episodeCount: 7,
    readerText: '50명 이상',
    coverColor: '#FDA4AF',
    image: FIGMA_HOME_ASSETS.card06,
  },
];

const MYTH_BOOKS: BookCard[] = [
  {
    id: 'book-104',
    title: '그리스 로마 신화',
    episodeCount: 10,
    readerText: '100명 이상',
    coverColor: '#A78BFA',
    image: FIGMA_HOME_ASSETS.myth01,
  },
  {
    id: 'book-101',
    title: '일리어드',
    episodeCount: 8,
    readerText: '200명 이상',
    coverColor: '#FACC15',
    image: FIGMA_HOME_ASSETS.myth02,
  },
  {
    id: 'book-202',
    title: '예술 · 감각',
    episodeCount: 9,
    readerText: '20명 이상',
    coverColor: '#FDBA74',
    image: FIGMA_HOME_ASSETS.myth03,
  },
];

const PRESCHOOL_BOOKS: BookCard[] = [
  {
    id: 'book-201',
    title: '함께하는 문화',
    episodeCount: 7,
    readerText: '50명 이상',
    coverColor: '#FDA4AF',
    image: FIGMA_HOME_ASSETS.card201,
  },
  {
    id: 'book-105',
    title: '100 시리즈',
    episodeCount: 20,
    readerText: '100명 이상',
    coverColor: '#67E8F9',
    image: FIGMA_HOME_ASSETS.card202,
  },
  {
    id: 'book-104',
    title: '그리스 로마 신화',
    episodeCount: 10,
    readerText: '100명 이상',
    coverColor: '#C4B5FD',
    image: FIGMA_HOME_ASSETS.card203,
  },
  {
    id: 'book-103',
    title: '만화 삼국지 도원결의',
    episodeCount: 2,
    readerText: '20명 이상',
    coverColor: '#FCD34D',
    image: FIGMA_HOME_ASSETS.card204,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기',
    episodeCount: 12,
    readerText: '100명 이상',
    coverColor: '#93C5FD',
    image: FIGMA_HOME_ASSETS.card205,
  },
  {
    id: 'book-101',
    title: '일리어드',
    episodeCount: 8,
    readerText: '200명 이상',
    coverColor: '#D8B4FE',
    image: FIGMA_HOME_ASSETS.card206,
  },
];

const LEADER_BOOKS: BookCard[] = [
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기 : 김구',
    episodeCount: 2,
    readerText: '50명 이상',
    coverColor: '#BFDBFE',
    image: FIGMA_HOME_ASSETS.leader01,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기 : 김수환',
    episodeCount: 2,
    readerText: '100명 이상',
    coverColor: '#FDE68A',
    image: FIGMA_HOME_ASSETS.leader02,
  },
  {
    id: 'book-102',
    title: '최고를 꿈꾼 사람들의 이야기 : 레이첼',
    episodeCount: 2,
    readerText: '10명 이상',
    coverColor: '#FECACA',
    image: FIGMA_HOME_ASSETS.leader03,
  },
];

const SERIES_BOOKS: BookCard[] = [
  {
    id: 'book-105',
    title: '만화로 쉽게 읽는 세계사 100',
    episodeCount: 2,
    readerText: '50명 이상',
    coverColor: '#F9A8D4',
    image: FIGMA_HOME_ASSETS.series01,
  },
  {
    id: 'book-105',
    title: '만화로 쉽게 읽는 한국사 100',
    episodeCount: 2,
    readerText: '100명 이상',
    coverColor: '#FDE047',
    image: FIGMA_HOME_ASSETS.series02,
  },
];

const GUARDIAN_BOOKS: BookCard[] = [
  {
    id: 'book-301',
    title: '학부모 가이드: 독서 습관 만들기',
    episodeCount: 4,
    readerText: '보호자 자료',
    coverColor: '#111827',
    image: FIGMA_HOME_ASSETS.eventCuration,
  },
  {
    id: 'book-302',
    title: '학습 리포트 해설집',
    episodeCount: 3,
    readerText: '보호자 자료',
    coverColor: '#2563EB',
    image: FIGMA_HOME_ASSETS.eventRecommend,
  },
];

const TABLET_BREAKPOINT = 768;

function filterCardsByAllowedIds<T extends { id: string }>(cards: T[], allowedBookIds: Set<string>) {
  return cards.filter((card) => allowedBookIds.has(card.id));
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { mode } = useAppMode();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isGuardianMode = mode === 'guardian';
  const allowedBookIds = useMemo(() => new Set(getBooksByMode(mode).map((book) => book.id)), [mode]);
  const heroBanners = isGuardianMode ? GUARDIAN_BANNERS : HERO_BANNERS;
  const newBooks = useMemo(() => filterCardsByAllowedIds(NEW_BOOKS, allowedBookIds), [allowedBookIds]);
  const popularBooks = useMemo(
    () => (isGuardianMode ? [...filterCardsByAllowedIds(POPULAR_BOOKS, allowedBookIds), ...GUARDIAN_BOOKS] : filterCardsByAllowedIds(POPULAR_BOOKS, allowedBookIds)),
    [allowedBookIds, isGuardianMode],
  );
  const preschoolBooks = useMemo(() => filterCardsByAllowedIds(PRESCHOOL_BOOKS, allowedBookIds), [allowedBookIds]);
  const mythBooks = useMemo(() => filterCardsByAllowedIds(MYTH_BOOKS, allowedBookIds), [allowedBookIds]);
  const leaderBooks = useMemo(() => filterCardsByAllowedIds(LEADER_BOOKS, allowedBookIds), [allowedBookIds]);
  const seriesBooks = useMemo(() => filterCardsByAllowedIds(SERIES_BOOKS, allowedBookIds), [allowedBookIds]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, isTablet ? styles.screenTablet : null]}>
        <View style={[styles.header, isTablet ? styles.headerTablet : null]}>
          <Image source={FIGMA_HOME_ASSETS.logo} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.headerActions}>
            <Ionicons name="search-outline" size={isTablet ? 36 : 24} color="#111111" />
            <Pressable style={styles.loginButton} accessibilityRole="button">
              <Text style={styles.loginText}>로그인</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.topMenu, isTablet ? styles.topMenuTablet : null]}>
          <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null, styles.topMenuTextActive]}>홈</Text>
          <Link href="/search" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null]}>전체 도서</Text>
            </Pressable>
          </Link>
          <Link href="/events" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null]}>이벤트</Text>
            </Pressable>
          </Link>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, isTablet ? styles.scrollContentTablet : null]}
          showsVerticalScrollIndicator={false}
        >
          <MainBanner isTablet={isTablet} banner={heroBanners[0]} sideImages={[heroBanners[1].image, FIGMA_HOME_ASSETS.eventCuration]} />

          <EventSection title={isGuardianMode ? '보호자 추천 자료' : '아이들의 인기 도서'} banner={heroBanners[1]} isTablet={isTablet} />

          <NewBookSection books={newBooks} isTablet={isTablet} />

          <GridSection title={isGuardianMode ? '보호자 참고 자료' : isTablet ? '엄마들이 추천한 보고팡 도서' : '아이들의 인기 도서'} books={popularBooks} isTablet={isTablet} />

          <EventSection title={isTablet ? '오직 보고팡에서만!' : '보고팡이 추천하는 도서'} banner={heroBanners[0]} isTablet={isTablet} />

          <GridSection title={isTablet ? '아이들이 한 번은 꼭 읽는 도서' : '유아 필독서'} books={preschoolBooks} isTablet={isTablet} />

          <EventSection title={isTablet ? '오직 보고팡에서만!' : '우리 아이를 위한 큐레이션'} banner={{ ...HERO_BANNERS[1], eventImage: FIGMA_HOME_ASSETS.eventCuration }} isTablet={isTablet} />

          <GridSection title={isTablet ? '오직 보고팡에서만!' : '필독 : 그리스 로마 신화'} books={mythBooks} addAllLabel="[그리스 로마 신화] 전체 읽을 목록에 추가하기" isTablet={isTablet} />

          <GridSection
            title="필독 : 최고를 꿈꾼 사람들의 이야기"
            books={leaderBooks}
            addAllLabel="[최고를 꿈꾼 사람들의 이야기] 전체 읽을 목록에 추가하기"
            isTablet={isTablet}
          />

          <GridSection title="필독 : 100 시리즈" books={seriesBooks} addAllLabel="[100 시리즈] 전체 읽을 목록에 추가하기" isTablet={isTablet} />

          <EventSection title="이벤트" banner={{ ...HERO_BANNERS[0], eventImage: FIGMA_HOME_ASSETS.eventFinal }} isTablet={isTablet} />

          <Footer isTablet={isTablet} />
        </ScrollView>

        <ModeBottomNavigation isTablet={isTablet} />
      </View>
    </SafeAreaView>
  );
}

function MainBanner({ isTablet, banner, sideImages }: { isTablet: boolean; banner: HeroBanner; sideImages: ImageSourcePropType[] }) {
  const router = useRouter();

  return (
    <View style={[styles.mainBannerWrap, isTablet ? styles.mainBannerWrapTablet : null]}>
      {isTablet ? (
        <>
          <Image source={sideImages[0]} style={[styles.sideBannerTablet, styles.sideBannerLeftTablet]} resizeMode="cover" />
          <Image source={sideImages[1]} style={[styles.sideBannerTablet, styles.sideBannerRightTablet]} resizeMode="cover" />
        </>
      ) : null}
      <Pressable
        style={[isTablet ? styles.mainBannerTablet : styles.mainBanner, { backgroundColor: banner.backgroundColor }]}
        accessibilityRole="button"
        onPress={() => router.push(`/book/${banner.id}`)}
      >
        <Image source={banner.image} style={styles.fillImage} resizeMode="cover" />
      </Pressable>
      <View style={[styles.floatingArrowLeft, isTablet ? styles.floatingArrowLeftTablet : null]}>
        <Ionicons name="chevron-back" size={22} color="#333333" />
      </View>
      <View style={[styles.floatingArrowRight, isTablet ? styles.floatingArrowRightTablet : null]}>
        <Ionicons name="chevron-forward" size={22} color="#333333" />
      </View>
    </View>
  );
}

function EventSection({ title, banner, isTablet }: { title: string; banner: HeroBanner; isTablet: boolean }) {
  const router = useRouter();
  const tabletImages = [banner.eventImage, banner.id === HERO_BANNERS[0].id ? FIGMA_HOME_ASSETS.eventPopular : FIGMA_HOME_ASSETS.eventRecommend];

  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <SectionTitle title={title} showMore isTablet={isTablet} />
      {isTablet ? (
        <View style={styles.eventBannerGridTablet}>
          {tabletImages.map((image, index) => (
            <Pressable key={index} style={styles.eventBannerTablet} accessibilityRole="button" onPress={() => router.push(`/book/${banner.id}`)}>
              <Image source={image} style={styles.fillImage} resizeMode="cover" />
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          style={[styles.eventBanner, { backgroundColor: banner.backgroundColor }]}
          accessibilityRole="button"
          onPress={() => router.push(`/book/${banner.id}`)}
        >
          <Image source={banner.eventImage} style={styles.fillImage} resizeMode="cover" />
        </Pressable>
      )}
    </View>
  );
}

function NewBookSection({ books, isTablet }: { books: LandscapeBook[]; isTablet: boolean }) {
  if (books.length === 0) return null;

  return (
    <View style={[styles.sectionCompact, isTablet ? styles.sectionTablet : null]}>
      <SectionTitle title={isTablet ? '신작안내' : '신작 안내'} isTablet={isTablet} />
      <ScrollView horizontal={!isTablet} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.newBookList, isTablet ? styles.newBookListTablet : null]}>
        {books.map((book) => (
          <Link key={book.id} href={`/book/${book.id}`} asChild>
            <Pressable style={[styles.newBookCard, isTablet ? styles.newBookCardTablet : null]} accessibilityRole="button">
              <Image source={book.image} style={[styles.newBookCoverImage, isTablet ? styles.newBookCoverImageTablet : null]} resizeMode="cover" />
              <View style={styles.newBookInfo}>
                <Text style={[styles.newBookTitle, isTablet ? styles.newBookTitleTablet : null]} numberOfLines={1}>
                  {book.title}
                </Text>
                <Text style={[styles.newBookMeta, isTablet ? styles.newBookMetaTablet : null]}>{book.author}</Text>
                <Text style={[styles.newBookAge, isTablet ? styles.newBookMetaTablet : null]}>{book.ageRange}</Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

function GridSection({ title, books, addAllLabel, isTablet }: { title: string; books: BookCard[]; addAllLabel?: string; isTablet: boolean }) {
  if (books.length === 0) return null;

  return (
    <View style={[styles.section, isTablet ? styles.sectionTablet : null]}>
      <SectionTitle title={title} showMore={books.length > 3} isTablet={isTablet} />
      <View style={[styles.bookGrid, isTablet ? styles.bookGridTablet : null]}>
        {books.map((book, index) => (
          <BookTile key={`${book.title}-${index}`} book={book} isTablet={isTablet} />
        ))}
      </View>
      {addAllLabel ? <Text style={[styles.addAllText, isTablet ? styles.addAllTextTablet : null]}>{addAllLabel}</Text> : null}
    </View>
  );
}

function BookTile({ book, isTablet }: { book: BookCard; isTablet: boolean }) {
  return (
    <Link href={`/book/${book.id}`} asChild>
      <Pressable style={[styles.bookTile, isTablet ? styles.bookTileTablet : null]} accessibilityRole="button" accessibilityLabel={`${book.title} 상세 보기`}>
        <Image source={book.image} style={[styles.bookTileImage, isTablet ? styles.bookTileImageTablet : null]} resizeMode="contain" />
      </Pressable>
    </Link>
  );
}

function SectionTitle({ title, showMore = false, isTablet }: { title: string; showMore?: boolean; isTablet: boolean }) {
  return (
    <View style={[styles.sectionTitleRow, isTablet ? styles.sectionTitleRowTablet : null]}>
      <Text style={[styles.sectionTitle, isTablet ? styles.sectionTitleTablet : null]}>{title}</Text>
      {showMore ? (
        <View style={styles.sectionControls}>
          <Text style={[styles.moreText, isTablet ? styles.moreTextTablet : null]}>더보기</Text>
          <Ionicons name="chevron-back" size={isTablet ? 32 : 24} color="#D0D0D0" />
          <Ionicons name="chevron-forward" size={isTablet ? 32 : 24} color="#333333" />
        </View>
      ) : null}
    </View>
  );
}

function Footer({ isTablet }: { isTablet: boolean }) {
  return (
    <Image
      source={isTablet ? FIGMA_HOME_ASSETS.footerTablet : FIGMA_HOME_ASSETS.footer}
      style={[styles.footerImage, isTablet ? styles.footerImageTablet : null]}
      resizeMode="cover"
    />
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
    gap: 32,
    paddingTop: 0,
    paddingBottom: 112,
  },
  scrollContentTablet: {
    gap: 64,
    paddingBottom: 134,
  },
  mainBannerWrap: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  mainBannerWrapTablet: {
    height: 288,
    overflow: 'hidden',
  },
  mainBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 0,
    height: 200,
    overflow: 'hidden',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mainBannerTablet: {
    position: 'absolute',
    left: 252,
    top: 0,
    width: 520,
    height: 288,
    overflow: 'hidden',
  },
  sideBannerTablet: {
    position: 'absolute',
    top: 0,
    width: 520,
    height: 288,
    opacity: 0.7,
  },
  sideBannerLeftTablet: {
    left: -284,
  },
  sideBannerRightTablet: {
    left: 788,
  },
  fillImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerPortrait: {
    width: 88,
    height: 128,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPortraitText: {
    color: '#6503F8',
    fontSize: 18,
    fontWeight: '800',
  },
  bannerCopy: {
    flex: 1,
    gap: 8,
  },
  bannerCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mainBannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  mainBannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  bannerAccent: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    fontWeight: '800',
  },
  floatingArrowLeft: {
    position: 'absolute',
    left: 4,
    top: 88,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  floatingArrowLeftTablet: {
    left: 236,
    top: 128,
  },
  floatingArrowRight: {
    position: 'absolute',
    right: 4,
    top: 88,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  floatingArrowRightTablet: {
    right: 236,
    top: 128,
  },
  section: {
    gap: 16,
  },
  sectionTablet: {
    gap: 20,
  },
  sectionCompact: {
    gap: 12,
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
    letterSpacing: 0,
  },
  moreTextTablet: {
    fontSize: 16,
  },
  eventBanner: {
    marginHorizontal: 16,
    height: 180,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  eventBannerGridTablet: {
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventBannerTablet: {
    width: 462,
    height: 230,
    overflow: 'hidden',
  },
  eventCaption: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  eventSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  newBookList: {
    gap: 12,
    paddingHorizontal: 16,
  },
  newBookListTablet: {
    width: '100%',
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  newBookCard: {
    width: 163,
    gap: 8,
  },
  newBookCardTablet: {
    width: 301,
    gap: 16,
  },
  newBookCover: {
    height: 97,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  newBookCoverImage: {
    width: '100%',
    height: 97,
  },
  newBookCoverImageTablet: {
    height: 179,
  },
  coverBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    color: '#6503F8',
    fontSize: 10,
    fontWeight: '700',
  },
  coverLargeText: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '900',
  },
  newBookInfo: {
    gap: 4,
  },
  newBookTitle: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  newBookTitleTablet: {
    fontSize: 24,
    letterSpacing: 0.96,
  },
  newBookMeta: {
    color: '#B7B7B7',
    fontSize: 12,
    fontWeight: '400',
  },
  newBookAge: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
  },
  newBookMetaTablet: {
    fontSize: 16,
  },
  bookGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  bookGridTablet: {
    paddingHorizontal: 40,
    rowGap: 32,
  },
  bookTile: {
    width: 110,
    height: 237,
    gap: 8,
  },
  bookTileTablet: {
    width: 221,
    height: 440,
  },
  bookTileImage: {
    width: 110,
    height: 237,
  },
  bookTileImageTablet: {
    width: 221,
    height: 440,
  },
  bookTileCover: {
    height: 145,
    padding: 9,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bookCoverMark: {
    alignSelf: 'flex-start',
    color: '#6503F8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    fontWeight: '800',
  },
  bookCoverTitle: {
    color: '#111111',
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '900',
  },
  bookTileInfo: {
    gap: 4,
  },
  bookTileTitle: {
    minHeight: 34,
    color: '#000000',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
  },
  bookTileMeta: {
    color: '#333333',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
  },
  readerRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  readerText: {
    flex: 1,
    color: '#B7B7B7',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '400',
  },
  addAllText: {
    paddingHorizontal: 16,
    color: '#B7B7B7',
    fontSize: 12,
    textAlign: 'right',
  },
  addAllTextTablet: {
    paddingHorizontal: 40,
    fontSize: 16,
  },
  footer: {
    gap: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
    backgroundColor: '#333333',
  },
  footerImage: {
    width: '100%',
    height: 736,
  },
  footerImageTablet: {
    height: 731,
  },
  footerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerBrand: {
    width: 148,
    gap: 8,
  },
  footerLogo: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF2C5A',
    color: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '900',
  },
  footerCompany: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 12,
    fontWeight: '600',
  },
  snsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  snsCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLinks: {
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  footerLink: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  footerInfo: {
    gap: 20,
  },
  footerText: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 20,
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
