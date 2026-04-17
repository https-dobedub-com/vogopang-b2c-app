"use client";

import React from "react";
import { createRecordingData } from "../../../_lib/recordingStorage";
import useRecording from "../../../_lib/useRecording";
import {
  getFetchUrl,
  getLibMediaUrl,
  getMediaUrl,
  isLibMediaPath,
} from "../../../../../lib/environment";
import { useRecordingStore } from "../../../../../stores/useRecordingStore";
import {
  getEpisodeRecordingUploadErrorMessage,
  postHoleRecording,
} from "../../../../../api/episodeRecordings";
import {
  getMyVoiceRecordingList,
  MY_VOICE_SLOT_MAX,
} from "../../../../../api/myVoiceRecordings";
import { useGlobalSnackBarStore } from "../../../../../stores/useGlobalSnackBarStore";
import styles from "./RecordingHoleItem.module.scss";

interface HoleRecord {
  src?: string;
  rawSrc?: string;
  url?: string;
}

type PreviewSourceType = "guide" | "recording";

export interface RecordingHoleItemProps {
  episodeId: number;
  readOnly?: boolean;
  itemIndex: number;
  hole: {
    uuid: string;
    script?: string;
    start_ms?: number;
    duration_ms?: number;
    characterName?: string;
    character_name?: string;
    records?: HoleRecord[];
  };
  thumbnailSrc?: string | null;
  onRequestExclusivePreview: (ownerId: string, audio: HTMLAudioElement) => void;
  onClearExclusivePreview: (audio: HTMLAudioElement) => void;
  /** 개별 홀 녹음 POST 성공 후 호출 (서버 데이터 재조회 트리거) */
  onRecordingSaved?: () => void;
  onRecordingBusyChange?: (holeUuid: string, isBusy: boolean) => void;
}

function formatScript(script: string) {
  return script.replace(/^\((.*?)\)/, "").trim();
}

