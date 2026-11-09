import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Close,
  EventRepeatRounded,
  LockClockRounded,
} from '@mui/icons-material';

import {
  MAX_MOVE_OPTIONS,
  changeErrorMessage,
  useMoveOptions,
  useProposeMove,
  type MoveOption,
  type TimeWindow,
} from '../../hooks/useSessionChanges';
import { dayOf, formatSlot, formatTime } from '../../modules/trial/trial.types';
import type { SessionType } from '../../assets/types';

import './reschedule-session-modal.styles.scss';

interface RescheduleSessionModalProps {
  session: SessionType;
  handleClose: () => void;
}

const NOTE_LENGTH = 500;

/**
 * Propose new times for a lesson: the tutor's open windows of the same
 * length over the next two weeks, a strip of days then the times, pick up
 * to three, add a note. Nothing moves until the other side accepts one.
 */
const RescheduleSessionModal: FC<RescheduleSessionModalProps> = ({
  session,
  handleClose,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const options = useMoveOptions(session.id);
  const propose = useProposeMove();
  const [picked, setPicked] = useState<TimeWindow[]>([]);
  const [dayChoice, setDayChoice] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const map = new Map<string, MoveOption[]>();
    (options.data ?? []).forEach((item) => {
      const key = dayOf(item.start_time);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [options.data]);
  const day = dayChoice ?? days[0]?.[0];
  const timesOfDay = days.find(([key]) => key === day)?.[1] ?? [];

  const isPicked = (start: string) =>
    picked.some((item) => item.start_time === start);
  const toggle = (item: MoveOption) => {
    setError(null);
    if (isPicked(item.start_time)) {
      setPicked(picked.filter((p) => p.start_time !== item.start_time));
    } else if (picked.length < MAX_MOVE_OPTIONS) {
      setPicked(
        [
          ...picked,
          { start_time: item.start_time, end_time: item.end_time },
        ].sort((a, b) => a.start_time.localeCompare(b.start_time)),
      );
    }
  };

  const submit = async () => {
    setError(null);
    try {
      await propose.mutateAsync({
        sessionId: session.id,
        options: picked,
        note,
      });
      handleClose();
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR')));
    }
  };

  const part = (iso: string, format: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString(locale, format);

  return (
    <div className="move-modal">
      <header className="move-modal__header">
        <div className="move-modal__icon">
          <EventRepeatRounded />
        </div>
        <div className="move-modal__heading">
          <h4 className="move-modal__title">
            {t('SESSION_CHANGES.MOVE.TITLE')}
          </h4>
          <p className="move-modal__subtitle">
            {t('SESSION_CHANGES.MOVE.TEXT', {
              when: formatSlot(session.start_time, locale),
              count: MAX_MOVE_OPTIONS,
            })}
          </p>
        </div>
        <IconButton
          aria-label={t('SESSION_CHANGES.CLOSE')}
          className="move-modal__close"
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </header>

      {options.isLoading && (
        <div className="move-modal__loading">
          <CircularProgress size={28} />
        </div>
      )}

      {options.isError && (
        <Alert severity="error">
          {t('SESSION_CHANGES.MOVE.ERROR_LOADING')}
        </Alert>
      )}

      {options.data && options.data.length === 0 && (
        <Alert severity="info">{t('SESSION_CHANGES.MOVE.NO_TIMES')}</Alert>
      )}

      {days.length > 0 && (
        <>
          <p className="move-modal__label">{t('SESSION_CHANGES.MOVE.DAY')}</p>
          <div className="move-modal__days">
            {days.map(([key, list]) => {
              const selected = key === day;
              const pickedHere = list.filter((o) =>
                isPicked(o.start_time),
              ).length;
              return (
                <button
                  key={key}
                  type="button"
                  className={`move-modal__day${selected ? ' is-selected' : ''}${pickedHere ? ' has-picked' : ''}`}
                  aria-pressed={selected}
                  onClick={() => setDayChoice(key)}
                >
                  <span className="move-modal__day-weekday">
                    {part(list[0].start_time, { weekday: 'short' })}
                  </span>
                  <span className="move-modal__day-number">
                    {part(list[0].start_time, { day: 'numeric' })}
                  </span>
                  <span className="move-modal__day-month">
                    {part(list[0].start_time, { month: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="move-modal__label">{t('SESSION_CHANGES.MOVE.TIME')}</p>
          <div className="move-modal__times">
            {timesOfDay.map((item) => {
              const selected = isPicked(item.start_time);
              const full = !selected && picked.length >= MAX_MOVE_OPTIONS;
              return (
                <button
                  key={item.start_time}
                  type="button"
                  className={`move-modal__time${selected ? ' is-selected' : ''}`}
                  aria-pressed={selected}
                  disabled={full}
                  onClick={() => toggle(item)}
                >
                  {formatTime(item.start_time, locale)}
                  {item.held_for_you && (
                    <LockClockRounded
                      className="move-modal__held"
                      titleAccess={t('SESSION_CHANGES.MOVE.HELD_FOR_YOU')}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="move-modal__picked">
            <p className="move-modal__label">
              {t('SESSION_CHANGES.MOVE.PICKED', {
                count: picked.length,
                max: MAX_MOVE_OPTIONS,
              })}
            </p>
            {picked.length > 0 && (
              <ul className="move-modal__picked-list">
                {picked.map((item) => (
                  <li key={item.start_time}>
                    {formatSlot(item.start_time, locale)}
                    <button
                      type="button"
                      className="move-modal__unpick"
                      aria-label={t('SESSION_CHANGES.MOVE.REMOVE')}
                      onClick={() =>
                        setPicked(
                          picked.filter(
                            (p) => p.start_time !== item.start_time,
                          ),
                        )
                      }
                    >
                      <Close fontSize="inherit" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={t('SESSION_CHANGES.MOVE.NOTE')}
            value={note}
            onChange={(event) =>
              setNote(event.target.value.slice(0, NOTE_LENGTH))
            }
            inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
          />
        </>
      )}

      {error && (
        <Alert severity="error" className="move-modal__error">
          {error}
        </Alert>
      )}

      <footer className="move-modal__footer">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={propose.isPending}
        >
          {t('SESSION_CHANGES.CLOSE')}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={picked.length === 0 || propose.isPending}
        >
          {t('SESSION_CHANGES.MOVE.SUBMIT', { count: picked.length })}
        </Button>
      </footer>
    </div>
  );
};

export default RescheduleSessionModal;
