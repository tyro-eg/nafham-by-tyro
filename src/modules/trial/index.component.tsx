import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import {
  CheckRounded,
  EventRounded,
  FamilyRestroomRounded,
  MenuBookRounded,
  PeopleAltRounded,
  ScheduleRounded,
  VerifiedRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import { useFamily } from '../../hooks/useFamily';
import {
  useTrialCourses,
  useTrialTutors,
  type TrialRequest,
  type TrialSearch,
} from '../../hooks/useTrial';
import {
  NO_CHOICE,
  TIME_WINDOWS,
  stepsFor,
  clearDraft,
  formatDate,
  formatSlot,
  loadDraft,
  localTimeZone,
  rangeFor,
  saveDraft,
  type Step as WizardStep,
  type TrialDraft,
} from './trial.types';
import { DISPATCH_UI } from './dispatch-ui';
import ChildStep from './steps/child-step.component';
import CourseStep from './steps/course-step.component';
import WhenStep from './steps/when-step.component';
import TutorsStep from './steps/tutors-step.component';
import SlotStep from './steps/slot-step.component';
import ConfirmStep from './steps/confirm-step.component';
import RequestSent from './request-sent.component';

import './trial.styles.scss';

const ICONS: Record<WizardStep, JSX.Element> = {
  child: <FamilyRestroomRounded />,
  course: <MenuBookRounded />,
  when: <EventRounded />,
  tutors: <PeopleAltRounded />,
  slot: <ScheduleRounded />,
  confirm: <VerifiedRounded />,
};

/**
 * The free-trial wizard, for visitors and signed-in students alike: course,
 * dates and time of day, then either one time for us to find the
 * instructor (quickest to confirm, or best match) or a tutor and their
 * slot, then confirmation. What is sent is a request the instructor
 * confirms. A visitor creates their account at the last step; the draft
 * lives in sessionStorage so it survives the sign-up round trip.
 */
const TrialPage: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const locale = `${i18n.language}-u-nu-latn`;
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const steps = stepsFor(isParent);
  const [draft, setDraft] = useState<TrialDraft>(() => {
    const saved = loadDraft();
    // A parent starts by saying which child; a student never sees that step
    if (isParent && saved.childId === undefined)
      return { ...saved, step: 'child' };
    if (!isParent && saved.step === 'child')
      return { ...saved, step: 'course' };
    return saved;
  });
  const [sent, setSent] = useState<TrialRequest | null>(null);
  const family = useFamily(isParent);
  const child = family.data?.children.find((c) => c.id === draft.childId);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = (patch: Partial<TrialDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const goTo = (step: WizardStep) => {
    update({ step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const coursesQuery = useTrialCourses();
  const course = coursesQuery.data?.find((item) => item.id === draft.courseId);

  const range = useMemo(
    () => rangeFor(draft.day, draft.date),
    [draft.day, draft.date],
  );
  const hours = TIME_WINDOWS[draft.window];
  const search = useMemo<TrialSearch | null>(() => {
    if (!course) return null;
    const window = TIME_WINDOWS[draft.window];
    return {
      grade_subject_id: course.id,
      exam_board_id: draft.examBoardId,
      from: range.from,
      to: range.to,
      start_hour: window.start,
      end_hour: window.end,
      time_zone: localTimeZone(),
    };
  }, [course, draft.examBoardId, range, draft.window]);

  const stepIndex = steps.indexOf(draft.step);
  const tutorsQuery = useTrialTutors(
    stepIndex >= steps.indexOf('tutors') ? search : null,
  );
  const tutor = tutorsQuery.data?.find((item) => item.id === draft.tutorId);

  if (currentUser?.type === 'Tutor') {
    return (
      <div className={`trial ${rtlClass}`}>
        <div className="trial__container container">
          <div className="trial__card trial__card--center">
            <p>{t('TRIAL.TUTOR_ACCOUNT')}</p>
            <Button
              component={Link}
              to="/dashboard"
              className="trial__cta"
              variant="contained"
            >
              {t('NAVIGATION.DASHBOARD')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className={`trial ${rtlClass}`}>
        <div className="trial__container container">
          <div className="trial__card trial__card--success">
            <RequestSent
              request={sent}
              onRetry={() => {
                setSent(null);
                update({ ...NO_CHOICE, step: 'tutors' });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const labels: Record<WizardStep, string> = {
    child: t('TRIAL.STEPS.CHILD'),
    course: t('TRIAL.STEPS.COURSE'),
    when: t('TRIAL.STEPS.WHEN'),
    tutors: t('TRIAL.STEPS.TUTOR'),
    slot: t('TRIAL.STEPS.SLOT'),
    confirm: t('TRIAL.STEPS.CONFIRM'),
  };

  /** What the student has picked so far, shown beside each step */
  const board = course?.exam_boards.find((b) => b.id === draft.examBoardId);
  const chosen: Record<WizardStep, string | undefined> = {
    child: child ? `${child.first_name} ${child.last_name}`.trim() : undefined,
    course:
      course && `${course.full_course_name}${board ? ` · ${board.name}` : ''}`,
    when: `${
      draft.day === 'date'
        ? formatDate(draft.date, locale)
        : t(`TRIAL.WHEN.${draft.day.toUpperCase()}`)
    } · ${t(`TRIAL.WHEN.${draft.window.toUpperCase()}`)}`,
    tutors: (() => {
      const label = draft.dispatch && DISPATCH_UI[draft.dispatch].label;
      if (label) return t(label);
      return tutor
        ? `${tutor.first_name} ${tutor.last_name}`.trim()
        : undefined;
    })(),
    slot: draft.startTime ? formatSlot(draft.startTime, locale) : undefined,
    confirm: undefined,
  };

  return (
    <div className={`trial ${rtlClass}`}>
      <div className="trial__container container">
        <header className="trial__header">
          <span className="trial__eyebrow">{t('TRIAL.EYEBROW')}</span>
          <h1 className="trial__title">{t('TRIAL.TITLE')}</h1>
          <p className="trial__subtitle">{t('TRIAL.SUBTITLE')}</p>
        </header>

        <div className="trial__layout">
          <aside className="trial__rail">
            <p className="trial__rail-title">{t('TRIAL.SUMMARY')}</p>
            <ol className="trial__progress">
              {steps.map((step, index) => {
                const state =
                  index < stepIndex
                    ? 'done'
                    : index === stepIndex
                      ? 'active'
                      : 'todo';
                return (
                  <li key={step} className={`trial__progress-item is-${state}`}>
                    <button
                      type="button"
                      className="trial__progress-btn"
                      disabled={index >= stepIndex}
                      onClick={() => goTo(step)}
                    >
                      <span className="trial__progress-icon">
                        {state === 'done' ? <CheckRounded /> : ICONS[step]}
                      </span>
                      <span className="trial__progress-text">
                        <span className="trial__progress-label">
                          {labels[step]}
                        </span>
                        {step !== 'confirm' && (
                          <span className="trial__progress-value">
                            {chosen[step] ?? t('TRIAL.PENDING')}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="trial__card" key={draft.step}>
            <div className="trial__step-head">
              <span className="trial__step-icon">{ICONS[draft.step]}</span>
              <span className="trial__step-count">
                {t('TRIAL.STEP_COUNT', {
                  step: stepIndex + 1,
                  count: steps.length,
                })}
              </span>
            </div>
            {draft.step === 'child' && (
              <ChildStep
                childId={draft.childId}
                onNext={(childId) => {
                  update({
                    childId,
                    // Another child: the tutors and time are looked up afresh
                    ...(childId === draft.childId ? {} : NO_CHOICE),
                  });
                  goTo('course');
                }}
              />
            )}
            {draft.step === 'course' && (
              <CourseStep
                // Remount once the catalog is in, so a saved course fills the dropdowns
                key={coursesQuery.data ? 'ready' : 'loading'}
                courses={coursesQuery.data}
                loading={coursesQuery.isLoading}
                courseId={draft.courseId}
                examBoardId={draft.examBoardId}
                onNext={(courseId, examBoardId) => {
                  const same =
                    courseId === draft.courseId &&
                    examBoardId === draft.examBoardId;
                  update({
                    courseId,
                    examBoardId,
                    ...(same ? {} : NO_CHOICE),
                  });
                  goTo('when');
                }}
              />
            )}
            {draft.step === 'when' && (
              <WhenStep
                day={draft.day}
                date={draft.date}
                window={draft.window}
                onChange={(patch) => update({ ...patch, ...NO_CHOICE })}
                onBack={() => goTo('course')}
                onNext={() => goTo('tutors')}
              />
            )}
            {draft.step === 'tutors' && (
              <TutorsStep
                course={course}
                tutors={tutorsQuery.data}
                loading={tutorsQuery.isLoading}
                failed={tutorsQuery.isError}
                signedIn={!!currentUser}
                range={range}
                window={hours}
                examBoardId={draft.examBoardId}
                startTime={draft.startTime}
                onPickTutor={(tutorId) => {
                  update({ ...NO_CHOICE, tutorId, dispatch: 'direct' });
                  goTo('slot');
                }}
                onPickSlot={(tutorId, slot) => {
                  update({
                    tutorId,
                    slot,
                    dispatch: 'direct',
                    startTime: slot.start_time,
                  });
                  goTo('confirm');
                }}
                onPickMatch={(dispatch, startTime) => {
                  update({ ...NO_CHOICE, dispatch, startTime });
                  goTo('confirm');
                }}
                onAskTime={(tutorId, startTime) => {
                  update({
                    ...NO_CHOICE,
                    tutorId,
                    dispatch: 'direct',
                    startTime,
                  });
                  goTo('confirm');
                }}
                onBack={() => goTo('when')}
              />
            )}
            {draft.step === 'slot' && (
              <SlotStep
                tutor={tutor}
                loading={tutorsQuery.isLoading}
                slot={draft.slot}
                onPick={(slot) =>
                  update({
                    slot,
                    dispatch: 'direct',
                    startTime: slot.start_time,
                  })
                }
                onBack={() => goTo('tutors')}
                onNext={() => goTo('confirm')}
              />
            )}
            {draft.step === 'confirm' && (
              <ConfirmStep
                course={course}
                examBoard={board}
                dispatch={draft.dispatch}
                tutor={tutor}
                startTime={draft.startTime}
                onCalendar={!!draft.slot}
                loading={
                  coursesQuery.isLoading ||
                  (draft.dispatch === 'direct' && tutorsQuery.isLoading)
                }
                note={draft.note}
                onNote={(note) => update({ note })}
                guardianPhone={
                  draft.guardianPhone ||
                  (isParent ? (currentUser?.phone_number ?? '') : '')
                }
                onGuardianPhone={(guardianPhone) => update({ guardianPhone })}
                signedIn={!!currentUser}
                childId={isParent ? draft.childId : undefined}
                // A slot was picked on the slot step; a time asked for, on the tutors step
                onBack={() => goTo(draft.slot ? 'slot' : 'tutors')}
                onSent={(request) => {
                  clearDraft();
                  setSent(request);
                }}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TrialPage;
