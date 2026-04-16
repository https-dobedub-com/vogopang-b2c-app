import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppModeProvider } from '../src/features/mode/context/AppModeProvider';
import { queryClient } from '../src/lib/queryClient';

export default function RootLayout() {
  return (
    <AppModeProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="book/[id]" options={{ title: '도서 상세' }} />
          <Stack.Screen name="guardian/index" options={{ title: '보호자용' }} />
          <Stack.Screen name="kids/index" options={{ title: '키즈모드' }} />
        </Stack>
      </QueryClientProvider>
    </AppModeProvider>
  );
}
