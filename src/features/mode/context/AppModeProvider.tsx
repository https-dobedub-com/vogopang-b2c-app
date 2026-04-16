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

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isKidsMode: boolean;
  isGuardianMode: boolean;
  isHydrated: boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<AppMode>('kids');
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

  const setMode = useCallback((nextMode: AppMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(APP_MODE_STORAGE_KEY, nextMode);
  }, []);

  const value = useMemo<AppModeContextValue>(
    () => ({
      mode,
      setMode,
      isKidsMode: mode === 'kids',
      isGuardianMode: mode === 'guardian',
      isHydrated,
    }),
    [mode, setMode, isHydrated],
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
