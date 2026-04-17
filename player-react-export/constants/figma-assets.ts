/**
 * Figma 에셋 로컬 경로 (public/images/figma/ 에 저장된 파일 사용)
 * 다운로드: node scripts/download-figma-assets.mjs
 * 수동 저장: scripts/figma-assets-manifest.json 의 URL에서 내려받아 같은 파일명으로 public/images/figma/ 에 넣기
 */
const BASE = "/images/figma";

export const FIGMA_ASSETS = {
  vector: `${BASE}/vector.svg`,
  workThumbnail: `${BASE}/work-thumbnail.png`,
  logoFrame: `${BASE}/logo-frame.png`,
  banner: `${BASE}/banner1.png`,
  notiIcon: `${BASE}/noti-icon.svg`,
  notiDot: `${BASE}/noti-dot.svg`,
  profileFrame: `${BASE}/profile-frame.svg`,
  footerLogo: `${BASE}/footer-logo.svg`,
  searchIcon: `${BASE}/search-icon.svg`,
  /** 검색창 검색어 삭제(X) — `public/images/figma/searchClose.png` */
  searchClose: `${BASE}/searchClose.png`,
  arrowLeft: `${BASE}/pagination-arrow-left.svg`,
  arrowRight: `${BASE}/pagination-arrow-right.svg`,
} as const;
