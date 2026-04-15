import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>도서 검색</Text>
      <TextInput
        placeholder="도서명 또는 작가명을 입력하세요"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
      <Text style={styles.caption}>검색 결과 / 결과 없음 화면은 다음 단계에서 API 연동과 함께 구현합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
});
