export const PlayerControlType = {
  casting: 0,
  autoPlay: 1,
  next: 2,
  prev: 3,
  list: 4,
  muted: 5,
  clearText: 6,
  play: 7,
  stop: 8,
  pause: 9,
  replaceImages: 10,
  touch: 11,
} as const;

export type PlayerControlType =
  (typeof PlayerControlType)[keyof typeof PlayerControlType];
