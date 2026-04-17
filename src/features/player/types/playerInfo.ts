export type PlayerEpisode = {
  id: number;
  title: string;
  chapter: string;
  thumbnail: string;
  isRecording: boolean;
};

export type PlayerEpisodeDetail = {
  id: number;
  title: string;
  chapter: string;
  seriesId: number;
  seriesName: string;
  thumbnailImageUrl: string;
  viewCount: number;
  version: string;
};

export type PlayerContentImage = {
  uuid: string;
  realname: string;
  order: number;
  src: string;
  rawSrc?: string;
  url?: string;
};

export type PlayerSpoint = {
  uuid: string;
  top: number;
  time_ms: number;
  transition_effect?: {
    before_ms: number;
    after_ms: number;
  };
};

export type PlayerRecord = {
  src: string;
  rawSrc?: string;
  url?: string;
  artist_no?: number;
};

export type PlayerHole = {
  uuid: string;
  script_uuid: string;
  start_ms: number;
  duration_ms: number;
  script: string;
  index: number;
  records: PlayerRecord[];
};

export type PlayerTrack = {
  character_uuid: string;
  character_name?: string;
  holes: PlayerHole[];
};

export type PlayerAudioClip = {
  uuid: string;
  start_ms: number;
  duration_ms: number;
  filename: string;
  volume: number;
  src: string;
  rawSrc?: string;
  url?: string;
};

export type PlayerAudioTrack = {
  uuid: string;
  name: string;
  clips: PlayerAudioClip[];
};

export type PlayerContent = {
  images: PlayerContentImage[];
  format_version: string;
  spoints: PlayerSpoint[];
  tracks: PlayerTrack[];
  audio_tracks?: PlayerAudioTrack[];
  replace_images?: unknown[];
};

export type PlayerInfoData = {
  type: string;
  episode: PlayerEpisodeDetail;
  content: string | PlayerContent;
  directions: unknown[];
  episodes: PlayerEpisode[];
  message: string;
};

export type PlayerInfoApiResponse = {
  result: {
    code: number;
    msg: string;
    data: PlayerInfoData;
  };
};

export type PlayerVoiceCue = {
  id: string;
  characterUuid: string;
  script: string;
  startMs: number;
  durationMs: number;
  audioUrl: string;
};

export type NormalizedPlayerInfo = {
  episode: PlayerEpisodeDetail;
  episodes: PlayerEpisode[];
  content: PlayerContent;
  voiceCues: PlayerVoiceCue[];
  totalDurationMs: number;
};
