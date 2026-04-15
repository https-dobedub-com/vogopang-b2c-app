import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: '도서 상세' }} />
      <Text style={styles.title}>도서 상세 화면</Text>
      <Text style={styles.text}>book id: {id}</Text>
      <Text style={styles.text}>다음 단계에서 API 연동과 실제 메타데이터 카드로 대체합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
