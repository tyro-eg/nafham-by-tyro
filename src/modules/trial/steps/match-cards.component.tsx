import { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import {
  ArrowForwardRounded,
  BoltRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import {
  useTrialCandidates,
  type TrialDispatch,
} from '../../../hooks/useTrial';
import RequestTime from './request-time.component';

interface MatchCardsProps {
  courseId: number;
  examBoardId?: number;
  from: string;
  to: string;
  window: { start: number; end: number };
  /** The time picked earlier, when coming back to this step */
  startTime?: string;
  onPick: (dispatch: Exclude<TrialDispatch, 'direct'>, start: string) => void;
}

/**
 * "Let us find your instructor": one start time, how many instructors are
 * free then and how many more take requests, then either the quickest to
 * confirm (several asked at once) or the best match (one at a time).
 */
const MatchCards: FC<MatchCardsProps> = ({
  courseId,
  examBoardId,
  from,
  to,
  window,
  startTime,
  onPick,
}) => {
  const { t } = useTranslation();
  const [start, setStart] = useState<string | undefined>(startTime);
  const onChange = useCallback((value: string) => setStart(value), []);

  const search = useMemo(
    () =>
      start
        ? {
            grade_subject_id: courseId,
            start_time: start,
            exam_board_id: examBoardId,
          }
        : null,
    [courseId, examBoardId, start],
  );
  const candidates = useTrialCandidates(search);
  const free = candidates.data?.on_calendar.length ?? 0;
  const more = candidates.data?.off_calendar.length ?? 0;
  const total = free + more;
  const broadcast = Math.min(total, candidates.data?.max_broadcast ?? 6);
  const ready = !!start && !!candidates.data && total > 0;

  const options: {
    dispatch: Exclude<TrialDispatch, 'direct'>;
    icon: JSX.Element;
    title: string;
    text: string;
  }[] = [
    {
      dispatch: 'fastest',
      icon: <BoltRounded />,
      title: t('TRIAL.MATCH.FASTEST'),
      text: t('TRIAL.MATCH.FASTEST_TEXT', { count: broadcast || 6 }),
    },
    {
      dispatch: 'best_match',
      icon: <WorkspacePremiumRounded />,
      title: t('TRIAL.MATCH.BEST'),
      text: t('TRIAL.MATCH.BEST_TEXT'),
    },
  ];

  return (
    <section className="trial-match">
      <div className="trial-match__head">
        <h3 className="trial-match__title">{t('TRIAL.MATCH.TITLE')}</h3>
        <p className="trial__hint">{t('TRIAL.MATCH.SUBTITLE')}</p>
      </div>

      <RequestTime
        from={from}
        to={to}
        window={window}
        value={start}
        onChange={onChange}
      />

      <p className="trial-match__count" aria-live="polite">
        {candidates.isFetching && !candidates.data ? (
          <CircularProgress size={16} />
        ) : candidates.isError ? (
          t('TRIAL.MATCH.COUNT_ERROR')
        ) : candidates.data && total === 0 ? (
          t('TRIAL.MATCH.NOBODY')
        ) : candidates.data ? (
          <>
            {t('TRIAL.MATCH.FREE', { count: free })}
            {more > 0 && ` ${t('TRIAL.MATCH.MORE', { count: more })}`}
          </>
        ) : null}
      </p>

      <div className="trial-match__options">
        {options.map((option) => (
          <div key={option.dispatch} className="trial-match__option">
            <span className="trial-match__icon">{option.icon}</span>
            <div className="trial-match__text">
              <span className="trial-match__name">{option.title}</span>
              <span className="trial-match__desc">{option.text}</span>
            </div>
            <Button
              className="trial__cta"
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              disabled={!ready}
              onClick={() => start && onPick(option.dispatch, start)}
            >
              {t('TRIAL.MATCH.CHOOSE')}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MatchCards;
