import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppMode } from '../../src/features/mode/context/AppModeProvider';
import { useAppMode } from '../../src/features/mode/context/AppModeProvider';

export default function MoreScreen() {
  const { mode, setMode, isGuardianMode } = useAppMode();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>모드 전환</Text>
      <Text style={styles.text}>현재 모드에 따라 접근 가능한 전용 화면과 메뉴가 분기됩니다.</Text>

      <View style={styles.modeRow}>
        <ModeButton mode="kids" currentMode={mode} onPress={setMode} label="키즈모드" />
        <ModeButton mode="guardian" currentMode={mode} onPress={setMode} label="보호자용" />
      </View>

      <Text style={styles.current}>현재 모드: {mode === 'kids' ? '키즈모드' : '보호자용'}</Text>

      <Link href="/kids" style={styles.linkButton}>
        키즈 전용 화면으로 이동
      </Link>
      <Link href="/guardian" style={styles.linkButtonSecondary}>
        보호자 전용 화면으로 이동
      </Link>

      <View style={styles.guardianMenuBox}>
        <Text style={styles.guardianMenuTitle}>보호자 전용 메뉴</Text>
        {isGuardianMode ? (
          <View style={styles.guardianMenuList}>
            <Text style={styles.guardianMenuItem}>- 학습 리포트 보기</Text>
            <Text style={styles.guardianMenuItem}>- 이용 시간 관리</Text>
            <Text style={styles.guardianMenuItem}>- 결제 / 구독 관리</Text>
          </View>
        ) : (
          <Text style={styles.guardianMenuLocked}>키즈모드에서는 보호자 전용 메뉴가 숨겨집니다.</Text>
        )}
      </View>
    </View>
  );
}

type ModeButtonProps = {
  mode: AppMode;
  currentMode: AppMode;
  onPress: (mode: AppMode) => void;
  label: string;
};

function ModeButton({ mode, currentMode, onPress, label }: ModeButtonProps) {
  const isActive = mode === currentMode;

  return (
    <Pressable
      onPress={() => onPress(mode)}
      style={[styles.modeButton, isActive ? styles.modeButtonActive : styles.modeButtonInactive]}
    >
      <Text style={[styles.modeButtonText, isActive ? styles.modeButtonTextActive : styles.modeButtonTextInactive]}>
        {label}
      </Text>
    </Pressable>
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
  modeButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modeButtonInactive: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#1D4ED8',
  },
  modeButtonTextInactive: {
    color: '#475569',
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
