import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseRounded,
  SpeakerNotesOffRounded,
  SpeakerNotesRounded,
} from '@mui/icons-material';

import type { Slide } from '../../hooks/useCoach';

interface Props {
  open: boolean;
  title: string;
  subtitle?: string;
  slides: Slide[];
  onClose: () => void;
}

/**
 * Full-screen presenter for a lesson plan's slides, for sharing on Zoom:
 * arrow keys and on-screen arrows move, N toggles the speaker notes,
 * Esc closes. Slide 0 is a title card built from the plan.
 */
const SlidesViewer: FC<Props> = ({
  open,
  title,
  subtitle,
  slides,
  onClose,
}) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState(false);
  const total = slides.length + 1;

  const go = useCallback(
    (delta: number) =>
      setIndex((current) => Math.min(total - 1, Math.max(0, current + delta))),
    [total],
  );

  useEffect(() => {
    if (!open) return undefined;
    setIndex(0);
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key === 'ArrowRight' ||
        event.key === ' ' ||
        event.key === 'PageDown'
      ) {
        event.preventDefault();
        go(1);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        go(-1);
      } else if (event.key.toLowerCase() === 'n') {
        setNotes((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const slide = index === 0 ? null : slides[index - 1];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{ className: 'as-presenter' }}
    >
      <div className="as-presenter__bar">
        <span className="as-presenter__counter">
          {index + 1} / {total}
        </span>
        <span className="as-presenter__hint">
          {t('ASSISTANT.PLAN.PRESENT_HINT')}
        </span>
        <Tooltip title={t('ASSISTANT.PLAN.SPEAKER_NOTES')}>
          <IconButton
            onClick={() => setNotes((v) => !v)}
            color="inherit"
            aria-pressed={notes}
          >
            {notes ? <SpeakerNotesOffRounded /> : <SpeakerNotesRounded />}
          </IconButton>
        </Tooltip>
        <IconButton
          onClick={onClose}
          color="inherit"
          aria-label={t('ASSISTANT.COMMON.CLOSE')}
        >
          <CloseRounded />
        </IconButton>
      </div>

      <div className="as-presenter__stage">
        <IconButton
          className="as-presenter__nav as-presenter__nav--prev"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label={t('ASSISTANT.PLAN.PREVIOUS')}
        >
          <ChevronLeftRounded fontSize="large" />
        </IconButton>

        {slide === null ? (
          <div className="as-slide as-slide--title" dir="auto">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
            <span className="as-slide__brand">Nafham</span>
          </div>
        ) : (
          <div className="as-slide" dir="auto">
            <h2 className="as-slide__title">{slide.title}</h2>
            <ul className="as-slide__bullets">
              {slide.bullets.map((bullet, i) => (
                <li key={`${i}-${bullet}`}>{bullet}</li>
              ))}
            </ul>
            <span className="as-slide__brand">Nafham</span>
          </div>
        )}

        <IconButton
          className="as-presenter__nav as-presenter__nav--next"
          onClick={() => go(1)}
          disabled={index >= total - 1}
          aria-label={t('ASSISTANT.PLAN.NEXT')}
        >
          <ChevronRightRounded fontSize="large" />
        </IconButton>
      </div>

      {notes && (
        <aside className="as-presenter__notes" dir="auto">
          <strong>{t('ASSISTANT.PLAN.SPEAKER_NOTES')}</strong>
          <p>{slide?.notes || t('ASSISTANT.PLAN.NO_NOTES')}</p>
        </aside>
      )}
    </Dialog>
  );
};

export default SlidesViewer;
