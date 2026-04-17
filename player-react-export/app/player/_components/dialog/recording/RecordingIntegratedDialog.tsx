"use client";

import React from "react";
import RecordingHoleItem from "./RecordingHoleItem";
import { useRecordingStore } from "../../../../../stores/useRecordingStore";
import styles from "./RecordingIntegratedDialog.module.scss";

interface RecordingIntegratedDialogProps {
  episodeId: number;
  readOnly?: boolean;
  holes: Array<{
    uuid: string;
    script?: string;
    start_ms?: number;
    duration_ms?: number;
    characterName?: string;
    character_name?: string;
    thumbnailSrc?: string | null;
    records?: Array<{
      src?: string;
      rawSrc?: string;
      url?: string;
    }>;
  }>;
  onNavigateToScene?: (startMs: number) => void;
  onRecordingSaved?: () => void;
}

interface ActivePreviewAudio {
  ownerId: string;
  audio: HTMLAudioElement;
}

export default function RecordingIntegratedDialog({
  episodeId,
  holes,
  onRecordingSaved,
  readOnly = false,
}: RecordingIntegratedDialogProps) {
  const isOpen = useRecordingStore((state) => state.isOpen);
  const closeDialog = useRecordingStore((state) => state.closeDialog);
  const loadRecordings = useRecordingStore((state) => state.loadRecordings);
  const activePreviewAudioRef = React.useRef<ActivePreviewAudio | null>(null);
  const [recordingBusyMap, setRecordingBusyMap] = React.useState<Record<string, boolean>>({});
  const sortedHoles = [...holes]
    .sort((a, b) => (a.start_ms ?? 0) - (b.start_ms ?? 0));
  const hasActiveRecording = Object.values(recordingBusyMap).some(Boolean);

  const requestExclusivePreview = React.useCallback(
    (ownerId: string, audio: HTMLAudioElement) => {
      const currentPreview = activePreviewAudioRef.current;
      if (
        currentPreview &&
        currentPreview.audio !== audio &&
        currentPreview.ownerId !== ownerId
      ) {
        currentPreview.audio.pause();
      }

      activePreviewAudioRef.current = { ownerId, audio };
    },
    [],
  );

  const clearExclusivePreview = React.useCallback((audio: HTMLAudioElement) => {
    if (activePreviewAudioRef.current?.audio === audio) {
      activePreviewAudioRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setRecordingBusyMap({});
      if (activePreviewAudioRef.current) {
        activePreviewAudioRef.current.audio.pause();
        activePreviewAudioRef.current = null;
      }
      return;
    }

    loadRecordings(episodeId, "edu");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (activePreviewAudioRef.current) {
        activePreviewAudioRef.current.audio.pause();
        activePreviewAudioRef.current = null;
      }
    };
  }, [episodeId, isOpen, loadRecordings]);

  const handleRecordingBusyChange = React.useCallback((holeUuid: string, isBusy: boolean) => {
    setRecordingBusyMap((prev) => {
      if (prev[holeUuid] === isBusy) {
        return prev;
      }
      return {
        ...prev,
        [holeUuid]: isBusy,
      };
    });
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (hasActiveRecording) {
      return;
    }
    closeDialog();
  };

  /** Figma: 확인은 항상 활성 — 모달만 닫음(마이 보이스 적용은 홀별「적용하기」·플레이어 토글에서 처리) */
  const handleConfirm = () => {
    if (hasActiveRecording) {
      return;
    }
    closeDialog();
  };

  return (
    <div
      className={styles.recordingIntegratedOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="녹음하기"
      onClick={handleClose}
    >
      <div
        className={styles.recordingIntegratedDialog}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.top}>
          <h2>녹음하기</h2>
        </div>

        <div className={styles.holeListContent}>
          {sortedHoles.length > 0 ? (
            sortedHoles.map((hole, index) => (
              <RecordingHoleItem
                key={hole.uuid}
                episodeId={episodeId}
                readOnly={readOnly}
                itemIndex={index}
                hole={hole}
                onRequestExclusivePreview={requestExclusivePreview}
                onClearExclusivePreview={clearExclusivePreview}
                thumbnailSrc={hole.thumbnailSrc}
                onRecordingSaved={onRecordingSaved}
                onRecordingBusyChange={handleRecordingBusyChange}
              />
            ))
          ) : (
            <div className={styles.emptyMessage}>녹음할 대사가 없습니다.</div>
          )}
        </div>

        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.doneButton}
            onClick={handleConfirm}
            disabled={hasActiveRecording}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
