import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Skeleton, TextField } from '@mui/material';
import {
  EditRounded,
  ExpandMoreRounded,
  FormatQuoteRounded,
  SaveRounded,
} from '@mui/icons-material';

import {
  coachErrorMessage,
  useLearnerInsight,
  useRefreshInsight,
  useUpdateSessionNote,
  type CoachStudentRow,
  type SessionNote,
} from '../../hooks/useCoach';
import { snackActions } from '../../assets/utils/toaster';
import {
  formatDate,
  formatDateTime,
  percent,
  useGenerating,
} from './assistant.utils';
import {
  AiChip,
  Bullets,
  EmptyTab,
  ListField,
  Panel,
  RefreshButton,
  StaleChip,
} from './assistant-shared.component';

interface Props {
  row: CoachStudentRow;
}

/** One recorded lesson: the AI's note, editable by the tutor */
const NoteCard: FC<{ note: SessionNote }> = ({ note }) => {
  const { t, i18n } = useTranslation();
  const update = useUpdateSessionNote();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(note.summary ?? '');
  const [covered, setCovered] = useState(note.covered);
  const [struggles, setStruggles] = useState(note.struggles);
  const [nextSteps, setNextSteps] = useState(note.next_steps);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        sessionId: note.session_id,
        summary: summary.trim(),
        covered,
        struggles,
        next_steps: nextSteps,
      });
      snackActions.success(t('ASSISTANT.INSIGHTS.NOTE_SAVED'));
      setEditing(false);
    } catch (err) {
      setError(coachErrorMessage(err, t('ASSISTANT.COMMON.ERROR')));
    }
  };

  const delivery = note.delivery ?? {};

  return (
    <article className={`as-note${open ? ' as-note--open' : ''}`}>
      <button
        type="button"
        className="as-note__head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="as-note__date">
          {formatDate(note.session.start_time, i18n.language)}
        </span>
        <span className="as-note__summary" dir="auto">
          {note.summary}
        </span>
        {note.source === 'ai' ? (
          <AiChip />
        ) : (
          <span className="as-chip as-chip--mint">
            {t('ASSISTANT.INSIGHTS.EDITED_BY_YOU')}
          </span>
        )}
        <ExpandMoreRounded className="as-note__caret" />
      </button>

      {open && !editing && (
        <div className="as-note__body">
          <div className="as-cols">
            <div>
              <h4 className="as-subhead">{t('ASSISTANT.INSIGHTS.COVERED')}</h4>
              <Bullets items={note.covered} tone="sky" />
            </div>
            <div>
              <h4 className="as-subhead">
                {t('ASSISTANT.INSIGHTS.STRUGGLES')}
              </h4>
              <Bullets items={note.struggles} tone="coral" />
            </div>
            <div>
              <h4 className="as-subhead">
                {t('ASSISTANT.INSIGHTS.NEXT_STEPS')}
              </h4>
              <Bullets items={note.next_steps} tone="mint" />
            </div>
          </div>
          <div className="as-delivery">
            <span>
              {t('ASSISTANT.COACH.TALK_RATIO')}:{' '}
              <strong>{percent(delivery.talk_ratio_tutor)}</strong>
            </span>
            <span>
              {t('ASSISTANT.COACH.CHECKS')}:{' '}
              <strong>{delivery.checks_for_understanding ?? '–'}</strong>
            </span>
            <span>
              {t('ASSISTANT.COACH.MONOLOGUE')}:{' '}
              <strong>
                {delivery.longest_monologue_minutes != null
                  ? t('ASSISTANT.COMMON.MINUTES', {
                      count: Math.round(delivery.longest_monologue_minutes),
                    })
                  : '–'}
              </strong>
            </span>
          </div>
          {(delivery.suggestions?.length ?? 0) > 0 && (
            <p className="as-tip" dir="auto">
              <strong>{t('ASSISTANT.INSIGHTS.TRY_NEXT')}</strong>{' '}
              {delivery.suggestions[0]}
            </p>
          )}
          <div className="as-row-end">
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditRounded />}
              onClick={() => setEditing(true)}
            >
              {t('ASSISTANT.COMMON.EDIT')}
            </Button>
          </div>
        </div>
      )}

      {open && editing && (
        <div className="as-note__body as-form">
          <TextField
            multiline
            minRows={2}
            fullWidth
            label={t('ASSISTANT.INSIGHTS.SUMMARY')}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            inputProps={{ maxLength: 5000, dir: 'auto' }}
          />
          <ListField
            label={t('ASSISTANT.INSIGHTS.COVERED')}
            value={covered}
            onChange={setCovered}
          />
          <ListField
            label={t('ASSISTANT.INSIGHTS.STRUGGLES')}
            value={struggles}
            onChange={setStruggles}
          />
          <ListField
            label={t('ASSISTANT.INSIGHTS.NEXT_STEPS')}
            value={nextSteps}
            onChange={setNextSteps}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <div className="as-row-end">
            <Button
              variant="text"
              color="inherit"
              onClick={() => setEditing(false)}
              disabled={update.isPending}
            >
              {t('ASSISTANT.COMMON.CANCEL')}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveRounded />}
              onClick={save}
              disabled={update.isPending}
            >
              {t('ASSISTANT.COMMON.SAVE')}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
};

