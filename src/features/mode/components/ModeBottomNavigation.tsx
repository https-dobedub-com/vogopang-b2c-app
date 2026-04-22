import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppMode } from '../context/AppModeProvider';

type ModeBottomNavigationProps = {
  isTablet: boolean;
};

export function ModeBottomNavigation({ isTablet }: ModeBottomNavigationProps) {
  const router = useRouter();
  const { enterKidsMode, isGuardianMode, isGuardianUnlocked, isKidsMode } = useAppMode();

  const handleKidsModePress = () => {
    enterKidsMode();
    router.replace('/');
  };

  const handleGuardianModePress = () => {
    router.push(isGuardianUnlocked ? '/guardian' : '/guardian/unlock');
  };

  return (
    <View style={[styles.bottomNav, isTablet ? styles.bottomNavTablet : null]}>
      <Pressable
        style={styles.bottomNavItem}
        accessibilityRole="button"
        accessibilityState={{ selected: isKidsMode }}
        onPress={handleKidsModePress}
      >
        <Ionicons name="albums-outline" size={isTablet ? 36 : 24} color={isKidsMode ? '#6503F8' : '#2C2C2C'} />
        <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null, isKidsMode ? styles.bottomNavTextActive : null]}>
          키즈모드
        </Text>
      </Pressable>

      <Pressable
        style={styles.bottomNavItem}
        accessibilityRole="button"
        accessibilityState={{ selected: isGuardianMode }}
        onPress={handleGuardianModePress}
      >
        <Ionicons name="grid-outline" size={isTablet ? 36 : 24} color={isGuardianMode ? '#6503F8' : '#000000'} />
        <Text style={[styles.bottomNavText, isTablet ? styles.bottomNavTextTablet : null, isGuardianMode ? styles.bottomNavTextActive : null]}>
          보호자용
        </Text>
      </Pressable>

      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 89,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    paddingTop: 8,
  },
  bottomNavTablet: {
    height: 134,
    paddingHorizontal: 180,
    paddingTop: 16,
  },
  bottomNavItem: {
    width: 52,
    alignItems: 'center',
    gap: 2,
  },
  bottomNavText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomNavTextActive: {
    color: '#6503F8',
    fontWeight: '700',
  },
  bottomNavTextTablet: {
    fontSize: 16,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    width: 140,
    height: 5,
    marginLeft: -70,
    borderRadius: 3,
    backgroundColor: '#5C5C5C',
  },
});
