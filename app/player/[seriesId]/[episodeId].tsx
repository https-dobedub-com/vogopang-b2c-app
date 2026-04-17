import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getSamplePlayerInfo } from '../../../src/features/player/api/getSamplePlayerInfo';
import { PlayerScreen } from '../../../src/features/player/components/PlayerScreen';

export default function PlayerRouteScreen() {
  const { seriesId, episodeId } = useLocalSearchParams<{ seriesId: string; episodeId: string }>();
  const numericSeriesId = Number(seriesId);
  const numericEpisodeId = Number(episodeId);
  const canLoad = Number.isFinite(numericSeriesId) && Number.isFinite(numericEpisodeId);

  const playerQuery = useQuery({
    queryKey: ['sample-player-info', numericSeriesId, numericEpisodeId],
    queryFn: () => getSamplePlayerInfo(numericSeriesId, numericEpisodeId),
    enabled: canLoad,
  });

  if (!canLoad) {
    return (
      <View style={styles.centerScreen}>
        <Stack.Screen options={{ title: '플레이어' }} />
        <Text style={styles.title}>플레이어 경로가 올바르지 않습니다.</Text>
        <Text style={styles.text}>예시 경로는 /player/101/777 입니다.</Text>
      </View>
    );
  }

  if (playerQuery.isLoading || !playerQuery.data) {
    return (
      <View style={styles.centerScreen}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color="#2563EB" />
        <Text style={styles.text}>플레이어 데이터를 준비하는 중...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PlayerScreen playerInfo={playerQuery.data} />
    </>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  text: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
