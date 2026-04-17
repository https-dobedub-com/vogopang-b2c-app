import React, {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {getImageMemoryCache, getImageMemoryCacheSize, usePlayerStore} from "../../stores/usePlayerStore";
import { useToonWork } from "./_lib/useToonWork";
import type { ContentVersion } from "./_lib/useToonWork";
import {
  CARTOON_IMAGE_WIDTH_BASE,
  DOMHelper,
  ImageHelper,
  MarkerHelper,
  PositionCalculator,
} from "./_lib/toonWorkCommon";
import PlayerHeader from "./_components/PlayerHeader";
import PlayerLoadingbar from "./_components/PlayerLoadingbar";
import { PlayerControlType } from "./types";
import { playerLogger } from "./_lib/playerLogger";
import { usePlayerState } from "./_hooks/usePlayerState";
import { useScrollSync } from "./_hooks/useScrollSync";
import { useImageLoading } from "./_hooks/useImageLoading";
import { usePlayerControls } from "./_hooks/usePlayerControls";
import { usePlayerInitialization } from "./_hooks/usePlayerInitialization";
import { PlayerViewer } from "./_components/PlayerViewer";
import { PlayerControls } from "./_components/PlayerControls";
import RecordingIntegratedDialog from "./_components/dialog/recording/RecordingIntegratedDialog";
import { useRecordingStore } from "../../stores/useRecordingStore";
import {
  buildServerRecordingMapsByHoleUuid,
  collectHolesFromContent,
  type EpisodeRecordingApiItem,
  fetchEpisodeRecordings,
  isUsableRecordingSrc,
} from "../../api/episodeRecordings";
import type {
  VogopangContentImage,
  VogopangContentSpoint,
} from "../../data/vogopangContentTypes";
import type { PlayerEpisodeListItem } from "./playerEpisodeListData";
import {
  chapterLabelForEpisodeListItem,
  shouldShowPlayerMyVoiceRecordingEntry,
  stripDuplicateChapterLabelFromTitle,
} from "../../lib/playerInfoEpisodes";
import { getFetchUrl } from "../../lib/environment";
import { useGlobalSnackBarStore } from "../../stores/useGlobalSnackBarStore";
import clsx from "clsx";
import { PlayerImmersivePeekOverlay } from "./_components/PlayerImmersivePeekOverlay";
import { getPlayerImmersivePeekBottomOffset } from "./_lib/playerChromeStackOffset";

interface PlayerContentProps {
  seriesId: number;
  episodeId: number;
  version: "V0" | "V1";
  /** URL `playerKey` — 에피소드 목록에서 현재 회차 표시용 */
  currentPlayerKey: string;
  /** 관리자 미리보기처럼 녹음 UI를 읽기 전용으로 보여줄 때 */
  recordingReadOnly?: boolean;
  /** 관리자 미리보기처럼 목록/이전화/다음화/보이스 토글을 숨길 때 */
  adminPreviewMode?: boolean;
  backHref?: string | (() => void);
  title?: string;
  subtitle?: string;
  showExperienceEntry?: boolean;
  /** 작품 상세에서 진입 시 대출 여부 — null이면 알 수 없음(차단 안 함) */
  userHasLoan?: boolean | null;
}

export interface PlayerContentRef {
  handleStop: () => Promise<void>;
}

type SceneMarker = {
  positionRatio?: number;
  top?: number;
  time_ms?: number;
  startMs?: number;
  index?: number;
};

const EMPTY_SPOINTS: VogopangContentSpoint[] = [];

function resolveRecordingMarkerPositionRatio(startMs: number, maxTimelineMs: number): number {
  if (!Number.isFinite(maxTimelineMs) || maxTimelineMs <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (Math.max(0, startMs) / maxTimelineMs) * 100));
}

/**
 * 가장 가까운 spoint `time_ms` (기존 동작).
 * 홀이 두 키프레임 사이에서 다음 쪽에 더 가까우면 **다음** 시각으로 붙는다.
 */
function nearestSpointTimeMs(
  requestedMs: number,
  spoints: Array<{ time_ms?: number }>,
): number {
  if (spoints.length === 0) return requestedMs;
  const times = spoints
    .map((s) => s.time_ms)
    .filter((t): t is number => typeof t === "number" && Number.isFinite(t));
  if (times.length === 0) return requestedMs;
  let best = times[0]!;
  let bestDist = Math.abs(best - requestedMs);
  for (let i = 1; i < times.length; i++) {
    const t = times[i]!;
    const d = Math.abs(t - requestedMs);
    if (d < bestDist || (d === bestDist && t < best)) {
      best = t;
      bestDist = d;
    }
  }
  return best;
}

/**
 * `requestedMs` 이하인 마지막 spoint 시각 (앵커). 이전 대사/컷 쪽으로 붙일 때 사용.
 */
function anchorSpointTimeMs(requestedMs: number, spoints: Array<{ time_ms?: number }>): number {
  if (spoints.length === 0) return requestedMs;
  const sorted = [
    ...new Set(
      spoints
        .map((s) => s.time_ms)
        .filter((t): t is number => typeof t === "number" && Number.isFinite(t)),
    ),
  ].sort((a, b) => a - b);
  if (sorted.length === 0) return requestedMs;
  if (requestedMs < sorted[0]) return requestedMs;
  if (requestedMs >= sorted[sorted.length - 1]) return sorted[sorted.length - 1];
  let best = sorted[0];
  for (const t of sorted) {
    if (t <= requestedMs) best = t;
    else break;
  }
  return best;
}

/** 키프레임 위·경계 근처에서만 쓰는 nearest 신뢰 오차 (ms). */
const SPOINT_NAVIGATE_NEAREST_MAX_ERROR_MS = 200;
/** 구간 내부라도 키프레임 경계에 너무 가까우면 스냅 (ms). */
const SPOINT_NAVIGATE_SEGMENT_EDGE_SNAP_MS = 600;

/**
 * 마커 이동용. `getPositionAtTime*`는 두 spoint 사이에서 보간하므로,
 * 홀 시각이 **연속한 두 고유 키프레임 사이**에 있으면 스냅하지 않고 `requestedMs` 그대로 쓴다.
 * (nearest만 쓰면 구간 중간에서도 다음 키프레임으로 붙어 **다음 장면**으로 튀는 경우가 있음)
 * 그 외(키프레임 위·타임라인 앞/뒤)만 nearest → (오차 크면) 앵커.
 */
function resolveNavigateTimeMsFromSpoints(
  requestedMs: number,
  spoints: Array<{ time_ms?: number }>,
): number {
  const sorted = [
    ...new Set(
      spoints
        .map((s) => s.time_ms)
        .filter((t): t is number => typeof t === "number" && Number.isFinite(t)),
    ),
  ].sort((a, b) => a - b);
  //시작값 끝값이 2개 이상이면 반복문을 돌면서 첫지점과 끝지점중 가까운 값을 구해서 600ms랑 비교
  if (sorted.length >= 2) {
    for (let i = 0; i < sorted.length - 1; i++) {
      //시작지점
      const lo = sorted[i]!;
      //끝지점
      const hi = sorted[i + 1]!;
      // 첫지점과 끝지점중 가까운 값을 구해서 600ms랑 비교
      if (requestedMs > lo && requestedMs < hi) {
        const msAfterLo = requestedMs - lo;
        const msBeforeHi = hi - requestedMs;
        const nearestEdgeGapMs = Math.min(msAfterLo, msBeforeHi);
        // 600ms 이하면 가까운 값을 반환
        if (nearestEdgeGapMs <= SPOINT_NAVIGATE_SEGMENT_EDGE_SNAP_MS) {
          return msAfterLo <= msBeforeHi ? lo : hi;
        }
        return requestedMs;
      }
    }
  }

  const nearest = nearestSpointTimeMs(requestedMs, spoints);
  if (Math.abs(nearest - requestedMs) <= SPOINT_NAVIGATE_NEAREST_MAX_ERROR_MS) {
    return nearest;
  }
  return anchorSpointTimeMs(requestedMs, spoints);
}

function resolvePreviousScenePlaybackStartMs(
  requestedMs: number,
  spoints: Array<{ time_ms?: number }>,
): number {
  const sorted = [
    ...new Set(
      spoints
        .map((s) => s.time_ms)
        .filter((t): t is number => typeof t === "number" && Number.isFinite(t)),
    ),
  ].sort((a, b) => a - b);

  if (sorted.length === 0) {
    return Math.max(0, requestedMs);
  }

  const navigateTimeMs = resolveNavigateTimeMsFromSpoints(requestedMs, spoints);
  let currentSceneIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const timeMs = sorted[i];
    if (timeMs <= navigateTimeMs) {
      currentSceneIndex = i;
      break;
    }
  }

  if (currentSceneIndex <= 0) {
    return Math.max(0, sorted[Math.max(0, currentSceneIndex)] ?? navigateTimeMs);
  }

  return sorted[currentSceneIndex - 1]!;
}

