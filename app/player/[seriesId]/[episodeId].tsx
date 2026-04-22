import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getSamplePlayerInfo } from '../../../src/features/player/api/getSamplePlayerInfo';
import { PlayerScreen } from '../../../src/features/player/components/PlayerScreen';

export default function PlayerRouteScreen() {
  const { seriesId, episodeId } = useLocalSearchParams<{ seriesId: string; episodeId: string }>();
  const numericSeriesId = Number(seriesId);
  const numericEpisodeId = Number(episodeId);
  const resolvedSeriesId = Number.isFinite(numericSeriesId) ? numericSeriesId : 101;
  const resolvedEpisodeId = Number.isFinite(numericEpisodeId) ? numericEpisodeId : 781;

  const playerQuery = useQuery({
    queryKey: ['sample-player-info', resolvedSeriesId, resolvedEpisodeId],
    queryFn: () => getSamplePlayerInfo(resolvedSeriesId, resolvedEpisodeId),
  });

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
  text: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
