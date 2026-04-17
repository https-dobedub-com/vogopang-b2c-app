import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NormalizedPlayerInfo } from '../types/playerInfo';
import { RemoteToonImage } from './RemoteToonImage';

type PlayerScreenProps = {
  playerInfo: NormalizedPlayerInfo;
};

const BASE_CONTENT_WIDTH = 720;

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function PlayerScreen({ playerInfo }: PlayerScreenProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeSpointIndex, setActiveSpointIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasWidth = Math.min(width - 32, 430);
  const topScale = canvasWidth / BASE_CONTENT_WIDTH;
  const activeSpoint = playerInfo.content.spoints[activeSpointIndex];
  const activeCue = useMemo(() => {
    return (
      [...playerInfo.voiceCues].reverse().find((cue) => cue.startMs <= elapsedMs) ??
      playerInfo.voiceCues[0]
    );
  }, [elapsedMs, playerInfo.voiceCues]);

  const progressLabel = `${formatTime(elapsedMs)} / ${formatTime(playerInfo.totalDurationMs)}`;

  useEffect(() => {
    if (!isPlaying) return undefined;

    const intervalId = setInterval(() => {
      setElapsedMs((currentMs) => {
        const nextMs = Math.min(currentMs + 250, playerInfo.totalDurationMs);

        if (nextMs >= playerInfo.totalDurationMs) {
          setIsPlaying(false);
        }

        return nextMs;
      });
    }, 250);

    return () => clearInterval(intervalId);
  }, [isPlaying, playerInfo.totalDurationMs]);

  useEffect(() => {
    if (!isPlaying || playerInfo.content.spoints.length === 0) return;

    let nextIndex = 0;
    for (let index = 0; index < playerInfo.content.spoints.length; index += 1) {
      if (playerInfo.content.spoints[index].time_ms <= elapsedMs) {
        nextIndex = index;
      }
    }

    if (nextIndex !== activeSpointIndex) {
      const nextSpoint = playerInfo.content.spoints[nextIndex];
      setActiveSpointIndex(nextIndex);
      scrollRef.current?.scrollTo({
        y: Math.max(0, nextSpoint.top * topScale - 24),
        animated: true,
      });
    }
  }, [activeSpointIndex, elapsedMs, isPlaying, playerInfo.content.spoints, topScale]);

  function jumpToSpoint(index: number) {
    const nextIndex = Math.max(0, Math.min(index, playerInfo.content.spoints.length - 1));
    const nextSpoint = playerInfo.content.spoints[nextIndex];

    if (!nextSpoint) return;

    setActiveSpointIndex(nextIndex);
    setElapsedMs(nextSpoint.time_ms);
    scrollRef.current?.scrollTo({
      y: Math.max(0, nextSpoint.top * topScale - 24),
      animated: true,
    });
  }

  function togglePlayback() {
    if (elapsedMs >= playerInfo.totalDurationMs) {
      setElapsedMs(0);
      jumpToSpoint(0);
    }

    setIsPlaying((current) => !current);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (isPlaying) return;

    const mappedTop = event.nativeEvent.contentOffset.y / topScale;
    let nextIndex = 0;

    for (let index = 0; index < playerInfo.content.spoints.length; index += 1) {
      if (playerInfo.content.spoints[index].top <= mappedTop + 80) {
        nextIndex = index;
      }
    }

    if (nextIndex !== activeSpointIndex) {
      const nextSpoint = playerInfo.content.spoints[nextIndex];
      setActiveSpointIndex(nextIndex);
      if (nextSpoint) {
        setElapsedMs(nextSpoint.time_ms);
      }
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.eyebrow}>보고팡 플레이어 MVP</Text>
          <Text style={styles.title}>{playerInfo.episode.seriesName}</Text>
          <Text style={styles.subtitle}>
            {playerInfo.episode.chapter}화 · {playerInfo.episode.title} · 조회 {playerInfo.episode.viewCount}
          </Text>
        </View>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </Pressable>
      </View>

      <View style={styles.episodeRail}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodeRailContent}>
          {playerInfo.episodes.map((episode) => {
            const isActive = episode.id === playerInfo.episode.id;

            return (
              <Pressable
                key={episode.id}
                style={[styles.episodePill, isActive ? styles.episodePillActive : null]}
                onPress={() => router.push(`/player/${playerInfo.episode.seriesId}/${episode.id}`)}
              >
                <Text style={[styles.episodePillText, isActive ? styles.episodePillTextActive : null]}>
                  {episode.chapter}화
                </Text>
                {episode.isRecording ? <Text style={styles.recordingDot}>녹음</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.viewer}
        contentContainerStyle={styles.viewerContent}
        onScroll={handleScroll}
        scrollEventThrottle={80}
      >
        <View style={[styles.canvas, { width: canvasWidth }]}>
          {playerInfo.content.images.map((image, index) => (
            <RemoteToonImage key={image.uuid} image={image} index={index} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomChrome}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>{progressLabel}</Text>
          <Text style={styles.timelineMeta}>
            포인트 {Math.min(activeSpointIndex + 1, playerInfo.content.spoints.length)} /{' '}
            {playerInfo.content.spoints.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  playerInfo.content.spoints.length > 1
                    ? (activeSpointIndex / (playerInfo.content.spoints.length - 1)) * 100
                    : 0
                }%`,
              },
            ]}
          />
        </View>

        <Text style={styles.scriptText} numberOfLines={2}>
          {activeCue?.script ?? '현재 재생 지점에 연결된 대사가 없습니다.'}
        </Text>

        <View style={styles.controlRow}>
          <Pressable style={styles.controlButton} onPress={() => jumpToSpoint(activeSpointIndex - 1)}>
            <Text style={styles.controlButtonText}>이전</Text>
          </Pressable>
          <Pressable style={styles.playButton} onPress={togglePlayback}>
            <Text style={styles.playButtonText}>{isPlaying ? '일시정지' : '재생'}</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => jumpToSpoint(activeSpointIndex + 1)}>
            <Text style={styles.controlButtonText}>다음</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.18)',
  },
  headerTitleGroup: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    borderRadius: 999,
    backgroundColor: 'rgba(248, 250, 252, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  closeButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
  },
  episodeRail: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.16)',
  },
  episodeRailContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  episodePill: {
    minWidth: 62,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 11,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 3,
  },
  episodePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  episodePillText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  episodePillTextActive: {
    color: '#FFFFFF',
  },
  recordingDot: {
    color: '#BFDBFE',
    fontSize: 9,
    fontWeight: '800',
  },
  viewer: {
    flex: 1,
  },
  viewerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 190,
  },
  canvas: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.12)',
  },
  bottomChrome: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    padding: 14,
    gap: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  timelineMeta: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.24)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#3B82F6',
  },
  scriptText: {
    minHeight: 36,
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
    paddingVertical: 11,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '800',
  },
  playButton: {
    flex: 1.4,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 11,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
