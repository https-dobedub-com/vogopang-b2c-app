import { StyleSheet, Text, View } from 'react-native';

export default function LibraryScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>읽기 목록</Text>
      <Text style={styles.text}>저장한 도서를 모아보는 영역입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  text: {
    color: '#64748B',
    fontSize: 14,
  },
});