function uuidAliasKeys(raw: unknown): string[] {
  const value = String(raw ?? "").trim();
  if (!value) {
    return [];
  }

  const lower = value.toLowerCase();
  const compact = lower.replace(/-/g, "");
  return Array.from(new Set([value, lower, compact]));
}

function normalizeHoleScript(raw: unknown): string {
  return String(raw ?? "")
    .replace(/^\((.*?)\)/, "")
    .replace(/\s+/g, "")
    .trim();
}

function getPlayerImageCachePath(image?: Partial<VogopangContentImage> | null): string {
  const img = image as (Partial<VogopangContentImage> & { url?: string; rawSrc?: string }) | null | undefined;
  return String(img?.url || img?.rawSrc || img?.src || "").trim();
}

function resolvePlaybackSceneMarkers(
  playbackMarkers: SceneMarker[],
  spoints: SceneMarker[],
): SceneMarker[] {
  if (playbackMarkers.length > 0) {
    return playbackMarkers;
  }

  return MarkerHelper.sortByIndex(spoints.map((marker) => MarkerHelper.normalizeMarker(marker)));
}

function shouldPreferAdjacentSceneThumbnail(params: {
  requestedMs: number;
  markers: SceneMarker[];
  currentSceneHeight: number;
  currentSceneIndex: number;
  adjacentSceneIndex: number;
  direction: "previous" | "next";
}): boolean {
  const {
    requestedMs,
    markers,
    currentSceneHeight,
    currentSceneIndex,
    adjacentSceneIndex,
    direction,
  } = params;

  const isValidAdjacentScene =
    direction === "next"
      ? adjacentSceneIndex > currentSceneIndex
      : adjacentSceneIndex < currentSceneIndex;

  if (!isValidAdjacentScene) {
    return false;
  }

  const markersByTime = new Map<number, ReturnType<typeof MarkerHelper.normalizeMarker>>();
  for (const marker of MarkerHelper.sortByTime(markers.map((item) => MarkerHelper.normalizeMarker(item)))) {
    markersByTime.set(marker.time_ms, marker);
  }

  const sortedMarkers = [...markersByTime.values()].sort((a, b) => a.time_ms - b.time_ms);
  for (let index = 0; index < sortedMarkers.length - 1; index += 1) {
    const currentMarker = sortedMarkers[index];
    const nextMarker = sortedMarkers[index + 1];

    if (!currentMarker || !nextMarker) {
      continue;
    }

    if (requestedMs <= currentMarker.time_ms || requestedMs >= nextMarker.time_ms) {
      continue;
    }

    const intervalDurationMs = nextMarker.time_ms - currentMarker.time_ms;
    if (intervalDurationMs <= 0 || intervalDurationMs > 720) {
      return false;
    }

    const intervalProgress = (requestedMs - currentMarker.time_ms) / intervalDurationMs;
    const elapsedSinceCurrentMarkerMs = requestedMs - currentMarker.time_ms;
    const remainingUntilNextMarkerMs = nextMarker.time_ms - requestedMs;
    const positionRatioDelta = Math.abs(nextMarker.positionRatio - currentMarker.positionRatio);
    const topDelta = Math.abs(nextMarker.top - currentMarker.top);
    const hasMeaningfulSceneJump =
      positionRatioDelta >= 0.57 || topDelta >= Math.max(275, currentSceneHeight * 0.44);
    const progressThreshold = intervalDurationMs <= 450 ? 0.31 : 0.46;
    const previousProgressThreshold = intervalDurationMs <= 450 ? 0.06 : 0.1;
    const previousElapsedThresholdMs = Math.min(60, intervalDurationMs * 0.12);

    if (!hasMeaningfulSceneJump) {
      return false;
    }

    if (direction === "next") {
      return elapsedSinceCurrentMarkerMs >= 118 && intervalProgress >= progressThreshold;
    }

    return (
      remainingUntilNextMarkerMs >= 112 &&
      elapsedSinceCurrentMarkerMs <= previousElapsedThresholdMs &&
      intervalProgress <= previousProgressThreshold
    );
  }

  return false;
}

function resolveSceneNavigateTargetScrollTop(params: {
  startMs: number;
  spoints: Array<{ time_ms?: number }>;
  version: ContentVersion;
  contentList: HTMLElement | null;
  markers: SceneMarker[];
  workspaceImageScale: number;
  viewOffsetTop: number;
  calculatedWidth: number;
}): number | null {
  const {
    startMs,
    spoints,
    version,
    contentList,
    markers,
    workspaceImageScale,
    viewOffsetTop,
    calculatedWidth,
  } = params;

  if (!contentList || markers.length === 0) {
    return null;
  }

  const navigateTimeMs = resolveNavigateTimeMsFromSpoints(startMs, spoints);
  const currentScrollTop = contentList.scrollTop ?? 0;
  const scrollHeight = contentList.scrollHeight ?? 0;
  const scrollRange = Math.max(1, scrollHeight - contentList.clientHeight);
  const scrollMarkers = markers.map((marker) => MarkerHelper.normalizeMarker(marker));

  const targetPosition =
    version === "V0"
      ? PositionCalculator.getPositionAtTimeV0(
          navigateTimeMs,
          scrollMarkers,
          scrollHeight,
          currentScrollTop,
        )
      : PositionCalculator.getPositionAtTimeV1(
          navigateTimeMs,
          scrollMarkers,
          workspaceImageScale,
          viewOffsetTop,
          currentScrollTop,
          calculatedWidth,
          CARTOON_IMAGE_WIDTH_BASE,
          scrollRange,
          scrollHeight,
        );

  return Math.min(scrollRange, Math.max(0, targetPosition));
}

/**
 * DOM 없이 spoint positionRatio(V0) / top(V1)을 보간해 이미지 인덱스를 추정한다.
 * 시간 비율 단순 나눗셈보다 정확하며, DOM 렌더 상태에 무관하게 동작한다.
 */
function resolveImageIndexByScrollPosition(
  holeStartMs: number,
  markers: Array<{ time_ms?: number; startMs?: number; positionRatio?: number; top?: number }>,
  imageCount: number,
  version: ContentVersion,
): number {
  if (imageCount === 0 || markers.length === 0) return 0;

  const sorted = [...markers].sort(
    (a, b) => (a.time_ms ?? a.startMs ?? 0) - (b.time_ms ?? b.startMs ?? 0),
  );

  let beforeIdx = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if ((sorted[i].time_ms ?? sorted[i].startMs ?? 0) <= holeStartMs) {
      beforeIdx = i;
      break;
    }
  }
  const afterIdx = beforeIdx + 1 < sorted.length ? beforeIdx + 1 : -1;

  let t = 0;
  if (beforeIdx >= 0 && afterIdx >= 0) {
    const t0 = sorted[beforeIdx].time_ms ?? sorted[beforeIdx].startMs ?? 0;
    const t1 = sorted[afterIdx].time_ms ?? sorted[afterIdx].startMs ?? 0;
    t = t1 > t0 ? (holeStartMs - t0) / (t1 - t0) : 0;
  }

  let scrollRatio: number;

  if (version === "V0") {
    const r0 = beforeIdx >= 0 ? (sorted[beforeIdx].positionRatio ?? 0) : 0;
    const r1 = afterIdx >= 0 ? (sorted[afterIdx].positionRatio ?? 100) : 100;
    const interpolated =
      beforeIdx < 0 ? r1 : afterIdx < 0 ? r0 : r0 + t * (r1 - r0);
    scrollRatio = interpolated / 100;
  } else {
    const maxTop = Math.max(1, ...sorted.map((m) => m.top ?? 0));
    const top0 = beforeIdx >= 0 ? (sorted[beforeIdx].top ?? 0) : 0;
    const top1 = afterIdx >= 0 ? (sorted[afterIdx].top ?? maxTop) : maxTop;
    const interpolated =
      beforeIdx < 0 ? top1 : afterIdx < 0 ? top0 : top0 + t * (top1 - top0);
    scrollRatio = interpolated / maxTop;
  }

  return Math.min(Math.max(0, Math.floor(scrollRatio * imageCount)), imageCount - 1);
}

