import { FC } from 'react';

import './nafham-mark.styles.scss';

interface NafhamMarkProps {
  /** How tall the name is: the top bar, a panel, or a big moment */
  size?: 'sm' | 'md' | 'lg';
  /** "by Tyro" under the name, as on the logo */
  byline?: boolean;
  /** On a coloured panel: its own white tile, so the name stays on white */
  tile?: boolean;
  className?: string;
}

/**
 * The name in Arabic (24 Nov 2026): نفهم in thick, round, joined letters with
 * the logo's wave under it, baby blue with a deeper blue edge (3D), always on
 * white. Text, not a picture, so it is sharp at any size. The same word in
 * both languages: it is the brand's own spelling.
 */
const NafhamMark: FC<NafhamMarkProps> = ({
  size = 'md',
  byline = false,
  tile = false,
  className,
}) => (
  <span
    className={`nafham-mark nafham-mark--${size}${tile ? ' nafham-mark--tile' : ''} ${className ?? ''}`}
    role="img"
    aria-label="Nafham"
  >
    <span className="nafham-mark__word" lang="ar" aria-hidden="true">
      نفهم
    </span>
    <svg
      className="nafham-mark__wave"
      viewBox="0 0 200 22"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M4 12 C 30 0, 50 22, 78 11 S 128 0, 152 11 S 186 20, 196 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
    {byline && (
      <span className="nafham-mark__by" aria-hidden="true">
        by Tyro
      </span>
    )}
  </span>
);

export default NafhamMark;
