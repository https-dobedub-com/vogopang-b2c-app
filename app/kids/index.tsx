import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

export default function KidsScreen() {
  const { isKidsMode } = useAppMode();

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
