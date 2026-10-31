import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  Skeleton,
  TextField,
} from '@mui/material';
import {
  CheckCircleRounded,
  DownloadRounded,
  EditRounded,
  HistoryRounded,
  SaveRounded,
  SlideshowRounded,
} from '@mui/icons-material';

import {
  coachErrorMessage,
  useExportLessonPlan,
  useGenerateLessonPlan,
  useLessonPlans,
  useUpdateLessonPlan,
  type AgendaItem,
  type CoachStudentRow,
  type LessonPlan,
} from '../../hooks/useCoach';
import { snackActions } from '../../assets/utils/toaster';
import {
  formatDate,
  formatDateTime,
  fullName,
  useGenerating,
} from './assistant.utils';
import {
  AiChip,
  Bullets,
  EmptyTab,
  ListField,
  Panel,
  RefreshButton,
} from './assistant-shared.component';
import SlidesViewer from './slides-viewer.component';

interface Props {
  row: CoachStudentRow;
}

/** The agenda as an editable table: minutes, title, detail per block */
const AgendaEditor: FC<{
  value: AgendaItem[];
  onChange: (next: AgendaItem[]) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const set = (index: number, patch: Partial<AgendaItem>) =>
    onChange(
      value.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  return (
    <div className="as-agenda-edit">
      {value.map((item, index) => (
        <div className="as-agenda-edit__row" key={index}>
          <TextField
            size="small"
            type="number"
            label={t('ASSISTANT.PLAN.MINUTES')}
            value={item.minutes}
            onChange={(e) =>
              set(index, { minutes: Math.max(0, Number(e.target.value)) })
            }
            inputProps={{ min: 0, step: 5 }}
            className="as-agenda-edit__minutes"
          />
          <TextField
            size="small"
            label={t('ASSISTANT.PLAN.BLOCK_TITLE')}
            value={item.title}
            onChange={(e) => set(index, { title: e.target.value })}
            inputProps={{ dir: 'auto' }}
          />
          <TextField
            size="small"
            multiline
            label={t('ASSISTANT.PLAN.BLOCK_DETAIL')}
            value={item.detail}
            onChange={(e) => set(index, { detail: e.target.value })}
            inputProps={{ dir: 'auto' }}
            className="as-agenda-edit__detail"
          />
        </div>
      ))}
    </div>
  );
};

/** Read view of one plan */
const PlanView: FC<{ plan: LessonPlan }> = ({ plan }) => {
  const { t } = useTranslation();
  return (
    <div className="as-stack as-stack--tight">
      <div className="as-cols">
        <div className="as-col as-col--sky">
          <h4 className="as-subhead">{t('ASSISTANT.PLAN.OBJECTIVES')}</h4>
          <Bullets items={plan.objectives} tone="sky" />
        </div>
        <div className="as-col as-col--lilac">
          <h4 className="as-subhead">{t('ASSISTANT.PLAN.CHECKS')}</h4>
          <Bullets items={plan.checks} tone="lilac" />
        </div>
        <div className="as-col as-col--sun">
          <h4 className="as-subhead">{t('ASSISTANT.PLAN.MATERIALS')}</h4>
          <Bullets items={plan.materials} tone="sun" />
        </div>
      </div>

      <h4 className="as-subhead">
        {t('ASSISTANT.PLAN.AGENDA', { minutes: plan.total_minutes })}
      </h4>
      <ol className="as-agenda">
        {plan.agenda.map((block, index) => (
          <li key={`${index}-${block.title}`} className="as-agenda__item">
            <span className="as-agenda__minutes">
              {t('ASSISTANT.COMMON.MINUTES_SHORT', { count: block.minutes })}
            </span>
            <div className="as-agenda__body" dir="auto">
              <strong>{block.title}</strong>
              <p>{block.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {plan.homework_suggestion && (
        <p className="as-tip" dir="auto">
          <strong>{t('ASSISTANT.PLAN.HOMEWORK_IDEA')}</strong>{' '}
          {plan.homework_suggestion}
        </p>
      )}
      {plan.notes_for_tutor && (
        <p className="as-note-for-tutor" dir="auto">
          <strong>{t('ASSISTANT.PLAN.NOTES_FOR_YOU')}</strong>{' '}
          {plan.notes_for_tutor}
        </p>
      )}
    </div>
  );
};

/** Edit form for one plan; `key` it on the plan id so it resets per plan */
const PlanEditor: FC<{
  plan: LessonPlan;
  onDone: () => void;
}> = ({ plan, onDone }) => {
  const { t } = useTranslation();
  const update = useUpdateLessonPlan();
  const [title, setTitle] = useState(plan.title ?? '');
  const [objectives, setObjectives] = useState(plan.objectives);
  const [agenda, setAgenda] = useState(plan.agenda);
  const [checks, setChecks] = useState(plan.checks);
  const [materials, setMaterials] = useState(plan.materials);
  const [homework, setHomework] = useState(plan.homework_suggestion ?? '');
  const [notes, setNotes] = useState(plan.notes_for_tutor ?? '');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        id: plan.id,
        title: title.trim(),
        objectives,
        agenda,
        checks,
        materials,
        homework_suggestion: homework.trim(),
        notes_for_tutor: notes.trim(),
      });
      snackActions.success(t('ASSISTANT.PLAN.SAVED'));
      onDone();
    } catch (err) {
      setError(coachErrorMessage(err, t('ASSISTANT.COMMON.ERROR')));
    }
  };

  return (
    <div className="as-form">
      <TextField
        fullWidth
        label={t('ASSISTANT.PLAN.TITLE_FIELD')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        inputProps={{ maxLength: 200, dir: 'auto' }}
      />
      <ListField
        label={t('ASSISTANT.PLAN.OBJECTIVES')}
        value={objectives}
        onChange={setObjectives}
      />
      <h4 className="as-subhead">{t('ASSISTANT.PLAN.AGENDA_EDIT')}</h4>
      <AgendaEditor value={agenda} onChange={setAgenda} />
      <ListField
        label={t('ASSISTANT.PLAN.CHECKS')}
        value={checks}
        onChange={setChecks}
      />
      <ListField
        label={t('ASSISTANT.PLAN.MATERIALS')}
        value={materials}
        onChange={setMaterials}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t('ASSISTANT.PLAN.HOMEWORK_IDEA')}
        value={homework}
        onChange={(e) => setHomework(e.target.value)}
        inputProps={{ dir: 'auto' }}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t('ASSISTANT.PLAN.NOTES_FOR_YOU')}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        inputProps={{ dir: 'auto' }}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <div className="as-row-end">
        <Button
          variant="text"
          color="inherit"
          onClick={onDone}
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
  );
};

