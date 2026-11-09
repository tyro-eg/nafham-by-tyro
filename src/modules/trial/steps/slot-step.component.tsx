import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import { ArrowBackRounded, ArrowForwardRounded } from '@mui/icons-material';

import type { TrialSlot, TrialTutor } from '../../../hooks/useTrial';
import { dayOf, formatTime } from '../trial.types';

interface SlotStepProps {
  tutor?: TrialTutor;
  loading: boolean;
  slot?: TrialSlot;
  onPick: (slot: TrialSlot) => void;
  onBack: () => void;
  onNext: () => void;
}

/** The chosen tutor's matching slots: a strip of days, then the times */
const SlotStep: FC<SlotStepProps> = ({
  tutor,
  loading,
  slot,
  onPick,
  onBack,
  onNext,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;

  const days = useMemo(() => {
    const map = new Map<string, TrialSlot[]>();
    (tutor?.slots ?? []).forEach((item) => {
      const key = dayOf(item.start_time);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [tutor?.slots]);

  const [dayChoice, setDayChoice] = useState<string | undefined>(
    slot ? dayOf(slot.start_time) : undefined,
  );
  const day = dayChoice ?? days[0]?.[0];
  const slotsOfDay = days.find(([key]) => key === day)?.[1] ?? [];

  if (loading || !tutor) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
      </div>
    );
  }

  const part = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString(locale, options);

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">
        {t('TRIAL.SLOT.TITLE', { name: tutor.first_name })}
      </h2>

      <div className="trial-choice">
        <p className="trial-choice__label">{t('TRIAL.SLOT.DAY')}</p>
        <div className="trial__days">
          {days.map(([key, list]) => {
            const selected = key === day;
            return (
              <button
                key={key}
                type="button"
                className={`trial-day ${selected ? 'is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setDayChoice(key)}
              >
                <span className="trial-day__weekday">
                  {part(list[0].start_time, { weekday: 'short' })}
                </span>
                <span className="trial-day__number">
                  {part(list[0].start_time, { day: 'numeric' })}
                </span>
                <span className="trial-day__month">
                  {part(list[0].start_time, { month: 'short' })}
                </span>
                <span className="trial-day__count">
                  {t('TRIAL.SLOT.TIMES', { count: list.length })}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="trial-choice">
        <p className="trial-choice__label">{t('TRIAL.SLOT.TIME')}</p>
        <div className="trial__times">
          {slotsOfDay.map((item) => {
            const selected = slot?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`trial-choice__item ${selected ? 'is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => onPick(item)}
              >
                <span className="trial-choice__name">
                  {formatTime(item.start_time, locale)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        <Button
          className="trial__cta"
          variant="contained"
          endIcon={<ArrowForwardRounded />}
          disabled={!slot}
          onClick={onNext}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default SlotStep;
