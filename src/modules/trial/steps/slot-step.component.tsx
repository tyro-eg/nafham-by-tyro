import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Chip, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

import type { TrialSlot, TrialTutor } from '../../../hooks/useTrial';
import { dayOf, formatDay, formatTime } from '../trial.types';

interface SlotStepProps {
  tutor?: TrialTutor;
  loading: boolean;
  slot?: TrialSlot;
  onPick: (slot: TrialSlot) => void;
  onBack: () => void;
  onNext: () => void;
}

/** The chosen tutor's matching slots, by day */
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

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">
        {t('TRIAL.SLOT.TITLE', { name: tutor.first_name })}
      </h2>
      <p className="trial__label">{t('TRIAL.SLOT.DAY')}</p>
      <div className="trial__chips">
        {days.map(([key, list]) => (
          <Chip
            key={key}
            label={formatDay(list[0].start_time, locale)}
            color={key === day ? 'primary' : 'default'}
            variant={key === day ? 'filled' : 'outlined'}
            onClick={() => setDayChoice(key)}
          />
        ))}
      </div>
      <p className="trial__label">{t('TRIAL.SLOT.TIME')}</p>
      <div className="trial__chips">
        {slotsOfDay.map((item) => (
          <Chip
            key={item.id}
            label={formatTime(item.start_time, locale)}
            color={slot?.id === item.id ? 'primary' : 'default'}
            variant={slot?.id === item.id ? 'filled' : 'outlined'}
            onClick={() => onPick(item)}
          />
        ))}
      </div>
      <div className="trial__actions">
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForward />}
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
