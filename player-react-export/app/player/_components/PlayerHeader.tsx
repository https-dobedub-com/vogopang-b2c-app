'use client';

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPlayerBackHref } from '../../../lib/environment';
import type { PlayerDomain } from '../../../lib/environment';
import styles from './PlayerHeader.module.scss';

const BRAND = 'edu';

interface PlayerHeaderProps {
  title: string;
  subtitle: string;
  showExperienceEntry?: boolean;
  hideNavigationButtons?: boolean;
  /** 문자열이면 해당 URL로 이동, 함수면 호출, 없으면 experience/all 기본값 */
  backHref?: string | (() => void);
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  title,
  subtitle,
  showExperienceEntry = false,
  hideNavigationButtons = false,
  backHref,
}) => {
  const navigate = useNavigate();
  const router = React.useMemo(() => ({
    push: (p: string) => navigate(p),
    replace: (p: string) => navigate(p, { replace: true }),
    back: () => navigate(-1)
  }), [navigate]);
  const location = useLocation();
  const pathname = location.pathname;
  const desktopSubtitle = showExperienceEntry
    ? subtitle.replace(/^체험하기\s*:\s*/, '')
    : subtitle;

  const goBack = () => {
    if (typeof backHref === 'function') {
      backHref();
      return;
    }
    const href = (typeof backHref === 'string' && backHref.trim())
      ? backHref
      : (() => {
          const domain: PlayerDomain = pathname?.includes('/all/') ? 'all' : 'experience';
          return getPlayerBackHref(BRAND, domain);
        })();
    if (href.startsWith('http')) {
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  const goHome = () => {
    router.push('/home');
  };

  return (
    <div className={styles.playerHeaderShell}>
      <div className={styles.playerHeader}>
        <div
          className={styles.headerLeft}
        onClick={hideNavigationButtons ? undefined : goBack}
        role={hideNavigationButtons ? undefined : "button"}
        tabIndex={hideNavigationButtons ? undefined : 0}
          onKeyDown={(e) => {
            if (hideNavigationButtons) {
              return;
            }
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goBack();
            }
          }}
        >
          {!hideNavigationButtons ? (
            <button type="button" className={styles.backButton} aria-label="뒤로가기">
              <img src="/icons/common/leftArrow.svg" alt="" />
            </button>
          ) : null}
          <div className={styles.headerText}>
            <span className={styles.mobileTitleGroup}>
              <span className={styles.titleText}>{title || ''}</span>
              <span className={styles.subtitleText}>{subtitle || ''}</span>
            </span>
            <span className={styles.desktopTitleGroup}>
              <span className={styles.titleText}>{title || ''}</span>
              <span className={styles.desktopSubtitleText}>{desktopSubtitle || ''}</span>
            </span>
          </div>
        </div>
        {!hideNavigationButtons ? (
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.homeButton}
              aria-label="홈으로 이동"
              onClick={goHome}
            >
              <img src="/icons/common/home.svg" alt="" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlayerHeader;
