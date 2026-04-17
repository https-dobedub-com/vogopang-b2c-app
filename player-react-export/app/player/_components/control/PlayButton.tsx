'use client';

import React from 'react';
import { playerIcons } from '../../playerIcons';
import styles from './PlayButton.module.scss';

interface PlayButtonProps {
  onHandleClick: () => void;
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  onHandleClick,
  className
}) => {
  return (
    <button
      type="button"
      className={`${styles.playerButton} ${className || ''}`}
      onClick={onHandleClick}
    >
      <span className={styles.iconFrame} aria-hidden>
        <img className={styles.icon} src={playerIcons.play} alt="" />
      </span>
      <span className={styles.label}>재생하기</span>
    </button>
  );
};

export default PlayButton;
