import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

export default function MoreScreen() {
  const { mode, enterKidsMode, isGuardianMode, isGuardianUnlocked } = useAppMode();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>모드 전환</Text>
      <Text style={styles.text}>보호자 모드 진입은 PIN 인증이 필요합니다.</Text>

      <View style={styles.modeRow}>
        <Pressable style={styles.modeButtonKids} onPress={enterKidsMode}>
          <Text style={styles.modeButtonKidsText}>키즈모드로 전환</Text>
        </Pressable>
        <Pressable style={styles.modeButtonGuardian} onPress={() => router.push('/guardian/unlock')}>
          <Text style={styles.modeButtonGuardianText}>보호자 PIN 인증</Text>
        </Pressable>
      </View>

      <Text style={styles.current}>현재 모드: {mode === 'kids' ? '키즈모드' : '보호자용'}</Text>

      <Link href="/kids" style={styles.linkButton}>
        키즈 전용 화면으로 이동
      </Link>
      <Link href={isGuardianUnlocked ? '/guardian' : '/guardian/unlock'} style={styles.linkButtonSecondary}>
        보호자 전용 화면으로 이동
      </Link>

      <View style={styles.guardianMenuBox}>
        <Text style={styles.guardianMenuTitle}>보호자 전용 메뉴</Text>
        {isGuardianMode && isGuardianUnlocked ? (
          <View style={styles.guardianMenuList}>
            <Text style={styles.guardianMenuItem}>- 학습 리포트 보기</Text>
            <Text style={styles.guardianMenuItem}>- 이용 시간 관리</Text>
            <Text style={styles.guardianMenuItem}>- 결제 / 구독 관리</Text>
          </View>
        ) : (
          <Text style={styles.guardianMenuLocked}>PIN 인증 전에는 보호자 전용 메뉴가 숨겨집니다.</Text>
        )}
      </View>
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
  text: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modeButtonKids: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonKidsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  modeButtonGuardian: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#111827',
    backgroundColor: '#111827',
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonGuardianText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  current: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  linkButton: {
    borderRadius: 12,
    backgroundColor: '#111827',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '700',
  },
  linkButtonSecondary: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    color: '#0F172A',
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '700',
    backgroundColor: '#FFFFFF',
  },
  guardianMenuBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  guardianMenuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  guardianMenuList: {
    gap: 6,
  },
  guardianMenuItem: {
    fontSize: 13,
    color: '#334155',
  },
  guardianMenuLocked: {
    fontSize: 13,
    color: '#64748B',
  },
});