function resolveRecordingDialogThumbnailUrl(
  params: {
    holeStartMs: number;
    spoints: Array<{ time_ms?: number }>;
    images: VogopangContentImage[];
    contentList: HTMLElement | null;
    markers: SceneMarker[];
    version: ContentVersion;
    workspaceImageScale: number;
    viewOffsetTop: number;
    calculatedWidth: number;
  },
): string | null {
  const {
    holeStartMs,
    spoints,
    images,
    contentList,
    markers,
    version,
    workspaceImageScale,
    viewOffsetTop,
    calculatedWidth,
  } = params;
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  if (sortedImages.length === 0) return null;
  const navigateTimeMs = resolveNavigateTimeMsFromSpoints(holeStartMs, spoints);
  const isSnappedBackwardToSceneStart =
    navigateTimeMs < holeStartMs &&
    holeStartMs - navigateTimeMs <= SPOINT_NAVIGATE_SEGMENT_EDGE_SNAP_MS;
  const targetScrollTop = resolveSceneNavigateTargetScrollTop({
    startMs: holeStartMs,
    spoints,
    version,
    contentList,
    markers,
    workspaceImageScale,
    viewOffsetTop,
    calculatedWidth,
  });
  const preferredImageIndex =
    targetScrollTop !== null && contentList
      ? Math.min(
          Math.max(
            0,
            Math.floor(
              (targetScrollTop / Math.max(1, contentList.scrollHeight - contentList.clientHeight)) *
                sortedImages.length,
            ),
          ),
          sortedImages.length - 1,
        )
      : resolveImageIndexByScrollPosition(holeStartMs, markers, sortedImages.length, version);

  if (contentList) {
    const renderedImages = Array.from(
      contentList.querySelectorAll<HTMLImageElement>("img.toon-image"),
    ).filter((image) => {
      const rect = image.getBoundingClientRect();
      const src = image.currentSrc || image.src || "";
      return rect.width > 0 && rect.height > 0 && !src.startsWith("data:");
    });

    if (renderedImages.length > 0 && targetScrollTop !== null) {
      const imageOrderToSortedIndex = new Map<number, number>();
      sortedImages.forEach((image, index) => {
        if (Number.isFinite(image.order)) {
          imageOrderToSortedIndex.set(image.order, index);
        }
      });

      const contentRect = contentList.getBoundingClientRect();
      const imageMetrics = renderedImages.map((image, index) => {
        const rect = image.getBoundingClientRect();
        const top = rect.top - contentRect.top + contentList.scrollTop;
        const rawImageOrder = Number(image.dataset.imageOrder);
        const mappedSortedImageIndex =
          Number.isFinite(rawImageOrder) && imageOrderToSortedIndex.has(rawImageOrder)
            ? imageOrderToSortedIndex.get(rawImageOrder)
            : undefined;
        const sortedImageIndex = Math.min(
          Math.max(0, mappedSortedImageIndex ?? index),
          sortedImages.length - 1,
        );

        return {
          image,
          index,
          sortedImageIndex,
          top,
          bottom: top + rect.height,
          center: top + rect.height / 2,
          height: rect.height,
        };
      });

      const sortedHeights = imageMetrics
        .map((metric) => metric.height)
        .filter((height) => Number.isFinite(height) && height > 0)
        .sort((a, b) => a - b);
      const medianHeight =
        sortedHeights.length > 0
          ? sortedHeights[Math.floor(sortedHeights.length / 2)]
          : 0;
      const maxHeight = sortedHeights.length > 0 ? sortedHeights[sortedHeights.length - 1] : 0;

      const isLikelyPanelMetric = (metric?: (typeof imageMetrics)[number]) => {
        if (!metric) {
          return false;
        }

        return (
          metric.height > 0 &&
          (
            (medianHeight > 0 && metric.height < medianHeight * 0.9) ||
            (maxHeight > 0 && metric.height < maxHeight * 0.82)
          )
        );
      };
      const imageSizeCache = getImageMemoryCacheSize();
      const preferredCandidateOffsets = [0, 1, -1];

      const viewportAnchor = targetScrollTop;
      const compareCandidateOffset = (a: number, b: number) => {
        const aPriority = preferredCandidateOffsets.indexOf(a);
        const bPriority = preferredCandidateOffsets.indexOf(b);

        if (aPriority !== -1 || bPriority !== -1) {
          if (aPriority === -1) return 1;
          if (bPriority === -1) return -1;
          return aPriority - bPriority;
        }

        const absDiff = Math.abs(a) - Math.abs(b);
        if (absDiff !== 0) {
          return absDiff;
        }

        return a - b;
      };

      const candidateMetrics = imageMetrics
        .map((metric) => {
          const imageMeta = sortedImages[metric.sortedImageIndex];
          const imagePath = getPlayerImageCachePath(imageMeta);
          const fileSize =
            imagePath && imageSizeCache.has(imagePath)
              ? imageSizeCache.get(imagePath) ?? null
              : null;
          const preferredOffset = metric.sortedImageIndex - preferredImageIndex;
          const rangeDistance =
            viewportAnchor < metric.top
              ? metric.top - viewportAnchor
              : viewportAnchor >= metric.bottom
                ? viewportAnchor - metric.bottom
                : 0;
          const viewportDistance = Math.abs(metric.center - viewportAnchor);

          return {
            ...metric,
            fileSize,
            preferredOffset,
            rangeDistance,
            viewportDistance,
          };
        })
        .sort((a, b) => {
          const rangeComparison = a.rangeDistance - b.rangeDistance;
          if (rangeComparison !== 0) {
            return rangeComparison;
          }

          const offsetComparison = compareCandidateOffset(a.preferredOffset, b.preferredOffset);
          if (offsetComparison !== 0) {
            return offsetComparison;
          }

          const viewportComparison = a.viewportDistance - b.viewportDistance;
          if (viewportComparison !== 0) {
            return viewportComparison;
          }

          return a.sortedImageIndex - b.sortedImageIndex;
        });
      const uniqueCandidateMetrics = candidateMetrics.filter((metric, index, array) => {
        return array.findIndex((item) => item.sortedImageIndex === metric.sortedImageIndex) === index;
      });

      const candidateFileSizes = uniqueCandidateMetrics
        .map((metric) => metric.fileSize)
        .filter((size): size is number => size != null && Number.isFinite(size) && size > 0);
      const maxCandidateFileSize = candidateFileSizes.length > 0 ? Math.max(...candidateFileSizes) : 0;
      const hasMeaningfulFileSizeSignals = candidateFileSizes.length > 0 && maxCandidateFileSize > 0;
      const isLikelyPanelByFileSize = (fileSize: number | null) => {
        if (!Number.isFinite(fileSize) || fileSize === null || fileSize <= 0 || maxCandidateFileSize <= 0) {
          return false;
        }

        return fileSize < Math.max(2_048, maxCandidateFileSize * 0.12);
      };
      const sceneOrderedMetrics = [...uniqueCandidateMetrics].sort((a, b) => {
        const indexDiff = a.sortedImageIndex - b.sortedImageIndex;
        if (indexDiff !== 0) {
          return indexDiff;
        }

        return a.top - b.top;
      });
      const exactTargetMetric = sceneOrderedMetrics.find((metric) => metric.rangeDistance === 0);
      const edgeBiasedTargetMetric = (() => {
        if (!exactTargetMetric || exactTargetMetric.height <= 0) {
          return exactTargetMetric;
        }

        const previousMetric = [...sceneOrderedMetrics]
          .reverse()
          .find((metric) => metric.sortedImageIndex < exactTargetMetric.sortedImageIndex);
        const nextMetric = sceneOrderedMetrics.find(
          (metric) => metric.sortedImageIndex > exactTargetMetric.sortedImageIndex,
        );

        if (
          previousMetric &&
          shouldPreferAdjacentSceneThumbnail({
            requestedMs: holeStartMs,
            markers,
            currentSceneHeight: exactTargetMetric.height,
            currentSceneIndex: exactTargetMetric.sortedImageIndex,
            adjacentSceneIndex: previousMetric.sortedImageIndex,
            direction: "previous",
          })
        ) {
          return previousMetric;
        }

        if (
          nextMetric &&
          shouldPreferAdjacentSceneThumbnail({
            requestedMs: holeStartMs,
            markers,
            currentSceneHeight: exactTargetMetric.height,
            currentSceneIndex: exactTargetMetric.sortedImageIndex,
            adjacentSceneIndex: nextMetric.sortedImageIndex,
            direction: "next",
          })
        ) {
          return nextMetric;
        }

        const metricProgress = (viewportAnchor - exactTargetMetric.top) / exactTargetMetric.height;
        const distanceFromTop = viewportAnchor - exactTargetMetric.top;
        const remainingDistance = exactTargetMetric.bottom - viewportAnchor;
        const edgeSceneProgressThreshold = 0.62;
        const edgeSceneDistanceThreshold = Math.min(340, exactTargetMetric.height * 0.4);
        const previousSceneProgressThreshold = 0.08;
        const previousSceneDistanceThreshold = Math.min(90, exactTargetMetric.height * 0.12);

        if (
          !isSnappedBackwardToSceneStart &&
          previousMetric &&
          metricProgress <= previousSceneProgressThreshold &&
          distanceFromTop <= previousSceneDistanceThreshold
        ) {
          return previousMetric;
        }

        if (
          metricProgress < edgeSceneProgressThreshold &&
          remainingDistance > edgeSceneDistanceThreshold
        ) {
          return exactTargetMetric;
        }

        return nextMetric ?? exactTargetMetric;
      })();

      const matchedMetric =
        edgeBiasedTargetMetric ??
        (hasMeaningfulFileSizeSignals
          ? uniqueCandidateMetrics.find((metric) => !isLikelyPanelByFileSize(metric.fileSize))
          : undefined) ??
        (hasMeaningfulFileSizeSignals
          ? [...uniqueCandidateMetrics]
              .filter((metric) => Number.isFinite(metric.fileSize) && (metric.fileSize ?? 0) > 0)
              .sort((a, b) => (b.fileSize ?? 0) - (a.fileSize ?? 0))[0]
          : undefined) ??
        uniqueCandidateMetrics.find((metric) => !isLikelyPanelMetric(metric)) ??
        uniqueCandidateMetrics[0];

      const renderedSrc = matchedMetric?.image.currentSrc || matchedMetric?.image.src || "";
      if (renderedSrc.trim() && !renderedSrc.startsWith("data:")) {
        return renderedSrc;
      }
    }
  }

  const image = sortedImages[preferredImageIndex] ?? sortedImages[0];
  const path = getPlayerImageCachePath(image);
  const cachedImageUrl = path ? getImageMemoryCache().get(path) : undefined;
  const resolvedUrl = image ? ImageHelper.getImageUrl(image) : "";
  return cachedImageUrl || (resolvedUrl ? getFetchUrl(resolvedUrl) : null);
}

