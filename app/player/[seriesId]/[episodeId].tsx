import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getSamplePlayerInfo } from '../../../src/features/player/api/getSamplePlayerInfo';
import { PlayerScreen } from '../../../src/features/player/components/PlayerScreen';
import { queryKeys } from '../../../src/lib/queryKeys';

export default function PlayerRouteScreen() {
  const { seriesId, episodeId } = useLocalSearchParams<{ seriesId: string; episodeId: string }>();
  const numericSeriesId = Number(seriesId);
  const numericEpisodeId = Number(episodeId);
  const resolvedSeriesId = Number.isFinite(numericSeriesId) ? numericSeriesId : 101;
  const resolvedEpisodeId = Number.isFinite(numericEpisodeId) ? numericEpisodeId : 781;

  const playerQuery = useQuery({
    queryKey: queryKeys.playerInfo(resolvedSeriesId, resolvedEpisodeId),
    queryFn: () => getSamplePlayerInfo(resolvedSeriesId, resolvedEpisodeId),
  });

  if (playerQuery.isError) {
    return (
      <View style={styles.centerScreen}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.title}>플레이어 데이터를 불러오지 못했습니다.</Text>
        <Text style={styles.text}>네트워크 상태를 확인한 뒤 다시 시도해주세요.</Text>
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
  text: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
});
