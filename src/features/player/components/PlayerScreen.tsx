import Ionicons from '@expo/vector-icons/Ionicons';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
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

import type { NormalizedPlayerInfo, PlayerAudioClip, PlayerVoiceCue } from '../types/playerInfo';

type PlayerScreenProps = {
  playerInfo: NormalizedPlayerInfo;
};

type VoiceMode = 'my' | 'original';

const PLAYER_WIDTH = 393;
const WEBTOON_ASPECT_RATIO = 1049 / 4096;
const CONTROLLER_BOTTOM_HEIGHT = 54;
const CONTROLLER_PLAY_HEIGHT = 164;
const CONTROLLER_RECORD_HEIGHT = 209;
const FIGMA_PLAYER_ASSETS = {
  webtoon: require('../../../../assets/figma/player/webtoon.jpg'),
  recordScene: require('../../../../assets/figma/player/record-scene.png'),
};
const AUDIO_SYNC_DRIFT_SECONDS = 0.8;

const RECORD_LINES = [
  {
    label: '대사 01',
    speaker: '나레이션',
    script: ['모든 신과 인간의 근원인 가이아는 우라노스와 결합하여', '몸집이 커다란 여섯 명의 아들과 여섯 명의 딸을 낳았다.'],
  },
  {
    label: '대사 02',
    speaker: '티탄',
    script: ['너희들이 부디 만물과 조화를 이루어 세상을 평화롭게 해야 할 텐데..'],
  },
  {
    label: '대사 03',
    speaker: '우라노스',
    script: ['여기에 날 낳아준 감사의 뜻으로 비를 내리나니', '부디 세상을 가득 채워 주소서!'],
    expanded: true,
  },
  {
    label: '대사 04',
    speaker: '나레이션',
    script: ['대지의 여신 가이아는 홀로 하늘과 산과 바다를 낳아 자연의 질서를 이루었다.'],
  },
];

function formatChapter(chapter: number | string) {
  return `${chapter}화`;
}

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length - 1));
}

function getAudioSourceUrl(source: { url?: string; src?: string }) {
  return source.url ?? source.src ?? '';
}

function getPlaybackOffsetSeconds(elapsedMs: number, startMs: number) {
  return Math.max(0, (elapsedMs - startMs) / 1000);
}

function createPlayer(src: string, volume = 1) {
  const player = createAudioPlayer({ uri: src }, { updateInterval: 250, keepAudioSessionActive: true });
  player.volume = Math.max(0, Math.min(1, volume));
  player.loop = false;

  return player;
}

function pauseAudio(player: AudioPlayer | null) {
  if (!player) return;
  player.pause();
}

function removeAudio(player: AudioPlayer | null) {
  if (!player) return;
  player.pause();
  player.remove();
}

function seekAudio(player: AudioPlayer, seconds: number) {
  void player.seekTo(seconds).catch((error: unknown) => {
    console.warn('[PlayerScreen] Audio seek failed', error);
  });
}

function findActiveVoiceCue(voiceCues: PlayerVoiceCue[], elapsedMs: number) {
  return voiceCues.find((cue) => elapsedMs >= cue.startMs && elapsedMs < cue.startMs + cue.durationMs) ?? null;
}

function findActiveAudioClip(clips: PlayerAudioClip[], elapsedMs: number) {
  return clips.find((clip) => elapsedMs >= clip.start_ms && elapsedMs < clip.start_ms + clip.duration_ms) ?? null;
}

function RecordMarker({ wide = false }: { wide?: boolean }) {
  return (
    <View style={[styles.recordMarker, wide ? styles.recordMarkerWide : null]}>
      <Ionicons name="mic" size={14} color="#FFFFFF" />
      <View style={styles.recordMarkerTail} />
    </View>
  );
}

type SegmentProps = {
  isActive: boolean;
  label: string;
  mode: VoiceMode;
  onPress: (mode: VoiceMode) => void;
};