const PlayerContent = forwardRef<PlayerContentRef, PlayerContentProps>(
  ({
    seriesId = 0,
    episodeId = 0,
    version = "V0",
    backHref,
    title = "",
    subtitle = "",
    showExperienceEntry = false,
    userHasLoan = null,
    currentPlayerKey,
    recordingReadOnly = false,
    adminPreviewMode = false,
  }, ref) => {
    const navigate = useNavigate();
    const router = useMemo(() => ({
      push: (p: string) => navigate(p),
      replace: (p: string) => navigate(p, { replace: true }),
      back: () => navigate(-1)
    }), [navigate]);

    const playerStoreLoading = usePlayerStore((s) => s.loading);
    const setPlayerStoreLoading = usePlayerStore((s) => s.setLoading);
    const handleStoreControl = usePlayerStore((s) => s.handleControl);
    const playerStoreContent = usePlayerStore((s) => s.content);
    const isClearText = usePlayerStore((s) => s.isClearText);
    const isMuted = usePlayerStore((s) => s.isMuted);
    const setEpisodeListOpen = usePlayerStore((s) => s.setEpisodeListOpen);
    const showSnackBar = useGlobalSnackBarStore((s) => s.showSnackBar);
    /** 스토어 부분 갱신 시 content 참조만 바뀌는 경우 effect 무한 루프 방지 */
    const playerContentIdentityKey = usePlayerStore((s) => {
      const c = s.content;
      if (!c?.images?.length) return "";
      const img0 = String(c.images[0]?.uuid ?? "");
      const nImg = c.images.length;
      const nTracks = c.tracks?.length ?? 0;
      const nHoles =
        c.tracks?.reduce((acc, t) => acc + (t.holes?.length ?? 0), 0) ?? 0;
      return `${img0}|${nImg}|${nTracks}|${nHoles}|${String(c.format_version ?? "")}`;
    });

    const [searchParams] = useSearchParams();
    const urlEpisodeId = useMemo(() => {
      const raw = searchParams.get("episodeId");
      return raw ? Number(raw) : 0;
    }, [searchParams]);

    const playerSeriesEpisodeNav = usePlayerStore((s) => s.playerSeriesEpisodeNav);
    const isEpisodeListOpen = usePlayerStore((s) => s.isEpisodeListOpen);
    const playerContentSpoints = usePlayerStore((s) => s.content?.spoints ?? EMPTY_SPOINTS);
    const localRecordings = useRecordingStore((s) => s.recordings);
    const serverRecordingsByHoleUuid = useRecordingStore((s) => s.serverRecordingsByHoleUuid);

    const { headerTitle, headerSubtitle } = useMemo(() => {
      const eid = episodeId > 0 ? episodeId : urlEpisodeId;
      const items = playerSeriesEpisodeNav?.items;
      const item =
        items && items.length > 0 && Number.isFinite(eid) && eid > 0
          ? items.find((i) => i.id === eid)
          : undefined;
      if (item) {
        const chapterLine = chapterLabelForEpisodeListItem(item);
        const rawName = item.title.trim() || `회차 ${item.id}`;
        let epName = stripDuplicateChapterLabelFromTitle(rawName, chapterLine);
        if (!epName && rawName !== chapterLine) epName = rawName;
        /** `PLAYER_HEADER_META` 등 부모가 `체험하기 : …` 형태로 넘긴 경우에만 동일 접두 유지 */
        const useExperienceSubtitlePrefix = /체험하기\s*:/.test(subtitle);
        const sub =
          useExperienceSubtitlePrefix && epName
            ? `체험하기 : ${epName}`
            : epName;
        return { headerTitle: chapterLine, headerSubtitle: sub };
      }
      return { headerTitle: title, headerSubtitle: subtitle };
    }, [playerSeriesEpisodeNav, episodeId, urlEpisodeId, title, subtitle]);

    /** 녹음 로컬 스토리지·setupVoice loadRecordings 키 — props가 0일 때 URL 쿼리 사용 */
    const resolvedRecordingEpisodeId = episodeId || urlEpisodeId;

    // playerStore에서 직접 사용
    // isClearText와 isMuted는 위에서 훅스로 선언됨

    // Custom Hook으로 모든 state와 ref 관리
    const state = usePlayerState();

    // Destructure for convenience (기존 코드와 호환성 유지)
    const {
      setIsAutoPlay,
      isPlaying, setIsPlaying,
      setIsPaused,
      loadedImagesCount, setLoadedImagesCount,
      loadedClearTextImagesCount, setLoadedClearTextImagesCount,
      showContent, setShowContent,
      toonBoxRef,
      clearTextToonBoxRef,
      baseToonWorkRef,
      clearTextBaseToonWorkRef,
      scrollPositionRef,
      isScrollSyncEnabled,
      overlayRef,
      totalImagesRef,
      totalClearTextImagesRef,
      showContentTimeoutRef,
      autoPlayAttemptedRef,
      toonWorkCleanupRef,
      prevSeriesIdRef,
      prevEpisodeIdRef,
      dataLoadRequestedRef,
      isPreloading,
      setIsPreloading,
      preloadProgress,
      setPreloadProgress,
    } = state;

    const [immersivePeekVisible, setImmersivePeekVisible] = useState(false);
    /** 모바일에서 touch + click 이중 발생 시 피크가 토글 두 번 되지 않도록 */
    const immersiveTapLockRef = useRef(0);

    // loadedImagesCount를 ref로도 유지하여 클로저 문제 해결
    const loadedImagesCountRef = React.useRef(loadedImagesCount);
    React.useEffect(() => {
      loadedImagesCountRef.current = loadedImagesCount;
    }, [loadedImagesCount]);

    // sessionStorage에서 정주행 모드 상태 읽기 (UI 표시용)
    useEffect(() => {
      const updateAutoPlayState = () => {
        setIsAutoPlay(sessionStorage.getItem('isAutoPlay') === 'true');
      };

      // 초기값 설정
      updateAutoPlayState();

      // storage 이벤트 리스너 (다른 탭에서 변경 시)
      window.addEventListener('storage', updateAutoPlayState);

      // 주기적으로 확인 (같은 탭 내에서 변경 시)
      const interval = setInterval(updateAutoPlayState, 100);

      return () => {
        window.removeEventListener('storage', updateAutoPlayState);
        clearInterval(interval);
      };
    }, [setIsAutoPlay]);

    // useToonWork의 progress 업데이트를 preloadProgress와 통합 (percentage 기반)
    const handleProgressUpdate = useCallback((progress: { step: string; percentage: number }) => {
      setPreloadProgress(progress);
    }, [setPreloadProgress]);

    const handlePlaybackComplete = useCallback(async () => {
      playerLogger.log("[PlayerContent] Playback complete");

      // sessionStorage에서 직접 읽기
      const isAutoPlay = sessionStorage.getItem('isAutoPlay') === 'true';
      const isInitAutoPlay = sessionStorage.getItem('isInitAutoPlay') === 'true';

      playerLogger.log("[PlayerContent] 정주행 모드 상태:", {
        isAutoPlay,
        isInitAutoPlay,
      });

      // vogopang: 단일 콘텐츠라 다음 회차 없음.
      if (isAutoPlay) {
        playerLogger.log("[PlayerContent] 재생 완료 (vogopang 단일 콘텐츠)");
      } else {
        playerLogger.log("[PlayerContent] 재생 완료");
      }
    }, []);

    // 버전에 따라 다른 훅 사용
    const toonWork = useToonWork({
      version: version as ContentVersion,
      site: 'edu',
      recordingEpisodeId: resolvedRecordingEpisodeId,
      onComplete: handlePlaybackComplete,
      onProgressUpdate: handleProgressUpdate,
    });

    const pendingMarkerPlayStartMsRef = useRef<number | null>(null);

    // 플레이어 컨트롤 Hook (handleStop, handleControl, handlePlayClick)
    const { handleStop, handleControl, handlePlayClick } = usePlayerControls({
      currentPlayerKey,
      currentEpisodeId: episodeId,
      toonWork,
      toonWorkCleanupRef,
      playerStoreLoading,
      handleStoreControl,
      setIsPlaying,
      setIsPaused,
      loadedImagesCount,
      totalImagesRef,
    });

    // 미대출 상태에서 다음화/이전화 이동 차단
    const handleControlGuarded = useCallback(
      async (type: PlayerControlType, options?: unknown) => {
        if (
          userHasLoan === false &&
          (type === PlayerControlType.next || type === PlayerControlType.prev)
        ) {
          showSnackBar("대출 이후 열람이 가능합니다.");
          return;
        }
        return handleControl(type, options);
      },
      [userHasLoan, showSnackBar, handleControl],
    );

    const immersiveChromeHidden = isPlaying && showContent;

    useEffect(() => {
      setImmersivePeekVisible(false);
    }, [isPlaying]);

    const handleImmersiveTap = useCallback(() => {
      const now = Date.now();
      if (now - immersiveTapLockRef.current < 450) {
        return;
      }
      immersiveTapLockRef.current = now;
      setImmersivePeekVisible((v) => !v);
    }, []);

    const handleImmersivePause = useCallback(async () => {
      setImmersivePeekVisible(false);
      await handleControlGuarded(PlayerControlType.pause);
    }, [handleControlGuarded]);

    const handleImmersiveMute = useCallback(() => {
      void handleControlGuarded(PlayerControlType.muted);
    }, [handleControlGuarded]);

    // useImperativeHandle로 부모 컴포넌트에서 호출할 수 있는 함수 노출
    useImperativeHandle(
      ref,
      () => ({
        handleStop,
      }),
      [handleStop]
    );

    // Keep toonWorkCleanupRef updated with latest toonWork
    useEffect(() => {
      toonWorkCleanupRef.current = toonWork;
    }, [toonWork, toonWorkCleanupRef]);

    /** Next 라우팅 언마운트 시 부모 ref cleanup보다 먼저 재생·오디오 정리 */
    useEffect(() => {
      return () => {
        const tw = toonWorkCleanupRef.current;
        if (!tw) return;
        void (async () => {
          try {
            if (!tw.isStop) {
              await tw.stop();
            }
            await tw.cleanup();
          } catch (e) {
            playerLogger.warn("[PlayerContent] 언마운트 시 정리 실패", e);
          }
        })();
      };
    }, [toonWorkCleanupRef]);

    // 플레이어 초기화 Hook (티켓 기반 데이터 로드 및 toonWork 초기화)
    usePlayerInitialization({
      seriesId,
      episodeId,
      prevSeriesIdRef,
      prevEpisodeIdRef,
      dataLoadRequestedRef,
      toonWorkCleanupRef,
      totalImagesRef,
      totalClearTextImagesRef,
      autoPlayAttemptedRef,
      setIsPlaying,
      setIsPaused,
      setLoadedImagesCount,
      setLoadedClearTextImagesCount,
      setShowContent,
      setIsPreloading,
      setPreloadProgress,
      playerContentIdentityKey,
      toonWork,
    });

    // 티켓 기반 데이터 로드 및 초기화는 usePlayerInitialization에서 처리

    // Monitor loadingCount and update loading state
    // (비동기 리소스 로딩이 initializeVoiceToon 완료 후에도 진행될 수 있으므로 추가 모니터링)
    useEffect(() => {
      // 조건 1: 초기화가 완료되어야 함
      const initializationComplete = !toonWork.isInitializing;

      // 조건 2: loadingCount === 0 (오디오 + 보이스 로딩 완료)
      const allResourcesLoaded = toonWork.loadingCount === 0;

      // 조건 3: 두 레이어의 모든 이미지가 렌더링 완료되어야 함
      // 모든 리소스가 준비됨
      const isReady =
        initializationComplete &&
        allResourcesLoaded &&
        !playerStoreLoading;

      // 모든 조건이 만족되면 로딩 완료
      if (initializationComplete && allResourcesLoaded && playerStoreLoading) {
        setPlayerStoreLoading(false);

        // 이미지가 모두 로드되었으므로 즉시 컨텐츠 표시
        setShowContent(true);
        if (showContentTimeoutRef.current) {
          clearTimeout(showContentTimeoutRef.current);
          showContentTimeoutRef.current = null;
        }

        // 화면 크기 재계산 (reload 시 정확한 계산을 위한 안전장치)
        playerLogger.log('[PlayerContent] 리소스 로딩 완료 - 화면 크기 최종 재계산');
        toonWork.handleResize();
      }

      // 정주행 모드로 다음 화로 넘어온 경우 모든 리소스 준비되면 자동 재생 (한 번만)
      // isPendingPlay가 true이면 사용자가 재생 버튼을 눌렀으므로 중복 재생 방지
      if (isReady && !isPlaying && !autoPlayAttemptedRef.current) {
        const isAutoPlayMode = sessionStorage.getItem('isAutoPlay') === 'true';

        if (isAutoPlayMode) {
          playerLogger.log(
            "[PlayerContent] 정주행 모드 - 리소스 준비 완료, 자동 재생 시작"
          );
          autoPlayAttemptedRef.current = true; // 플래그 설정으로 재시도 방지
          handleControl(PlayerControlType.play);
        }
      }
    }, [
      toonWork.isInitializing,
      toonWork.loadingCount,
      loadedImagesCount,
      loadedClearTextImagesCount,
      playerStoreLoading,
      toonWork.initializationProgress,
      isPlaying,
      handleControl,
      autoPlayAttemptedRef,
      totalImagesRef,
      totalClearTextImagesRef,
      seriesId,
      setShowContent,
      showContentTimeoutRef,
      toonWork,
    ]);

    // visibilitychange 이벤트 핸들러: 화면을 벗어날 경우 재생 중지, 복귀 시 상태 복구
    useEffect(() => {
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          // 백그라운드로 전환될 때
          if (isPlaying) {
            playerLogger.log("[PlayerContent] 화면 숨김 감지 -> 재생 중지");
            handleControl(PlayerControlType.stop);
          }
        } else {
          // 포그라운드로 복귀할 때 - Proactive Resume
          playerLogger.log("[PlayerContent] 화면 복귀 감지 - AudioContext 복구 시작");
          try {
            const Tone = await import("tone");

            // AudioContext 상태 확인
            playerLogger.log("[PlayerContent] 현재 AudioContext 상태:", Tone.getContext().state);

            // suspended 상태면 즉시 resume 시도
            const contextState = Tone.getContext().state as AudioContextState;
            if (contextState === "suspended") {
              playerLogger.log("[PlayerContent] AudioContext suspended 감지 - 즉시 resume 시도");

              try {
                await Tone.getContext().resume();
                playerLogger.log("[PlayerContent] AudioContext resume 완료, 상태:", Tone.getContext().state);

                // resume 후에도 running이 아니면 재시도
                let retryCount = 0;
                while (retryCount < 5) {
                  const currentState = Tone.getContext().state as AudioContextState;
                  if (currentState === "running") {
                    playerLogger.log("[PlayerContent] AudioContext 복구 성공");
                    break;
                  }

                  playerLogger.log(`[PlayerContent] resume 재시도 ${retryCount + 1}/5`);
                  await new Promise(resolve => setTimeout(resolve, 200));
                  await Tone.getContext().resume();
                  retryCount++;
                }

                const finalState = Tone.getContext().state as AudioContextState;
                if (finalState !== "running") {
                  playerLogger.warn("[PlayerContent] AudioContext가 running 상태가 되지 않음:", finalState);
                }
              } catch (resumeError) {
                playerLogger.error("[PlayerContent] AudioContext resume 실패:", resumeError);
              }
            } else if (contextState === "closed") {
              playerLogger.error("[PlayerContent] AudioContext가 closed 상태입니다. 페이지 새로고침이 필요할 수 있습니다.");
            } else {
              playerLogger.log("[PlayerContent] AudioContext 상태 정상:", contextState);
            }
          } catch (error) {
            playerLogger.error(
              "[PlayerContent] visibilitychange 복귀 처리 중 오류:",
              error
            );
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }, [isPlaying, handleControl]);

    // Assign toonWorkRef - isClearText에 따라 적절한 ref 할당
    useEffect(() => {
      if (isClearText && clearTextBaseToonWorkRef.current) {
        toonWork.toonWorkRef.current = clearTextBaseToonWorkRef.current;
      } else if (!isClearText && baseToonWorkRef.current) {
        toonWork.toonWorkRef.current = baseToonWorkRef.current;
      }
    }, [isClearText, baseToonWorkRef, clearTextBaseToonWorkRef, toonWork]);

    // 초기 로드 시 스크롤 동기화 및 isClearText 변경 시 스크롤 복원은 useScrollSync에서 처리

    // 이미지 우클릭 방지 및 드래그 방지
    useEffect(() => {
      const handleContextMenu = (e: MouseEvent) => {
        // 이미지에 대한 우클릭 방지
        if (e.target instanceof HTMLImageElement) {
          e.preventDefault();
          return false;
        }
      };

      const handleDragStart = (e: DragEvent) => {
        // 이미지 드래그 방지
        if (e.target instanceof HTMLImageElement) {
          e.preventDefault();
          return false;
        }
      };

      const handleSelectStart = (e: Event) => {
        // 이미지 선택 방지
        if (e.target instanceof HTMLImageElement) {
          e.preventDefault();
          return false;
        }
      };

      // 전역 이벤트 리스너 등록
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("dragstart", handleDragStart);
      document.addEventListener("selectstart", handleSelectStart);

      return () => {
        // 이벤트 리스너 정리
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("dragstart", handleDragStart);
        document.removeEventListener("selectstart", handleSelectStart);
      };
    }, []);
    // 이미지 전환 시 스크롤 위치는 자동으로 동기화되어 있으므로 별도 처리 불필요
    // 두 레이어가 항상 동일한 스크롤 위치를 유지함

    // 이미지 로딩 Hook
    const { getImageUrl, getImageKey, handleImageLoad, handleClearTextImageLoad } = useImageLoading({
      version,
      totalImagesRef,
      totalClearTextImagesRef,
      baseToonWorkRef,
      clearTextBaseToonWorkRef,
      loadedImagesCount,
      setLoadedImagesCount,
      loadedClearTextImagesCount,
      setLoadedClearTextImagesCount,
      toonWorkHandleResize: toonWork.handleResize,
    });

    // Overlay의 passive 이벤트 리스너 경고 해결
    useEffect(() => {
      const overlayElement = overlayRef.current;
      if (!overlayElement || !isPlaying) return;

      const preventDefaultAndStopPropagation = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleTouchEnd = (e: TouchEvent) => {
        handleControl(PlayerControlType.touch);
        preventDefaultAndStopPropagation(e);
      };

      const handleMouseDown = (e: MouseEvent) => {
        preventDefaultAndStopPropagation(e);
      };

      const handleWheel = (e: WheelEvent) => {
        preventDefaultAndStopPropagation(e);
      };

      const handleScroll = (e: Event) => {
        preventDefaultAndStopPropagation(e);
      };

      // Passive: false 로 이벤트 리스너 등록
      // 'touchmove'는 일반적으로 스크롤 방지에 사용되나, 여기서는 이미 touch-action: manipulation이 적용된 것으로 보임.
      // 'touchstart', 'touchend', 'wheel', 'mousedown', 'scroll'에 대해 preventDefault가 필요한 경우 명시적으로 passive: false 설정.
      overlayElement.addEventListener(
        "touchstart",
        preventDefaultAndStopPropagation,
        { passive: false }
      );
      overlayElement.addEventListener("touchend", handleTouchEnd, {
        passive: false,
      });
      overlayElement.addEventListener("mousedown", handleMouseDown, {
        passive: false,
      });
      overlayElement.addEventListener("wheel", handleWheel, { passive: false });
      overlayElement.addEventListener("scroll", handleScroll, {
        passive: false,
      });

      return () => {
        overlayElement.removeEventListener(
          "touchstart",
          preventDefaultAndStopPropagation
        );
        overlayElement.removeEventListener("touchend", handleTouchEnd);
        overlayElement.removeEventListener("mousedown", handleMouseDown);
        overlayElement.removeEventListener("wheel", handleWheel);
        overlayElement.removeEventListener("scroll", handleScroll);
      };
    }, [isPlaying, handleControl, overlayRef]);

    // 로딩바에 표시할 진행률 및 메시지 계산 (프리로드 + 초기화 통합)
    const isLoading = isPreloading || toonWork.isInitializing;
    const getLoadingProgress = () => {
      // percentage 기반으로 직접 반환 (0-100%)
      if (preloadProgress.percentage !== undefined) {
        return preloadProgress.percentage;
      }
      return null;
    };

    const getLoadingMessage = () => {
      return preloadProgress.step || '로딩 중...';
    };

    // 스크롤 동기화 Hook
    const { handleNormalScroll, handleClearTextScroll } = useScrollSync({
      toonBoxRef,
      clearTextToonBoxRef,
      scrollPositionRef,
      isScrollSyncEnabledRef: isScrollSyncEnabled,
      isClearText,
      playerStoreLoading: playerStoreLoading,
    });

    const handleVoiceModeChange = useCallback(async (enabled: boolean) => {
      if (isPlaying) {
        toonWork.stop();
        setIsPlaying(false);
        setIsPaused(false);
      }

      useRecordingStore.getState().setUseUserRecording(enabled);
      playerLogger.log("[PlayerContent] useUserRecording changed:", enabled);
      await toonWork.changeVoice();
      playerLogger.log("[PlayerContent] Voice reloaded after useUserRecording change");
    }, [isPlaying, setIsPaused, setIsPlaying, toonWork]);

    // re-fetch 트리거: 녹음 POST 후 카운터 증가 → useEffect 재실행
    const [holesFetchVersion, setHolesFetchVersion] = useState(0);
    /** `GET /holes` — `playerSeriesEpisodeNav` 없을 때 녹음 가능 여부 보조 (null: 로딩·미결정) */
    const [episodeHasServerHoles, setEpisodeHasServerHoles] = useState<boolean | null>(null);
    const [serverEpisodeHoles, setServerEpisodeHoles] = useState<EpisodeRecordingApiItem[]>([]);

    const refetchServerRecordings = useCallback(() => {
      setHolesFetchVersion((v) => v + 1);
    }, []);

    const localContentHoleCount = useMemo(() => {
      const c = playerStoreContent;
      if (!c?.tracks?.length) return 0;
      return collectHolesFromContent(c).length;
    }, [playerStoreContent]);

    const supportsMyVoiceRecordingEntry = useMemo(
      () =>
        shouldShowPlayerMyVoiceRecordingEntry({
          showExperienceEntry,
          episodeNumericId: resolvedRecordingEpisodeId,
          navItems: playerSeriesEpisodeNav?.items,
          episodeHasServerHoles,
          localContentHoleCount,
        }),
      [
        showExperienceEntry,
        resolvedRecordingEpisodeId,
        playerSeriesEpisodeNav?.items,
        episodeHasServerHoles,
        localContentHoleCount,
      ],
    );

    const serverEpisodeHolesWithContentMeta = useMemo(() => {
      const contentHoles = (toonWork.getAllHoles?.() ?? [])
        .filter((hole) => hole?.uuid)
        .sort((a, b) => (a.start_ms ?? 0) - (b.start_ms ?? 0));

      const contentHoleByUuid = new Map<string, (typeof contentHoles)[number]>();
      const contentHoleByScript = new Map<string, (typeof contentHoles)[number]>();
      for (const hole of contentHoles) {
        for (const key of [...uuidAliasKeys(hole.uuid), ...uuidAliasKeys(hole.script_uuid)]) {
          contentHoleByUuid.set(key, hole);
        }
        const normalizedScript = normalizeHoleScript(hole.script);
        if (normalizedScript && !contentHoleByScript.has(normalizedScript)) {
          contentHoleByScript.set(normalizedScript, hole);
        }
      }

      return serverEpisodeHoles
        .map((item, index) => {
          const matchedByUuid = uuidAliasKeys(item.uuid)
            .map((key) => contentHoleByUuid.get(key))
            .find(Boolean);
          const normalizedItemScript = normalizeHoleScript(item.script);
          const contentHole =
            matchedByUuid ??
            (normalizedItemScript ? contentHoleByScript.get(normalizedItemScript) : undefined);
          return {
            item,
            holeIndex: index,
            startMs: contentHole?.start_ms ?? 0,
            durationMs: contentHole?.duration_ms,
            guideRecords: contentHole?.records ?? [],
          };
        })
        .sort((a, b) => a.startMs - b.startMs);
    }, [serverEpisodeHoles, toonWork]);

    const recordingDialogHoles = useMemo(() => {
      const imageLoadTick = loadedImagesCount;
      void imageLoadTick;
      const images = playerStoreContent?.images ?? [];
      const contentList = DOMHelper.getToonContentImageList();
      const playbackMarkers = toonWork.getMarkers?.() ?? [];
      const markers = resolvePlaybackSceneMarkers(playbackMarkers, playerContentSpoints);

      return serverEpisodeHolesWithContentMeta.map((hole) => ({
        uuid: hole.item.uuid,
        script: hole.item.script,
        start_ms: hole.startMs,
        duration_ms: hole.durationMs,
        characterName: hole.item.characterName,
        records: hole.guideRecords,
        thumbnailSrc: resolveRecordingDialogThumbnailUrl({
          holeStartMs: hole.startMs,
          spoints: playerContentSpoints,
          images,
          contentList,
          markers,
          version,
          workspaceImageScale: toonWork.workspaceOptions?.image_scale ?? 1,
          viewOffsetTop: toonWork.newViewOffsetTop(),
          calculatedWidth: toonWork.calculatedWidth,
        }),
      }));
    }, [
      loadedImagesCount,
      playerContentSpoints,
      playerStoreContent?.images,
      serverEpisodeHolesWithContentMeta,
      toonWork,
      version,
    ]);

    const handleSceneNavigate = useCallback(
      (startMs: number) => {
        if (isPlaying) {
          handleControl(PlayerControlType.pause);
        }

        const applyScroll = () => {
          const playbackMarkers = toonWork.getMarkers?.() ?? [];
          const spoints = usePlayerStore.getState().content?.spoints ?? [];
          const currentMarkers = resolvePlaybackSceneMarkers(playbackMarkers, spoints);

          if (currentMarkers.length === 0) {
            playerLogger.warn(
              "[PlayerContent] handleSceneNavigate: 마커(spoints)가 없어 스크롤할 수 없습니다.",
            );
            return;
          }

          let contentList = toonWork.getToonContentImageList();
          if (!contentList) {
            const el = document.querySelector(".toon-scroll-layer");
            contentList = el instanceof HTMLElement ? el : null;
          }

          if (!contentList) {
            playerLogger.warn(
              "[PlayerContent] handleSceneNavigate: 스크롤 컨테이너를 찾을 수 없습니다.",
            );
            return;
          }

          const targetScrollTop = resolveSceneNavigateTargetScrollTop({
            startMs,
            spoints,
            version,
            contentList,
            markers: currentMarkers,
            workspaceImageScale: toonWork.workspaceOptions?.image_scale ?? 1,
            viewOffsetTop: toonWork.newViewOffsetTop(),
            calculatedWidth: toonWork.calculatedWidth,
          });

          if (targetScrollTop === null) {
            playerLogger.warn(
              "[PlayerContent] handleSceneNavigate: 목표 스크롤 위치를 계산하지 못했습니다.",
            );
            return;
          }

          toonWork.setToonContentImageTop(targetScrollTop);
        };

        requestAnimationFrame(() => {
          requestAnimationFrame(applyScroll);
        });
      },
      [toonWork, version, isPlaying, handleControl],
    );

    const recordingMarkers = useMemo(() => {
      if (serverEpisodeHolesWithContentMeta.length === 0) {
        return [];
      }

      const recordedHoleUuids = new Set<string>();
      const appliedHoleUuids = new Set<string>();
      for (const recording of localRecordings) {
        if (recording.holeUuid) {
          recordedHoleUuids.add(recording.holeUuid);
          if (recording.isApply) {
            appliedHoleUuids.add(recording.holeUuid);
          }
        }
      }
      for (const [holeUuid, recording] of Object.entries(serverRecordingsByHoleUuid)) {
        if (isUsableRecordingSrc(recording?.src)) {
          recordedHoleUuids.add(holeUuid);
          appliedHoleUuids.add(holeUuid);
        }
      }

      const maxTimelineMs = Math.max(
        1,
        ...serverEpisodeHolesWithContentMeta.map((hole) => hole.startMs ?? 0),
        ...playerContentSpoints.map((spoint) => spoint.time_ms ?? 0),
      );

      return serverEpisodeHolesWithContentMeta.map((hole) => ({
        holeUuid: hole.item.uuid,
        holeIndex: hole.holeIndex,
        startMs: hole.startMs,
        positionRatio: resolveRecordingMarkerPositionRatio(hole.startMs, maxTimelineMs),
        isRecorded:
          recordedHoleUuids.has(hole.item.uuid) ||
          isUsableRecordingSrc(hole.item.records?.src),
        isApplied:
          appliedHoleUuids.has(hole.item.uuid) ||
          isUsableRecordingSrc(hole.item.records?.src),
      }));
    }, [
      localRecordings,
      playerContentSpoints,
      serverEpisodeHolesWithContentMeta,
      serverRecordingsByHoleUuid,
    ]);

    const immersivePeekBottomOffset = useMemo(
      () =>
        getPlayerImmersivePeekBottomOffset({
          isDesktop: toonWork.calculatedWidthCustom > 768,
          hasRecordingStrip: recordingMarkers.length > 0,
          isEpisodeListOpen,
        }),
      [
        toonWork.calculatedWidthCustom,
        recordingMarkers.length,
        isEpisodeListOpen,
      ],
    );

    useEffect(() => {
      if (import.meta.env.MODE !== "development" || serverEpisodeHolesWithContentMeta.length === 0) {
        return;
      }

      console.log(
        "[PlayerContent] hole-marker-mapping",
        serverEpisodeHolesWithContentMeta.map((hole, index) => {
          const marker = recordingMarkers.find((item) => item.holeUuid === hole.item.uuid);
          return {
            order: index + 1,
            apiHoleId: hole.item.id,
            uuid: hole.item.uuid,
            script: hole.item.script,
            startMs: hole.startMs,
            durationMs: hole.durationMs ?? null,
            positionRatio: marker?.positionRatio ?? null,
            isRecorded: marker?.isRecorded ?? false,
          };
        }),
      );
    }, [recordingMarkers, serverEpisodeHolesWithContentMeta]);

    const handleRecordingMarkerSelect = useCallback(
      (startMs: number) => {
        const spoints = usePlayerStore.getState().content?.spoints ?? [];
        pendingMarkerPlayStartMsRef.current = resolvePreviousScenePlaybackStartMs(startMs, spoints);
        handleSceneNavigate(startMs);
      },
      [handleSceneNavigate],
    );

    const handleDialogSceneNavigate = useCallback(
      (startMs: number) => {
        pendingMarkerPlayStartMsRef.current = null;
        handleSceneNavigate(startMs);
      },
      [handleSceneNavigate],
    );

    const handlePlayClickWithPending = useCallback(() => {
      const pendingStartMs = pendingMarkerPlayStartMsRef.current;
      pendingMarkerPlayStartMsRef.current = null;

      if (typeof pendingStartMs === "number") {
        handlePlayClick({ startMs: pendingStartMs });
        return;
      }

      handlePlayClick();
    }, [handlePlayClick]);

    // 서버에 저장된 마이 보이스 메타를 hole.uuid 기준으로 매핑 (API 실패 시 빈 맵)
    useEffect(() => {
      const content = usePlayerStore.getState().content;
      if (!content?.tracks?.length) {
        setEpisodeHasServerHoles(false);
        setServerEpisodeHoles([]);
        useRecordingStore.getState().setServerRecordings({}, {});
        return;
      }

      if (!resolvedRecordingEpisodeId) {
        setEpisodeHasServerHoles(collectHolesFromContent(content).length > 0);
        setServerEpisodeHoles([]);
        useRecordingStore.getState().setServerRecordings({}, {});
        return;
      }

      const navHasItems = Boolean(
        usePlayerStore.getState().playerSeriesEpisodeNav?.items?.length,
      );
      if (!navHasItems) {
        setEpisodeHasServerHoles(null);
      }

      let cancelled = false;
      setServerEpisodeHoles([]);
      useRecordingStore.getState().setServerRecordings({}, {});

      void (async () => {
        try {
          const holes = collectHolesFromContent(content);
          const res = await fetchEpisodeRecordings(resolvedRecordingEpisodeId);
          if (cancelled) return;
          const apiHoleRows = res.data?.items ?? [];
          setServerEpisodeHoles(apiHoleRows);
          if (!navHasItems) {
            setEpisodeHasServerHoles(apiHoleRows.length > 0);
          }
          const { recordingsByHoleUuid, serverHoleIdByHoleUuid } =
            buildServerRecordingMapsByHoleUuid(holes, apiHoleRows);
          useRecordingStore
            .getState()
            .setServerRecordings(recordingsByHoleUuid, serverHoleIdByHoleUuid);

          const storeState = useRecordingStore.getState();
          const serverCount = Object.keys(recordingsByHoleUuid).length;
          const hasLocalApplied = storeState.getAppliedRecordings().length > 0;
          // 서버가 아직 비어 있어도 로컬「적용」이 있으면 마이 보이스 유지 + 올바른 episode 키로 loadRecordings
          if (storeState.useUserRecording || serverCount > 0) {
            storeState.setUseUserRecording(serverCount > 0 || hasLocalApplied);
            await toonWork.changeVoice();
          }
        } catch (e) {
          playerLogger.warn("[PlayerContent] 에피소드 녹음 목록 로드 실패:", e);
          if (!cancelled) {
            setServerEpisodeHoles([]);
            useRecordingStore.getState().setServerRecordings({}, {});
            if (!navHasItems) {
              setEpisodeHasServerHoles(false);
            }
          }
        }
      })();

      return () => {
        cancelled = true;
      };
      // toonWork는 훅 반환 객체로 참조가 자주 바뀔 수 있어 deps에 넣지 않음(changeVoice만 사용)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 위 이유
    }, [resolvedRecordingEpisodeId, playerContentIdentityKey, holesFetchVersion]);

    const handleEpisodeFromList = useCallback(
      (item: PlayerEpisodeListItem) => {
        if (userHasLoan === false) {
          showSnackBar("대출 이후 열람이 가능합니다.");
          return;
        }
        setEpisodeListOpen(false);
        const nav = usePlayerStore.getState().playerSeriesEpisodeNav;
        const sid = nav?.seriesId ?? seriesId;
        if (sid > 0 && Number.isFinite(item.id)) {
          router.push(
            `/player/${currentPlayerKey}?seriesId=${sid}&episodeId=${item.id}`,
          );
        }
      },
      [userHasLoan, showSnackBar, router, setEpisodeListOpen, currentPlayerKey, seriesId],
    );

    const handleEpisodeListButtonClick = useCallback(async () => {
      if (userHasLoan === false) {
        showSnackBar("대출 이후 열람이 가능합니다.");
        return;
      }

      await handleControlGuarded(PlayerControlType.list);
    }, [userHasLoan, showSnackBar, handleControlGuarded]);

    // 개별 홀 녹음 POST 성공 시 호출 — 서버 데이터 재조회
    const handleRecordingSaved = useCallback(() => {
      refetchServerRecordings();
    }, [refetchServerRecordings]);

    return (
      <>
        {/*프리로드 + 초기화 통합 로딩 오버레이*/}
        {isLoading && (
          <PlayerLoadingbar
            loading={true}
            progress={getLoadingProgress()}
            message={getLoadingMessage()}
            fullscreen={true}
            zIndex={9999}
          />
        )}
        <div className="viewer-layout">
          {!playerStoreLoading && (
            <div
              className={clsx(
                "viewer-header",
                immersiveChromeHidden && "is-chrome-hidden",
              )}
            >
              <PlayerHeader
                backHref={backHref}
                title={headerTitle}
                subtitle={headerSubtitle}
                showExperienceEntry={showExperienceEntry}
                hideNavigationButtons={adminPreviewMode}
              />
            </div>
          )}
          <PlayerViewer
            toonBoxRef={toonBoxRef}
            clearTextToonBoxRef={clearTextToonBoxRef}
            baseToonWorkRef={baseToonWorkRef}
            clearTextBaseToonWorkRef={clearTextBaseToonWorkRef}
            overlayRef={overlayRef}
            handleNormalScroll={handleNormalScroll}
            handleClearTextScroll={handleClearTextScroll}
            isClearText={isClearText}
            isPlaying={isPlaying}
            showContent={showContent}
            version={version}
            seriesId={seriesId}
            episodeId={episodeId}
            playerInfo={playerStoreContent ? { content: playerStoreContent, episode: null, clearTextImages: [] } : null}
            imageCache={getImageMemoryCache()}
            calculatedWidth={toonWork.calculatedWidth}
            workspaceOptions={toonWork.workspaceOptions}
            isStop={toonWork.isStop}
            getImageUrl={getImageUrl}
            getImageKey={getImageKey}
            handleImageLoad={handleImageLoad}
            handleClearTextImageLoad={handleClearTextImageLoad}
            onImmersiveTap={handleImmersiveTap}
          />
          {immersiveChromeHidden ? (
            <PlayerImmersivePeekOverlay
              visible={immersivePeekVisible}
              isMuted={isMuted}
              calculatedWidthCustom={toonWork.calculatedWidthCustom}
              bottomOffset={immersivePeekBottomOffset}
              onPause={handleImmersivePause}
              onMuteToggle={handleImmersiveMute}
            />
          ) : null}
        </div>
        <PlayerControls
          adminPreviewMode={adminPreviewMode}
          isPlaying={isPlaying}
          isMuted={isMuted}
          showExperienceEntry={showExperienceEntry}
          supportsMyVoiceRecordingEntry={supportsMyVoiceRecordingEntry}
          playerStoreLoading={playerStoreLoading}
          calculatedWidthCustom={toonWork.calculatedWidthCustom}
          currentEpisodeId={resolvedRecordingEpisodeId}
          recordingMarkers={recordingMarkers}
          onEpisodeSelect={handleEpisodeFromList}
          onRecordingMarkerSelect={handleRecordingMarkerSelect}
          onVoiceModeChange={handleVoiceModeChange}
          handlePlayClick={handlePlayClickWithPending}
          handleControl={handleControlGuarded}
          chromeHidden={immersiveChromeHidden}
          onListButtonClick={handleEpisodeListButtonClick}
        />
        <RecordingIntegratedDialog
          episodeId={resolvedRecordingEpisodeId}
          readOnly={recordingReadOnly}
          holes={recordingDialogHoles}
          onNavigateToScene={handleDialogSceneNavigate}
          onRecordingSaved={handleRecordingSaved}
        />
        <style>{`
          .viewer-layout {
            height: 100svh;
            min-height: 100svh;
            width: 100%;
            max-width: ${toonWork.calculatedWidth}px;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
            overflow: hidden;
          }

          .viewer-header {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translate(-50%, 0);
            z-index: 1000;
            width: 100%;
            max-width: 1280px;
            transition:
              transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.35s ease;
          }

          .viewer-header.is-chrome-hidden {
            transform: translate(-50%, calc(-100% - 8px));
            opacity: 0;
            pointer-events: none;
          }

          @media (max-width: 768px) {
            .viewer-header {
              margin: 0 auto;
            }
          }

          @media (min-width: 769px) {
            .viewer-header {
              left: 0;
              right: 0;
              max-width: none;
              width: 100%;
              transform: none;
            }

            .viewer-header.is-chrome-hidden {
              transform: translateY(calc(-100% - 8px));
            }
          }
        `}</style>
      </>
    );
  }
);

PlayerContent.displayName = "PlayerContent";

export default PlayerContent;
