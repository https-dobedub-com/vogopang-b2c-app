import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

export default function KidsScreen() {
  const { isKidsMode, isHydrated } = useAppMode();

  if (!isHydrated) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color="#2563EB" />
        <Text style={styles.loadingText}>모드 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!isKidsMode) {
    return <Redirect href="/guardian" />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>키즈모드 화면</Text>
      <Text style={styles.text}>아이용 콘텐츠 탐색, 배너, 추천 카드 중심 경험이 들어갈 자리입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
});