function VoiceSegment({ isActive, label, mode, onPress }: SegmentProps) {
  const activeStyle = mode === 'my' ? styles.voiceSegmentMyActive : styles.voiceSegmentOriginalActive;

  return (
    <Pressable style={[styles.voiceSegment, isActive ? activeStyle : null]} onPress={() => onPress(mode)}>
      <Text style={[styles.voiceSegmentText, isActive ? styles.voiceSegmentTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function PlayerScreen({ playerInfo }: PlayerScreenProps) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [activeSpointIndex, setActiveSpointIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('original');
  const [isMuted, setIsMuted] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const backgroundAudioRef = useRef<{ clipId: string; audio: AudioPlayer } | null>(null);
  const voiceAudioRef = useRef<{ cueId: string; audio: AudioPlayer } | null>(null);
  const frameWidth = Math.min(width, PLAYER_WIDTH);
  const webtoonHeight = frameWidth / WEBTOON_ASPECT_RATIO;
  const showRecordMarkers = voiceMode === 'my';
  const controllerHeight = showRecordMarkers ? CONTROLLER_RECORD_HEIGHT : CONTROLLER_PLAY_HEIGHT;
  const contentBottomPadding = controllerHeight + CONTROLLER_BOTTOM_HEIGHT + 12;
  const backgroundClips = useMemo(
    () =>
      (playerInfo.content.audio_tracks ?? [])
        .flatMap((track) => track.clips)
        .filter((clip) => getAudioSourceUrl(clip))
        .sort((a, b) => a.start_ms - b.start_ms),
    [playerInfo.content.audio_tracks],
  );
  const activeVoiceCue = useMemo(
    () => findActiveVoiceCue(playerInfo.voiceCues, elapsedMs),
    [elapsedMs, playerInfo.voiceCues],
  );
  const activeBackgroundClip = useMemo(
    () => findActiveAudioClip(backgroundClips, elapsedMs),
    [backgroundClips, elapsedMs],
  );
  const shouldPlayOriginalAudio = isPlaying && !isMuted && voiceMode === 'original';

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch((error: unknown) => {
      console.warn('[PlayerScreen] Audio mode setup failed', error);
    });
  }, []);

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
      const nextTop = webtoonHeight * (nextIndex / Math.max(1, playerInfo.content.spoints.length));
      setActiveSpointIndex(nextIndex);
      scrollRef.current?.scrollTo({ y: Math.max(0, nextTop - 12), animated: true });
    }
  }, [activeSpointIndex, elapsedMs, isPlaying, playerInfo.content.spoints, webtoonHeight]);

  useEffect(() => {
    return () => {
      removeAudio(backgroundAudioRef.current?.audio ?? null);
      removeAudio(voiceAudioRef.current?.audio ?? null);
      backgroundAudioRef.current = null;
      voiceAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    function playAudio(audio: AudioPlayer) {
      if (!audio.paused) return;

      try {
        audio.play();
      } catch (error) {
        console.warn('[PlayerScreen] Audio playback failed', error);
      }
    }

    if (!shouldPlayOriginalAudio) {
      pauseAudio(backgroundAudioRef.current?.audio ?? null);
      pauseAudio(voiceAudioRef.current?.audio ?? null);
      return;
    }

    if (!activeBackgroundClip) {
      removeAudio(backgroundAudioRef.current?.audio ?? null);
      backgroundAudioRef.current = null;
    } else {
      const backgroundUrl = getAudioSourceUrl(activeBackgroundClip);
      const currentBackground = backgroundAudioRef.current;
      const hasSameBackground = currentBackground?.clipId === activeBackgroundClip.uuid;
      const backgroundAudio = hasSameBackground
        ? currentBackground.audio
        : createPlayer(backgroundUrl, activeBackgroundClip.volume);
      const nextOffsetSeconds = getPlaybackOffsetSeconds(elapsedMs, activeBackgroundClip.start_ms);

      if (!hasSameBackground) {
        removeAudio(currentBackground?.audio ?? null);
        backgroundAudioRef.current = { clipId: activeBackgroundClip.uuid, audio: backgroundAudio };
      }

      backgroundAudio.muted = isMuted;
      backgroundAudio.volume = Math.max(0, Math.min(1, activeBackgroundClip.volume));

      if (!hasSameBackground || Math.abs(backgroundAudio.currentTime - nextOffsetSeconds) > AUDIO_SYNC_DRIFT_SECONDS) {
        seekAudio(backgroundAudio, nextOffsetSeconds);
      }

      playAudio(backgroundAudio);
    }

    if (!activeVoiceCue) {
      removeAudio(voiceAudioRef.current?.audio ?? null);
      voiceAudioRef.current = null;
      return;
    }

    const currentVoice = voiceAudioRef.current;
    const hasSameVoiceCue = currentVoice?.cueId === activeVoiceCue.id;
    const voiceAudio = hasSameVoiceCue
      ? currentVoice.audio
      : createPlayer(activeVoiceCue.audioUrl);
    const nextVoiceOffsetSeconds = getPlaybackOffsetSeconds(elapsedMs, activeVoiceCue.startMs);

    if (!hasSameVoiceCue) {
      removeAudio(currentVoice?.audio ?? null);
      voiceAudioRef.current = { cueId: activeVoiceCue.id, audio: voiceAudio };
    }

    voiceAudio.muted = isMuted;

    if (!hasSameVoiceCue || Math.abs(voiceAudio.currentTime - nextVoiceOffsetSeconds) > AUDIO_SYNC_DRIFT_SECONDS) {
      seekAudio(voiceAudio, nextVoiceOffsetSeconds);
    }

    playAudio(voiceAudio);
  }, [activeBackgroundClip, activeVoiceCue, elapsedMs, isMuted, shouldPlayOriginalAudio]);

  function jumpToSpoint(index: number) {
    if (playerInfo.content.spoints.length === 0) return;

    const nextIndex = clampIndex(index, playerInfo.content.spoints.length);
    const nextSpoint = playerInfo.content.spoints[nextIndex];
    const nextTop = webtoonHeight * (nextIndex / Math.max(1, playerInfo.content.spoints.length));

    setActiveSpointIndex(nextIndex);
    setElapsedMs(nextSpoint.time_ms);
    scrollRef.current?.scrollTo({ y: Math.max(0, nextTop - 12), animated: true });
  }

  function togglePlayback() {
    if (elapsedMs >= playerInfo.totalDurationMs) {
      setElapsedMs(0);
      jumpToSpoint(0);
    }

    setIsPlaying((current) => !current);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (isPlaying || playerInfo.content.spoints.length === 0) return;

    const nextIndex = clampIndex(
      Math.floor((event.nativeEvent.contentOffset.y / Math.max(1, webtoonHeight)) * playerInfo.content.spoints.length),
      playerInfo.content.spoints.length,
    );

    if (nextIndex !== activeSpointIndex) {
      setActiveSpointIndex(nextIndex);
      setElapsedMs(playerInfo.content.spoints[nextIndex]?.time_ms ?? 0);
    }
  }

  function openRecordModal() {
    setVoiceMode('my');
    setIsRecordModalOpen(true);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={[styles.playerFrame, { width: frameWidth }]}>
        <View style={styles.header}>
          <Pressable style={styles.headerLeft} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#333333" />
            <Text style={styles.headerChapter}>{formatChapter(playerInfo.episode.chapter)}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {playerInfo.episode.title}
            </Text>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color="#333333" />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.viewer}
          contentContainerStyle={[styles.viewerContent, { paddingBottom: contentBottomPadding }]}
          onScroll={handleScroll}
          scrollEventThrottle={80}
        >
          <Image
            source={FIGMA_PLAYER_ASSETS.webtoon}
            style={[styles.webtoonImage, { height: webtoonHeight }]}
            resizeMode="cover"
          />
        </ScrollView>

        <View style={[styles.controller, { bottom: CONTROLLER_BOTTOM_HEIGHT }]}>
          <View style={styles.mainControls}>
            <View style={styles.mainControlsLeft}>
              <Pressable style={styles.playButton} onPress={togglePlayback}>
                <View style={styles.playIconFrame}>
                  <Ionicons name={isPlaying ? 'pause-outline' : 'play-outline'} size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.playButtonText}>{isPlaying ? '일시정지' : '재생하기'}</Text>
              </Pressable>

              <View style={styles.voiceSwitch}>
                <VoiceSegment
                  isActive={voiceMode === 'my'}
                  label="마이보이스"
                  mode="my"
                  onPress={(mode) => setVoiceMode(mode)}
                />
                <VoiceSegment
                  isActive={voiceMode === 'original'}
                  label="오리지널"
                  mode="original"
                  onPress={(mode) => setVoiceMode(mode)}
                />
              </View>
            </View>

            <Pressable style={styles.soundButton} onPress={() => setIsMuted((current) => !current)}>
              <Ionicons name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'} size={22} color="#B4B3B3" />
            </Pressable>
          </View>

          {showRecordMarkers ? (
            <View style={styles.recordMarkerRow}>
              <View style={[styles.recordMarkerSlot, { left: 26 }]}>
                <RecordMarker />
              </View>
              <View style={[styles.recordMarkerSlot, { left: 65 }]}>
                <RecordMarker wide />
              </View>
              <View style={[styles.recordMarkerSlot, { left: 125 }]}>
                <RecordMarker />
              </View>
              <View style={[styles.recordMarkerSlot, { left: 180 }]}>
                <RecordMarker />
              </View>
              <View style={[styles.recordMarkerSlot, { left: 237 }]}>
                <RecordMarker wide />
              </View>
            </View>
          ) : null}

          <View style={styles.bottomController}>
            <Pressable style={styles.myVoiceNav} onPress={openRecordModal}>
              <Ionicons name="mic-outline" size={24} color="#333333" />
              <Text style={styles.myVoiceNavText}>마이 보이스</Text>
            </Pressable>
            <Pressable style={styles.listButton}>
              <Ionicons name="list-outline" size={25} color="#333333" />
            </Pressable>
            <View style={styles.episodeActions}>
              <Pressable style={styles.episodeAction} onPress={() => jumpToSpoint(activeSpointIndex - 1)}>
                <Ionicons name="chevron-back" size={12} color="#B4B3B3" />
                <Text style={styles.prevEpisodeText}>이전화</Text>
              </Pressable>
              <Pressable style={styles.episodeAction} onPress={() => jumpToSpoint(activeSpointIndex + 1)}>
                <Text style={styles.nextEpisodeText}>다음화</Text>
                <Ionicons name="chevron-forward" size={12} color="#333333" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.browserBar}>
          <Text style={styles.browserText}>libdobedub.com</Text>
          <View style={styles.homeIndicator} />
        </View>

        <RecordingModal
          isVisible={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onJumpToScene={() => {
            setIsRecordModalOpen(false);
            jumpToSpoint(activeSpointIndex);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

type RecordingModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onJumpToScene: () => void;
};

function RecordingModal({ isVisible, onClose, onJumpToScene }: RecordingModalProps) {
  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.recordModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>녹음하기</Text>
            <Pressable style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {RECORD_LINES.map((line) => (
              <View key={line.label} style={styles.dialogueCard}>
                <View style={styles.dialogueHeader}>
                  <Ionicons name={line.expanded ? 'chevron-down' : 'chevron-forward'} size={12} color="#333333" />
                  <Text style={styles.dialogueLabel}>{line.label}</Text>
                </View>
                <Text style={styles.dialogueSpeaker}>{line.speaker}</Text>
                <View style={styles.dialogueScriptGroup}>
                  {line.script.map((script) => (
                    <Text key={script} style={styles.dialogueScript}>
                      {script}
                    </Text>
                  ))}
                </View>

                <View style={styles.dialogueActions}>
                  <Pressable style={styles.previewPill}>
                    <Ionicons name="play-outline" size={16} color="#333333" />
                    <Text style={styles.previewPillText}>{line.expanded ? '오리지널 듣기' : '대사 미리듣기'}</Text>
                  </Pressable>
                  <Pressable style={styles.sceneLink} onPress={onJumpToScene}>
                    <Text style={styles.sceneLinkText}>{line.expanded ? '해당 장면으로 이동' : '보이스툰으로 이동하기'}</Text>
                    <Ionicons name="chevron-forward" size={12} color="#333333" />
                  </Pressable>
                </View>

                {line.expanded ? (
                  <View style={styles.expandedRecordArea}>
                    <Image source={FIGMA_PLAYER_ASSETS.recordScene} style={styles.recordSceneImage} resizeMode="cover" />
                    <View style={styles.audioPreview}>
                      <View style={styles.stopButton}>
                        <Ionicons name="stop" size={12} color="#FFFFFF" />
                      </View>
                      <View style={styles.audioTrack}>
                        <View style={styles.audioKnob} />
                      </View>
                      <Pressable style={styles.audioActionButton}>
                        <Text style={styles.audioActionText}>미리듣기</Text>
                      </Pressable>
                      <Pressable style={styles.audioActionButton}>
                        <Text style={styles.audioActionText}>다시 녹음</Text>
                      </Pressable>
                    </View>
                    <Pressable style={styles.applyButton}>
                      <Text style={styles.applyButtonText}>적용하기</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable style={styles.confirmButton} onPress={onClose}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  playerFrame: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  headerLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerChapter: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '400',
  },
  headerTitle: {
    minWidth: 0,
    flex: 1,
    color: '#333333',
    fontSize: 16,
    fontWeight: '400',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewerContent: {
    alignItems: 'center',
  },
  webtoonImage: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  controller: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
  mainControls: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  mainControlsLeft: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 58,
    backgroundColor: '#333333',
    paddingLeft: 8,
    paddingRight: 16,
  },
  playIconFrame: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  voiceSwitch: {
    width: 160,
    height: 36,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  voiceSegment: {
    width: 80,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E5E5',
  },
  voiceSegmentMyActive: {
    backgroundColor: '#6503F8',
  },
  voiceSegmentOriginalActive: {
    backgroundColor: '#333333',
  },
  voiceSegmentText: {
    color: '#B4B3B3',
    fontSize: 14,
    fontWeight: '700',
  },
  voiceSegmentTextActive: {
    color: '#FFFFFF',
  },
  soundButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
  },
  recordMarkerRow: {
    height: 45,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  recordMarkerSlot: {
    position: 'absolute',
    top: 0,
  },
  recordMarker: {
    width: 28,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B4B3B3',
  },
  recordMarkerWide: {
    width: 30,
  },
  recordMarkerTail: {
    position: 'absolute',
    bottom: -6,
    left: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#B4B3B3',
  },
  bottomController: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myVoiceNav: {
    width: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  myVoiceNavText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
  },
  listButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  episodeAction: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  prevEpisodeText: {
    color: '#B4B3B3',
    fontSize: 12,
    fontWeight: '400',
  },
  nextEpisodeText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
  },
  browserBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CONTROLLER_BOTTOM_HEIGHT,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderTopWidth: 1,
    borderTopColor: '#C1C1C1',
  },
  browserText: {
    marginTop: 13,
    color: '#000000',
    fontSize: 12,
    fontWeight: '400',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 141,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#1C1C1C',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 16,
  },
  recordModal: {
    width: 329,
    maxWidth: '100%',
    height: 626,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    height: 67,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
  },
  modalTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 96,
    height: 51,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B4B3B3',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalScrollContent: {
    gap: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dialogueCard: {
    width: 297,
    alignItems: 'stretch',
    gap: 10,
    borderRadius: 4,
    backgroundColor: '#F9F9F9',
    padding: 16,
  },
  dialogueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogueLabel: {
    flex: 1,
    color: '#333333',
    fontSize: 12,
    fontWeight: '700',
  },
  dialogueSpeaker: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '700',
  },
  dialogueScriptGroup: {
    gap: 2,
  },
  dialogueScript: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  dialogueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  previewPill: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  previewPillText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
  },
  sceneLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sceneLinkText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: '400',
  },
  expandedRecordArea: {
    alignItems: 'stretch',
    gap: 10,
  },
  recordSceneImage: {
    width: 265,
    height: 193,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  audioPreview: {
    width: 265,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  stopButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFE8ED',
  },
  audioTrack: {
    flex: 1,
    height: 2,
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
  },
  audioKnob: {
    width: 16,
    height: 16,
    alignSelf: 'center',
    borderRadius: 50,
    backgroundColor: '#333333',
  },
  audioActionButton: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#333333',
    paddingHorizontal: 8,
  },
  audioActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  applyButton: {
    width: 265,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalFooter: {
    height: 99,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
