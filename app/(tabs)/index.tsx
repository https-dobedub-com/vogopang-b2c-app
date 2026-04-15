import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  { title: '메인 배너', description: '이번 주 추천 도서를 배너로 노출합니다.' },
  { title: '신규 도서', description: '최근 등록된 도서 카드 목록입니다.' },
  { title: '추천 도서', description: '연령/주제 기반 추천 목록입니다.' },
  { title: '이벤트', description: '프로모션 및 기획전 영역입니다.' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>보고팡 B2C 홈</Text>
      <Text style={styles.subtitle}>피그마 구조를 기준으로 초기 홈 섹션 골격을 잡아둔 상태입니다.</Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardText}>{section.description}</Text>
        </View>
      ))}

      <Link href="/book/sample-001" style={styles.cta}>
        도서 상세 샘플로 이동
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
  },
  cta: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
