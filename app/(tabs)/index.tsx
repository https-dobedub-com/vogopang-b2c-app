import { Link } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HomeSectionCard } from '../../src/features/home/components/HomeSectionCard';
import { useHomeFeedQuery } from '../../src/features/home/hooks/useHomeFeedQuery';

export default function HomeScreen() {
  const homeFeedQuery = useHomeFeedQuery();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>보고팡 B2C 홈</Text>
      <Text style={styles.subtitle}>피그마 기준 섹션 컴포넌트와 데이터 레이어를 연결한 초기 상태입니다.</Text>

      {homeFeedQuery.isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>홈 데이터를 불러오는 중...</Text>
        </View>
      ) : null}

      {homeFeedQuery.isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</Text>
        </View>
      ) : null}

      {homeFeedQuery.data?.sections.map((section) => (
        <HomeSectionCard key={section.id} title={section.title} description={section.description} />
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
  loadingBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#1D4ED8',
    fontSize: 13,
  },
  errorBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 13,
    lineHeight: 18,
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
