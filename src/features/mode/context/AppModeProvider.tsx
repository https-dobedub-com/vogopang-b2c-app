import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type AppMode = 'kids' | 'guardian';

type AppModeContextValue = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isKidsMode: boolean;
  isGuardianMode: boolean;
};

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<AppMode>('kids');

  const value = useMemo<AppModeContextValue>(
    () => ({
      mode,
      setMode,
      isKidsMode: mode === 'kids',
      isGuardianMode: mode === 'guardian',
    }),
    [mode],
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
