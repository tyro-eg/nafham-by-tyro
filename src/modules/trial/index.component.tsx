import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import {
  CheckRounded,
  EventRounded,
  MenuBookRounded,
  PeopleAltRounded,
  ScheduleRounded,
  VerifiedRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import {
  useTrialCourses,
  useTrialTutors,
  type TrialSearch,
} from '../../hooks/useTrial';
import TrialSessionSuccessModal from '../../modals/trial-session-success-modal/trial-session-success-modal.component';
import {
  STEPS,
  TIME_WINDOWS,
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
import CourseStep from './steps/course-step.component';
import WhenStep from './steps/when-step.component';
import TutorsStep from './steps/tutors-step.component';
import SlotStep from './steps/slot-step.component';
import ConfirmStep from './steps/confirm-step.component';

import './trial.styles.scss';

const ICONS: Record<WizardStep, JSX.Element> = {
  course: <MenuBookRounded />,
  when: <EventRounded />,
  tutors: <PeopleAltRounded />,
  slot: <ScheduleRounded />,
  confirm: <VerifiedRounded />,
};

/**
 * The free-trial wizard, for visitors and signed-in students alike: course,
 * dates and time of day, the tutors our team ranks best for it, a slot,
 * then confirmation. A visitor creates their account at the last step; the
 * draft lives in sessionStorage so it survives the sign-up round trip.
 */
const TrialPage: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const locale = `${i18n.language}-u-nu-latn`;
  const currentUser = useAppSelector(selectCurrentUser);
  const [draft, setDraft] = useState<TrialDraft>(loadDraft);
  const [booked, setBooked] = useState(false);

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

  const search = useMemo<TrialSearch | null>(() => {
    if (!course) return null;
    const window = TIME_WINDOWS[draft.window];
    const range = rangeFor(draft.day, draft.date);
    return {
      grade_subject_id: course.id,
      exam_board_id: draft.examBoardId,
      from: range.from,
      to: range.to,
      start_hour: window.start,
      end_hour: window.end,
      time_zone: localTimeZone(),
    };
  }, [course, draft.examBoardId, draft.day, draft.date, draft.window]);

  const stepIndex = STEPS.indexOf(draft.step);
  const tutorsQuery = useTrialTutors(stepIndex >= 2 ? search : null);
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

  if (booked) {
    return (
      <div className={`trial ${rtlClass}`}>
        <div className="trial__container container">
          <div className="trial__card trial__card--success">
            <TrialSessionSuccessModal onClose={() => undefined} />
          </div>
        </div>
      </div>
    );
  }

  const labels: Record<WizardStep, string> = {
    course: t('TRIAL.STEPS.COURSE'),
    when: t('TRIAL.STEPS.WHEN'),
    tutors: t('TRIAL.STEPS.TUTOR'),
    slot: t('TRIAL.STEPS.SLOT'),
    confirm: t('TRIAL.STEPS.CONFIRM'),
  };

  /** What the student has picked so far, shown beside each step */
  const board = course?.exam_boards.find((b) => b.id === draft.examBoardId);
  const chosen: Record<WizardStep, string | undefined> = {
    course:
      course && `${course.full_course_name}${board ? ` · ${board.name}` : ''}`,
    when: `${
      draft.day === 'date'
        ? formatDate(draft.date, locale)
        : t(`TRIAL.WHEN.${draft.day.toUpperCase()}`)
    } · ${t(`TRIAL.WHEN.${draft.window.toUpperCase()}`)}`,
    tutors: tutor ? `${tutor.first_name} ${tutor.last_name}`.trim() : undefined,
    slot: draft.slot ? formatSlot(draft.slot.start_time, locale) : undefined,
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
              {STEPS.map((step, index) => {
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
                  count: STEPS.length,
                })}
              </span>
            </div>
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
                    tutorId: same ? draft.tutorId : undefined,
                    slot: same ? draft.slot : undefined,
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
                onChange={(patch) =>
                  update({ ...patch, tutorId: undefined, slot: undefined })
                }
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
                onPickTutor={(tutorId) => {
                  update({ tutorId, slot: undefined });
                  goTo('slot');
                }}
                onPickSlot={(tutorId, slot) => {
                  update({ tutorId, slot });
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
                onPick={(slot) => update({ slot })}
                onBack={() => goTo('tutors')}
                onNext={() => goTo('confirm')}
              />
            )}
            {draft.step === 'confirm' && (
              <ConfirmStep
                course={course}
                examBoard={board}
                tutor={tutor}
                slot={draft.slot}
                loading={tutorsQuery.isLoading || coursesQuery.isLoading}
                guardianPhone={draft.guardianPhone}
                onGuardianPhone={(guardianPhone) => update({ guardianPhone })}
                signedIn={!!currentUser}
                onBack={() => goTo('slot')}
                onBooked={() => {
                  clearDraft();
                  setBooked(true);
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
