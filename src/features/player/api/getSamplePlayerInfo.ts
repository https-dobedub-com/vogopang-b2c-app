import { createSamplePlayerInfoResponse } from '../data/samplePlayerInfo';
import type {
  NormalizedPlayerInfo,
  PlayerContent,
  PlayerEpisode,
  PlayerInfoApiResponse,
  PlayerInfoData,
  PlayerVoiceCue,
} from '../types/playerInfo';

function parseContent(content: PlayerInfoData['content']): PlayerContent {
  if (typeof content !== 'string') {
    return content;
  }

  return JSON.parse(content) as PlayerContent;
}

function sortEpisodes(episodes: PlayerEpisode[]) {
  return [...episodes].sort((a, b) => Number(a.chapter) - Number(b.chapter));
}

function flattenVoiceCues(content: PlayerContent): PlayerVoiceCue[] {
  return content.tracks
    .flatMap((track) =>
      track.holes.map((hole) => {
        const record = hole.records[0];

        return {
          id: hole.uuid,
          characterUuid: track.character_uuid,
          script: hole.script,
          startMs: hole.start_ms,
          durationMs: hole.duration_ms,
          audioUrl: record?.url ?? record?.src ?? '',
        };
      }),
    )
    .filter((cue) => cue.audioUrl)
    .sort((a, b) => a.startMs - b.startMs);
}

export function normalizePlayerInfoResponse(response: PlayerInfoApiResponse): NormalizedPlayerInfo {
  const data = response.result.data;
  const content = parseContent(data.content);
  const images = [...content.images].sort((a, b) => a.order - b.order);
  const spoints = [...content.spoints].sort((a, b) => a.time_ms - b.time_ms);
  const tracks = content.tracks.map((track) => ({
    ...track,
    holes: [...track.holes].sort((a, b) => a.start_ms - b.start_ms),
  }));
  const normalizedContent = {
    ...content,
    images,
    spoints,
    tracks,
  };
  const voiceCues = flattenVoiceCues(normalizedContent);
  const cueEndMs = voiceCues.reduce((max, cue) => Math.max(max, cue.startMs + cue.durationMs), 0);
  const spointEndMs = spoints.at(-1)?.time_ms ?? 0;
  const backgroundEndMs =
    normalizedContent.audio_tracks?.flatMap((track) => track.clips).reduce((max, clip) => {
      return Math.max(max, clip.start_ms + clip.duration_ms);
    }, 0) ?? 0;

  return {
    episode: data.episode,
    episodes: sortEpisodes(data.episodes),
    content: normalizedContent,
    voiceCues,
    totalDurationMs: Math.max(cueEndMs, spointEndMs, backgroundEndMs),
  };
}

export async function getSamplePlayerInfo(seriesId: number, episodeId: number) {
  const response = createSamplePlayerInfoResponse(seriesId, episodeId);

  return normalizePlayerInfoResponse(response);
}
