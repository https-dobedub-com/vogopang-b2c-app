import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Image, type ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModeBottomNavigation } from '../../src/features/mode/components/ModeBottomNavigation';

type EventBanner = {
  id: string;
  image: ImageSourcePropType;
};

const HOME_ASSETS = {
  logo: require('../../assets/figma/home/logo.png'),
  footer: require('../../assets/figma/home/footer.png'),
  footerTablet: require('../../assets/figma/tablet/footer.png'),
};

const EVENT_ASSETS = {
  event01: require('../../assets/figma/events/event-01.png'),
  event02: require('../../assets/figma/events/event-02.png'),
  event03: require('../../assets/figma/events/event-03.png'),
  event04: require('../../assets/figma/events/event-04.png'),
  event05: require('../../assets/figma/events/event-05.png'),
  event06: require('../../assets/figma/events/event-06.png'),
  event07Ended: require('../../assets/figma/events/event-07-ended.png'),
};

const EVENTS: EventBanner[] = [
  { id: 'event-01', image: EVENT_ASSETS.event01 },
  { id: 'event-02', image: EVENT_ASSETS.event02 },
  { id: 'event-03', image: EVENT_ASSETS.event03 },
  { id: 'event-04', image: EVENT_ASSETS.event04 },
  { id: 'event-05', image: EVENT_ASSETS.event05 },
  { id: 'event-06', image: EVENT_ASSETS.event06 },
  { id: 'event-07-ended', image: EVENT_ASSETS.event07Ended },
];

const TABLET_BREAKPOINT = 768;

export default function EventsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;

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
          <Link href="/search" asChild>
            <Pressable accessibilityRole="button">
              <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null]}>전체 도서</Text>
            </Pressable>
          </Link>
          <Text style={[styles.topMenuText, isTablet ? styles.topMenuTextTablet : null, styles.topMenuTextActive]}>이벤트</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, isTablet ? styles.scrollContentTablet : null]} showsVerticalScrollIndicator={false}>
          <Text style={[styles.pageTitle, isTablet ? styles.pageTitleTablet : null]}>이벤트</Text>

          <View style={[styles.eventList, isTablet ? styles.eventListTablet : null]}>
            {EVENTS.map((event) => (
              <Pressable key={event.id} style={[styles.eventCard, isTablet ? styles.eventCardTablet : null]} accessibilityRole="button">
                <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
              </Pressable>
            ))}
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
  pageTitle: {
    paddingHorizontal: 16,
    color: '#000000',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  pageTitleTablet: {
    paddingHorizontal: 40,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: 1.28,
  },
  eventList: {
    marginTop: 17,
    paddingHorizontal: 16,
    gap: 16,
  },
  eventListTablet: {
    marginTop: 20,
    paddingHorizontal: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 20,
  },
  eventCard: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
  },
  eventCardTablet: {
    width: 462,
    height: 230,
  },
  eventImage: {
    width: '100%',
    height: '100%',
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
