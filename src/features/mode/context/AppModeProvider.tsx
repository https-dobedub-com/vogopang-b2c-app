import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type AppMode = 'kids' | 'guardian';

const APP_MODE_STORAGE_KEY = 'vogopang:app-mode';
const GUARDIAN_PIN = '0420';

type AppModeContextValue = {
  mode: AppMode;
  isKidsMode: boolean;
  isGuardianMode: boolean;
  isGuardianUnlocked: boolean;
  isHydrated: boolean;
  enterKidsMode: () => void;
  requestGuardianAccess: (pin: string) => boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<AppMode>('kids');
  const [isGuardianUnlocked, setIsGuardianUnlocked] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateMode() {
      try {
        const storedMode = await AsyncStorage.getItem(APP_MODE_STORAGE_KEY);
        if (storedMode === 'kids' || storedMode === 'guardian') {
          if (isMounted) {
            setModeState(storedMode);
          }
        }
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateMode();

    return () => {
      isMounted = false;
    };
  }, []);

  const enterKidsMode = useCallback(() => {
    setModeState('kids');
    setIsGuardianUnlocked(false);
    void AsyncStorage.setItem(APP_MODE_STORAGE_KEY, 'kids');
  }, []);

  const requestGuardianAccess = useCallback((pin: string) => {
    const normalizedPin = pin.trim();
    const isValid = normalizedPin === GUARDIAN_PIN;

    if (isValid) {
      setModeState('guardian');
      setIsGuardianUnlocked(true);
      void AsyncStorage.setItem(APP_MODE_STORAGE_KEY, 'guardian');
      return true;
    }

    return false;
  }, []);

  const value = useMemo<AppModeContextValue>(
    () => ({
      mode,
      isKidsMode: mode === 'kids',
      isGuardianMode: mode === 'guardian',
      isGuardianUnlocked,
      isHydrated,
      enterKidsMode,
      requestGuardianAccess,
    }),
    [mode, isGuardianUnlocked, isHydrated, enterKidsMode, requestGuardianAccess],
  );

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}
