import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Skeleton, TextField } from '@mui/material';
import { AssignmentTurnedInRounded, SendRounded } from '@mui/icons-material';
import { addDays, format, setHours, setMinutes } from 'date-fns';

import {
  coachErrorMessage,
  useAssignSuggestion,
  useHomeworkSuggestions,
  useRefreshHomework,
  type CoachStudentRow,
  type HomeworkIdea,
  type HomeworkSuggestion,
} from '../../hooks/useCoach';
import { snackActions } from '../../assets/utils/toaster';
import { formatDateTime, useGenerating } from './assistant.utils';
import {
  AiChip,
  EmptyTab,
  Panel,
  RefreshButton,
  StaleChip,
} from './assistant-shared.component';

interface Props {
  row: CoachStudentRow;
}

const DUE_HOUR = 18;

/** `datetime-local` value for 18:00 local time, N days from now */
const dueIn = (days: number) =>
  format(
    setMinutes(setHours(addDays(new Date(), days), DUE_HOUR), 0),
    "yyyy-MM-dd'T'HH:mm",
  );

const IdeaCard: FC<{
  suggestion: HomeworkSuggestion;
  idea: HomeworkIdea;
}> = ({ suggestion, idea }) => {
  const { t } = useTranslation();
  const assign = useAssignSuggestion();
  const [open, setOpen] = useState(false);
  const [dueAt, setDueAt] = useState(dueIn(idea.due_in_days));
  const [error, setError] = useState<string | null>(null);
  const assignedId = suggestion.assigned[idea.key];
  const assignment = suggestion.assignments.find((a) => a.id === assignedId);

  const submit = async () => {
    setError(null);
    try {
      await assign.mutateAsync({
        id: suggestion.id,
        key: idea.key,
        dueAt: new Date(dueAt).toISOString(),
      });
      snackActions.success(t('ASSISTANT.HOMEWORK.ASSIGNED'));
      setOpen(false);
    } catch (err) {
      setError(coachErrorMessage(err, t('ASSISTANT.COMMON.ERROR')));
    }
  };

  const maxPoints = idea.rubric.reduce((sum, c) => sum + c.max_points, 0);

  return (
    <article className={`as-idea${assignment ? ' as-idea--done' : ''}`}>
      <div className="as-idea__head">
        <h4 className="as-idea__title" dir="auto">
          {idea.title}
        </h4>
        <span className="as-chip as-chip--sky">
          {t('ASSISTANT.HOMEWORK.DUE_IN', { count: idea.due_in_days })}
        </span>
      </div>
      <p className="as-idea__why" dir="auto">
        {idea.why}
      </p>
      <p className="as-prose as-small" dir="auto">
        {idea.instructions}
      </p>
      {idea.rubric.length > 0 && (
        <ul className="as-rubric">
          {idea.rubric.map((criterion) => (
            <li key={criterion.name} dir="auto">
              <span>{criterion.name}</span>
              <span className="as-rubric__points">{criterion.max_points}</span>
            </li>
          ))}
          <li className="as-rubric__total">
            <span>{t('ASSISTANT.HOMEWORK.TOTAL')}</span>
            <span className="as-rubric__points">{maxPoints}</span>
          </li>
        </ul>
      )}

      {assignment ? (
        <div className="as-idea__assigned">
          <AssignmentTurnedInRounded fontSize="small" />
          <span>{t('ASSISTANT.HOMEWORK.ASSIGNED_AS')}</span>
          <Link to={`/homework/${assignment.slug}`}>{assignment.title}</Link>
        </div>
      ) : open ? (
        <div className="as-form as-form--inline">
          <TextField
            type="datetime-local"
            size="small"
            label={t('ASSISTANT.HOMEWORK.DUE_AT')}
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <div className="as-row-end">
            <Button
              variant="text"
              color="inherit"
              onClick={() => setOpen(false)}
            >
              {t('ASSISTANT.COMMON.CANCEL')}
            </Button>
            <Button
              variant="contained"
              startIcon={<SendRounded />}
              onClick={submit}
              disabled={assign.isPending || !dueAt}
            >
              {t('ASSISTANT.HOMEWORK.CONFIRM_ASSIGN')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="as-row-end">
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(true)}
          >
            {t('ASSISTANT.HOMEWORK.ASSIGN')}
          </Button>
        </div>
      )}
    </article>
  );
};

/**
 * Tab 3: three homework ideas built from the latest lesson and the learner
 * insight. Assigning one creates the rubric and the assignment through
 * the normal homework flow, so the student is told in chat as usual.
 */
const HomeworkTab: FC<Props> = ({ row }) => {
  const { t, i18n } = useTranslation();
  const generating = useGenerating();
  const pair = { studentId: row.student.id, courseId: row.grade_subject.id };
  const query = useHomeworkSuggestions(pair, generating.interval);
  const refresh = useRefreshHomework();
  const suggestion = query.data;

  useEffect(() => {
    generating.settle(suggestion?.generated_at);
  }, [suggestion?.generated_at, generating]);

  const requestRefresh = async () => {
    try {
      await refresh.mutateAsync(pair);
      generating.start(suggestion?.generated_at);
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

  if (!suggestion) {
    return (
      <EmptyTab
        title={t('ASSISTANT.HOMEWORK.EMPTY_TITLE')}
        text={
          row.lessons_recorded > 0
            ? t('ASSISTANT.HOMEWORK.EMPTY_TEXT_PENDING')
            : t('ASSISTANT.HOMEWORK.EMPTY_TEXT')
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
    <Panel
      title={t('ASSISTANT.HOMEWORK.TITLE')}
      chip={
        suggestion.stale ? (
          <StaleChip />
        ) : (
          <AiChip label={t('ASSISTANT.COMMON.AI')} />
        )
      }
      meta={t('ASSISTANT.COMMON.UPDATED', {
        date: formatDateTime(suggestion.generated_at, i18n.language),
      })}
      actions={
        <RefreshButton onClick={requestRefresh} busy={generating.active} />
      }
    >
      {generating.timedOut && (
        <Alert severity="info">{t('ASSISTANT.COMMON.TIMED_OUT')}</Alert>
      )}
      <div className="as-ideas">
        {suggestion.suggestions.map((idea) => (
          <IdeaCard
            key={`${suggestion.id}-${idea.key}`}
            suggestion={suggestion}
            idea={idea}
          />
        ))}
      </div>
    </Panel>
  );
};

export default HomeworkTab;