/**
 * Tab 2: the latest lesson plan for the pair, with its slides. The tutor
 * edits it, accepts it, presents the slides full screen or downloads the
 * PowerPoint, and can ask for a new plan at any time.
 */
const LessonPlanTab: FC<Props> = ({ row }) => {
  const { t, i18n } = useTranslation();
  const generating = useGenerating();
  const pair = { studentId: row.student.id, courseId: row.grade_subject.id };
  const query = useLessonPlans(pair, generating.interval);
  const generate = useGenerateLessonPlan();
  const update = useUpdateLessonPlan();
  const exportPptx = useExportLessonPlan();
  const [editing, setEditing] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [presenting, setPresenting] = useState(false);

  const latest = query.data?.latest ?? null;
  const history = query.data?.history ?? [];

  useEffect(() => {
    generating.settle(latest?.generated_at);
  }, [latest?.generated_at, generating]);

  const requestPlan = async () => {
    try {
      await generate.mutateAsync({
        ...pair,
        sessionId: row.next_session?.id,
      });
      generating.start(latest?.generated_at);
      setEditing(false);
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

  const accept = async () => {
    if (!latest) return;
    try {
      await update.mutateAsync({ id: latest.id, accept: true });
      snackActions.success(t('ASSISTANT.PLAN.ACCEPTED'));
      setConfirmAccept(false);
    } catch (err) {
      snackActions.error(coachErrorMessage(err, t('ASSISTANT.COMMON.ERROR')));
    }
  };

  // The file URL carries Content-Disposition: attachment, so navigating an
  // anchor to it downloads without opening a tab (popup blockers stop
  // window.open once the export has been awaited).
  const saveFile = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const download = async () => {
    if (!latest) return;
    try {
      const plan =
        latest.pptx_url && !latest.pptx_stale
          ? latest
          : await exportPptx.mutateAsync(latest.id);
      if (plan.pptx_url) saveFile(plan.pptx_url);
      else snackActions.error(t('ASSISTANT.PLAN.EXPORT_FAILED'));
    } catch (err) {
      snackActions.error(
        coachErrorMessage(err, t('ASSISTANT.PLAN.EXPORT_FAILED')),
      );
    }
  };

  if (query.isLoading) {
    return <Skeleton variant="rounded" height={360} />;
  }

  if (!latest) {
    return (
      <EmptyTab
        title={t('ASSISTANT.PLAN.EMPTY_TITLE')}
        text={
          row.next_session
            ? t('ASSISTANT.PLAN.EMPTY_TEXT_SESSION', {
                date: formatDate(row.next_session.start_time, i18n.language),
              })
            : t('ASSISTANT.PLAN.EMPTY_TEXT')
        }
        action={
          <div className="as-stack as-stack--center">
            <RefreshButton
              onClick={requestPlan}
              busy={generating.active}
              label={t('ASSISTANT.PLAN.GENERATE')}
            />
            {generating.timedOut && (
              <Alert severity="info">{t('ASSISTANT.COMMON.TIMED_OUT')}</Alert>
            )}
          </div>
        }
      />
    );
  }

  const accepted = latest.status === 'accepted';

  return (
    <div className="as-stack">
      <Panel
        title={latest.title || t('ASSISTANT.PLAN.UNTITLED')}
        chip={
          accepted ? (
            <span className="as-chip as-chip--mint">
              <CheckCircleRounded fontSize="inherit" />
              {t('ASSISTANT.PLAN.ACCEPTED_CHIP')}
            </span>
          ) : (
            <AiChip />
          )
        }
        meta={
          latest.session
            ? t('ASSISTANT.PLAN.FOR_SESSION', {
                date: formatDate(latest.session.start_time, i18n.language),
              })
            : t('ASSISTANT.PLAN.NEXT_LESSON')
        }
        actions={
          !editing && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditRounded />}
                onClick={() => setEditing(true)}
              >
                {t('ASSISTANT.COMMON.EDIT')}
              </Button>
              <RefreshButton
                onClick={requestPlan}
                busy={generating.active}
                label={t('ASSISTANT.PLAN.REGENERATE')}
              />
            </>
          )
        }
      >
        {generating.active && (
          <Alert severity="info" icon={<CircularProgress size={18} />}>
            {t('ASSISTANT.PLAN.GENERATING_TEXT')}
          </Alert>
        )}
        {generating.timedOut && (
          <Alert severity="info">{t('ASSISTANT.COMMON.TIMED_OUT')}</Alert>
        )}

        {editing ? (
          <PlanEditor
            key={latest.id}
            plan={latest}
            onDone={() => setEditing(false)}
          />
        ) : (
          <PlanView plan={latest} />
        )}

        {!editing && (
          <div className="as-plan-actions">
            <Button
              variant="contained"
              startIcon={<SlideshowRounded />}
              onClick={() => setPresenting(true)}
              disabled={latest.slides.length === 0}
            >
              {t('ASSISTANT.PLAN.PRESENT', { count: latest.slides.length })}
            </Button>
            <Button
              variant="outlined"
              startIcon={
                exportPptx.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadRounded />
                )
              }
              onClick={download}
              disabled={exportPptx.isPending || latest.slides.length === 0}
            >
              {t('ASSISTANT.PLAN.DOWNLOAD')}
            </Button>
            {!accepted && !confirmAccept && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckCircleRounded />}
                onClick={() => setConfirmAccept(true)}
              >
                {t('ASSISTANT.PLAN.ACCEPT')}
              </Button>
            )}
          </div>
        )}

        {confirmAccept && (
          <div className="as-confirm" role="alertdialog">
            <strong>{t('ASSISTANT.PLAN.CONFIRM_TITLE')}</strong>
            <p>{t('ASSISTANT.PLAN.CONFIRM_TEXT')}</p>
            <div className="as-row-end">
              <Button
                variant="outlined"
                onClick={() => setConfirmAccept(false)}
                disabled={update.isPending}
              >
                {t('ASSISTANT.COMMON.CANCEL')}
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircleRounded />}
                onClick={accept}
                disabled={update.isPending}
              >
                {t('ASSISTANT.PLAN.CONFIRM')}
              </Button>
            </div>
          </div>
        )}
      </Panel>

      {history.length > 0 && (
        <Panel title={t('ASSISTANT.PLAN.HISTORY')}>
          <ul className="as-history">
            {history.map((plan) => (
              <li key={plan.id}>
                <HistoryRounded fontSize="small" />
                <span dir="auto">
                  {plan.title || t('ASSISTANT.PLAN.UNTITLED')}
                </span>
                <span className="as-muted">
                  {formatDateTime(plan.generated_at, i18n.language)}
                </span>
                <span
                  className={`as-chip as-chip--${plan.status === 'accepted' ? 'mint' : 'sun'}`}
                >
                  {t(`ASSISTANT.PLAN.STATUS.${plan.status.toUpperCase()}`)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <SlidesViewer
        open={presenting}
        title={latest.title || t('ASSISTANT.PLAN.UNTITLED')}
        subtitle={`${row.grade_subject.full_course_name} · ${fullName(row.student)}`}
        slides={latest.slides}
        onClose={() => setPresenting(false)}
      />
    </div>
  );
};

export default LessonPlanTab;