export default function RecordingHoleItem({
  episodeId,
  readOnly = false,
  itemIndex,
  hole,
  thumbnailSrc,
  onRequestExclusivePreview,
  onClearExclusivePreview,
  onRecordingSaved,
  onRecordingBusyChange,
}: RecordingHoleItemProps) {
  const hasHoleRecording = useRecordingStore((state) => state.hasHoleRecording(hole.uuid));
  const isApplyRecording = useRecordingStore((state) => state.isApplyRecording(hole.uuid));
  const getRecording = useRecordingStore((state) => state.getRecording);
  const saveRecording = useRecordingStore((state) => state.saveRecording);
  const setRecordingApply = useRecordingStore((state) => state.setRecordingApply);
  const setUseUserRecording = useRecordingStore((state) => state.setUseUserRecording);
  const serverHoleId = useRecordingStore((s) => s.serverHoleIdByHoleUuid[hole.uuid]);
  const showSnackBar = useGlobalSnackBarStore((s) => s.showSnackBar);

  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false);
  const [previewProgress, setPreviewProgress] = React.useState(0);
  const [thumbnailVisible, setThumbnailVisible] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const thumbnailImgRef = React.useRef<HTMLImageElement | null>(null);
  const isExpanded = true;
  const currentRecording = getRecording(hole.uuid);
  const guideSource =
    hole.records?.[0]?.url ||
    hole.records?.[0]?.rawSrc ||
    hole.records?.[0]?.src;
  const recordingPreviewSource = currentRecording?.blobUrl;
  const canPreviewGuide = Boolean(guideSource);
  const canPreviewRecording = Boolean(recordingPreviewSource);

  const { duration, isRecording, status, startRecording, stopRecording } =
    useRecording({
      maxDuration: hole.duration_ms ?? 60000,
      onRecordingComplete: async (blob, url) => {
        const recordingData = await createRecordingData(
          hole.uuid,
          blob,
          duration,
          true
        );

        if (!recordingData) {
          return;
        }

        saveRecording(episodeId, { ...recordingData, blobUrl: url, isApply: false }, "edu");
        setPreviewProgress(0);
      },
    });
  const recordButtonLabel = isRecording
    ? "녹음 종료"
    : status === "requesting"
      ? "권한 확인 중"
      : hasHoleRecording
        ? "다시 녹음"
        : "녹음 시작";
  const isRecordingBusy = isRecording || status === "requesting";
  const hasRecordingPanelContent = hasHoleRecording || isRecording;

  React.useEffect(() => {
    onRecordingBusyChange?.(hole.uuid, isRecordingBusy);
    return () => {
      onRecordingBusyChange?.(hole.uuid, false);
    };
  }, [hole.uuid, isRecordingBusy, onRecordingBusyChange]);

  const stopPreviewAudio = React.useCallback(
    (options?: { resetProgress?: boolean }) => {
      const audio = audioRef.current;
      if (!audio) {
        setIsPreviewPlaying(false);
        if (options?.resetProgress ?? false) {
          setPreviewProgress(0);
        }
        return;
      }

      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onpause = null;
      audio.pause();
      onClearExclusivePreview(audio);
      audioRef.current = null;
      setIsPreviewPlaying(false);
      if (options?.resetProgress ?? true) {
        setPreviewProgress(0);
      }
    },
    [onClearExclusivePreview],
  );

  React.useEffect(() => {
    return () => {
      stopPreviewAudio({ resetProgress: true });
    };
  }, [stopPreviewAudio]);

  const thumbnailSrcResolved = thumbnailSrc || "/images/sample/record_sample.png";

  React.useLayoutEffect(() => {
    setThumbnailVisible(false);
    const el = thumbnailImgRef.current;
    if (el?.complete && el.naturalHeight > 0) {
      setThumbnailVisible(true);
    }
  }, [thumbnailSrcResolved]);

  const handleThumbnailLoad = React.useCallback(() => {
    setThumbnailVisible(true);
  }, []);

  const handleThumbnailError = React.useCallback(() => {
    setThumbnailVisible(true);
  }, []);

  const resolvePreviewUrl = (sourceType: PreviewSourceType) => {
    if (sourceType === "recording") {
      return recordingPreviewSource ?? null;
    }

    if (!guideSource) {
      return null;
    }

    return isLibMediaPath(guideSource)
      ? getFetchUrl(getLibMediaUrl(guideSource))
      : getFetchUrl(getMediaUrl(guideSource, "records"));
  };

  const handlePreview = async (sourceType: PreviewSourceType) => {
    try {
      stopPreviewAudio({ resetProgress: true });

      const resolvedUrl = resolvePreviewUrl(sourceType);
      if (!resolvedUrl) {
        return;
      }

      const audio = new Audio(resolvedUrl);
      audioRef.current = audio;
      onRequestExclusivePreview(hole.uuid, audio);
      setIsPreviewPlaying(true);
      setPreviewProgress(0);
      audio.currentTime = 0;
      audio.ontimeupdate = () => {
        if (audio.duration > 0) {
          setPreviewProgress(audio.currentTime / audio.duration);
        }
      };
      audio.onended = () => {
        onClearExclusivePreview(audio);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setIsPreviewPlaying(false);
        setPreviewProgress(0);
      };
      audio.onpause = () => {
        onClearExclusivePreview(audio);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
        setIsPreviewPlaying(false);
      };
      await audio.play();
    } catch {
      setIsPreviewPlaying(false);
      setPreviewProgress(0);
    }
  };

  const handleRecordAction = async () => {
    stopPreviewAudio({ resetProgress: true });

    if (isRecording) {
      stopRecording();
      return;
    }

    await startRecording(hole.duration_ms ?? 60000);
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleApplyRecording = async () => {
    if (!hasHoleRecording || isSaving) return;

    try {
      const { items, slotMax } = await getMyVoiceRecordingList();
      const effectiveSlotMax =
        typeof slotMax === "number" && Number.isFinite(slotMax) && slotMax > 0
          ? slotMax
          : MY_VOICE_SLOT_MAX;
      const hasCurrentEpisodeEntry = items.some((item) => item.episodeId === episodeId);
      if (!hasCurrentEpisodeEntry && items.length >= effectiveSlotMax) {
        showSnackBar("마이보이스 내역이 가득 찼습니다. 마이보이스 내역에서 삭제 후 적용할 수 있습니다.");
        return;
      }
    } catch {
      showSnackBar("마이보이스 내역 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const recording = getRecording(hole.uuid);
    if (!recording?.blobData) {
      setRecordingApply(episodeId, hole.uuid, true, "edu");
      setUseUserRecording(true);
      return;
    }

    if (!Number.isFinite(serverHoleId) || serverHoleId <= 0) {
      showSnackBar("홀 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await postHoleRecording({
        holeUuid: hole.uuid,
        serverHoleId,
        src: recording.blobData,
        size: recording.blobData.length,
      });
      setRecordingApply(episodeId, hole.uuid, true, "edu");
      setUseUserRecording(true);
      onRecordingSaved?.();
    } catch (e) {
      console.error(
        "[RecordingHoleItem] 녹음 저장(프리사인·S3·/files/uploadUrls·POST /recordings) 실패:",
        e,
      );
      showSnackBar(getEpisodeRecordingUploadErrorMessage(e));
    } finally {
      setIsSaving(false);
    }
  };

  const showSampleImage = isExpanded;
  const showRecordingPanel = !readOnly && isExpanded && hasRecordingPanelContent;
  const maxRecordingDuration = Math.max(hole.duration_ms ?? 0, currentRecording?.durationMs ?? 0, 1000);
  const barProgress = isRecording
    ? Math.max(0.06, Math.min(0.98, duration / maxRecordingDuration))
    : previewProgress;
  const canInteractWhileRecording = !isRecordingBusy && !isSaving;
  const canApplyRecording =
    hasHoleRecording && !isApplyRecording && canInteractWhileRecording;
  const articleClassName = [
    styles.holeItem,
    styles.expanded,
    showRecordingPanel ? styles.recordingPanelActive : "",
  ]
    .filter(Boolean)
    .join(" ");
  const recordingAreaClassName = [
    styles.recordingArea,
    styles.recordingAreaExpanded,
    showRecordingPanel ? styles.recordingAreaRecordingPanel : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClassName}>
      <div className={styles.holeItemHeaderWrapper}>
        <div className={styles.headerToggleButton}>
          <span className={styles.toggleHeaderRow}>
            <span className={styles.headerTitleGroup}>
              <span className={styles.scriptIndex}>
                대사 {String(itemIndex + 1).padStart(2, "0")}
              </span>
            </span>
            {!readOnly && isApplyRecording ? (
              <span className={styles.applyStatusBadge}>적용중</span>
            ) : null}
          </span>
          <span className={styles.toggleBody}>
            <span className={styles.characterLabel}>
              {hole.characterName || hole.character_name || "나레이션"}
            </span>
            <span className={styles.holeItemScript}>{formatScript(hole.script ?? "")}</span>
          </span>
        </div>

        <div className={styles.inlineActions}>
          <button
            type="button"
            className={styles.previewButton}
            onClick={() => void handlePreview("guide")}
            disabled={!canPreviewGuide || !canInteractWhileRecording}
          >
            <img src="/icons/common/playBorder.svg" alt="" />
            <span>오리지널 듣기</span>
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className={recordingAreaClassName}>
          {showSampleImage ? (
            <div className={styles.sampleImageWrap}>
              <img
                ref={thumbnailImgRef}
                key={thumbnailSrcResolved}
                src={thumbnailSrcResolved}
                alt=""
                className={[
                  styles.sampleImage,
                  thumbnailVisible ? styles.sampleImageVisible : "",
                ].join(" ")}
                decoding="async"
                onLoad={handleThumbnailLoad}
                onError={handleThumbnailError}
              />
            </div>
          ) : null}

          {showRecordingPanel ? (
            <>
              <div className={styles.playerBar}>
                <button
                  type="button"
                  className={styles.stopButton}
                  onClick={
                    isRecording
                      ? handleRecordAction
                      : isPreviewPlaying
                        ? () => stopPreviewAudio({ resetProgress: true })
                        : undefined
                  }
                  disabled={!isRecording && !isPreviewPlaying}
                  aria-label={isRecording ? "녹음 종료" : "정지"}
                >
                  <span />
                </button>

                <div className={styles.progressTrack} aria-hidden>
                  <div
                    className={styles.progressThumb}
                    style={{ left: `${Math.max(0, Math.min(100, barProgress * 100))}%` }}
                  />
                </div>

                <button
                  type="button"
                  className={[
                    styles.secondaryControlBtn,
                    hasHoleRecording && !isRecording ? styles.secondaryControlBtnActive : "",
                  ].join(" ")}
                  onClick={() => void handlePreview("recording")}
                  disabled={!canPreviewRecording || !canInteractWhileRecording}
                >
                  미리듣기
                </button>
                <button
                  type="button"
                  className={[
                    styles.secondaryControlBtn,
                    hasHoleRecording && !isRecording ? styles.secondaryControlBtnActive : "",
                  ].join(" ")}
                  onClick={() => void handleRecordAction()}
                  disabled={isRecordingBusy || isSaving}
                >
                  다시 녹음
                </button>
              </div>

              <button
                type="button"
                className={styles.applyButton}
                onClick={() => void handleApplyRecording()}
                disabled={!canApplyRecording}
              >
                {isSaving ? "저장 중..." : "적용하기"}
              </button>
            </>
          ) : null}

          {!readOnly && !showRecordingPanel ? (
            <>
              <div className={styles.recordButtonFrame}>
                <button
                  type="button"
                  className={[
                    styles.recordMainBtn,
                    isRecording ? styles.recording : "",
                  ].join(" ")}
                  onClick={handleRecordAction}
                >
                  <img src="/icons/common/mic.svg" alt="" />
                  <span>{recordButtonLabel}</span>
                </button>
              </div>
              <button
                type="button"
                className={styles.applyButton}
                onClick={() => void handleApplyRecording()}
                disabled={!canApplyRecording}
              >
                {isSaving ? "저장 중..." : "적용하기"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
