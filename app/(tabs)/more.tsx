import { StyleSheet, Text, View } from 'react-native';

export default function MoreScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>보호자용</Text>
      <Text style={styles.text}>계정, 공지, 설정, 고객지원 같은 메뉴를 배치할 예정입니다.</Text>
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
    lineHeight: 20,
  },
});