/**
 * Tab 1: what the tutor should know about this student on this course,
 * built from the recorded lessons and reviewed homework, with the recent
 * lesson notes underneath.
 */
const LearnerInsights: FC<Props> = ({ row }) => {
  const { t, i18n } = useTranslation();
  const generating = useGenerating();
  const pair = { studentId: row.student.id, courseId: row.grade_subject.id };
  const query = useLearnerInsight(pair, generating.interval);
  const refresh = useRefreshInsight();
  const insight = query.data;

  useEffect(() => {
    generating.settle(insight?.generated_at);
  }, [insight?.generated_at, generating]);

  // Reading a stale insight makes the backend rebuild it; poll until it lands
  useEffect(() => {
    if (insight?.refreshing && !generating.active) {
      generating.start(insight.generated_at);
    }
  }, [insight?.refreshing, insight?.generated_at, generating]);

  const requestRefresh = async () => {
    try {
      await refresh.mutateAsync(pair);
      generating.start(insight?.generated_at);
    } catch (err) {
      snackActions.error(
        coachErrorMessage(
          err,
          t('ASSISTANT.COMMON.ERROR'),
          t('ASSISTANT.COMMON.THROTTLED'),
        ),
      );
    }
  };

  if (query.isLoading) {
    return <Skeleton variant="rounded" height={320} />;
  }

  if (!insight) {
    return (
      <EmptyTab
        title={t('ASSISTANT.INSIGHTS.EMPTY_TITLE')}
        text={
          row.lessons_recorded > 0
            ? t('ASSISTANT.INSIGHTS.EMPTY_TEXT_PENDING')
            : t('ASSISTANT.INSIGHTS.EMPTY_TEXT')
        }
        action={
          row.lessons_recorded > 0 ? (
            <RefreshButton
              onClick={requestRefresh}
              busy={generating.active}
              label={t('ASSISTANT.COMMON.GENERATE')}
            />
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="as-stack">
      <Panel
        title={t('ASSISTANT.INSIGHTS.TITLE')}
        chip={
          insight.stale ? (
            <StaleChip />
          ) : (
            <AiChip label={t('ASSISTANT.COMMON.AI')} />
          )
        }
        meta={t('ASSISTANT.COMMON.UPDATED', {
          date: formatDateTime(insight.generated_at, i18n.language),
        })}
        actions={
          <RefreshButton onClick={requestRefresh} busy={generating.active} />
        }
      >
        {generating.timedOut && (
          <Alert severity="info">{t('ASSISTANT.COMMON.TIMED_OUT')}</Alert>
        )}
        <p className="as-prose" dir="auto">
          {insight.summary}
        </p>
        <div className="as-cols">
          <div className="as-col as-col--mint">
            <h4 className="as-subhead">{t('ASSISTANT.INSIGHTS.STRENGTHS')}</h4>
            <Bullets items={insight.strengths} tone="mint" />
          </div>
          <div className="as-col as-col--coral">
            <h4 className="as-subhead">{t('ASSISTANT.INSIGHTS.WEAKNESSES')}</h4>
            <Bullets items={insight.weaknesses} tone="coral" />
          </div>
          <div className="as-col as-col--sky">
            <h4 className="as-subhead">{t('ASSISTANT.INSIGHTS.FOCUS')}</h4>
            <ol className="as-numbered">
              {insight.focus_next.map((item, index) => (
                <li key={`${index}-${item}`} dir="auto">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
        {insight.evidence.length > 0 && (
          <details className="as-evidence">
            <summary>
              <FormatQuoteRounded fontSize="small" />
              {t('ASSISTANT.INSIGHTS.EVIDENCE', {
                count: insight.evidence.length,
              })}
            </summary>
            <ul>
              {insight.evidence.map((item, index) => (
                <li key={`${item.kind}-${item.id}-${index}`} dir="auto">
                  <q>{item.quote}</q>
                  <span className="as-evidence__source">
                    {item.kind === 'note'
                      ? t('ASSISTANT.INSIGHTS.FROM_LESSON')
                      : t('ASSISTANT.INSIGHTS.FROM_HOMEWORK')}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <p className="as-muted as-small">
          {t('ASSISTANT.INSIGHTS.BASED_ON', {
            lessons: insight.lessons_count,
            homework: insight.assignments_count,
          })}
        </p>
      </Panel>

      <Panel title={t('ASSISTANT.INSIGHTS.RECENT_LESSONS')}>
        {insight.recent_notes.length === 0 ? (
          <p className="as-muted">{t('ASSISTANT.INSIGHTS.NO_NOTES')}</p>
        ) : (
          <div className="as-notes">
            {insight.recent_notes.map((note) => (
              <NoteCard
                key={`${note.id}-${note.edited_at ?? ''}`}
                note={note}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
};

export default LearnerInsights;
