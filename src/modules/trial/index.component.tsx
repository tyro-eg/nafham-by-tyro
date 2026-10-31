import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import {
  CheckCircleRounded,
  PaidRounded,
  ScheduleRounded,
  VideocamRounded,
} from '@mui/icons-material';
import { useFamily } from '../../hooks/useFamily';

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
  TIME_WINDOWS,
  formatSlot,
  stepsFor,
  clearDraft,
  loadDraft,
  localTimeZone,
  saveDraft,
  type Step as WizardStep,
  type TrialDraft,
} from './trial.types';
import ChildStep from './steps/child-step.component';
import CourseStep from './steps/course-step.component';
import WhenStep from './steps/when-step.component';
import TutorsStep from './steps/tutors-step.component';
import SlotStep from './steps/slot-step.component';
import ConfirmStep from './steps/confirm-step.component';

import './trial.styles.scss';

/**
 * The free-trial wizard, for visitors and signed-in students alike: course,
 * dates and time of day, the tutors our team ranks best for it, a slot,
 * then confirmation. A visitor creates their account at the last step; the
 * draft lives in sessionStorage so it survives the sign-up round trip.
 */
const TrialPage: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
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
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = (patch: Partial<TrialDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const goTo = (step: WizardStep) => update({ step });

  const family = useFamily(isParent);
  const child = family.data?.children.find((c) => c.id === draft.childId);

  const coursesQuery = useTrialCourses();
  const course = coursesQuery.data?.find((item) => item.id === draft.courseId);

  const search = useMemo<TrialSearch | null>(() => {
    if (!course) return null;
    const window = TIME_WINDOWS[draft.window];
    return {
      grade_subject_id: course.id,
      from: draft.from,
      to: draft.to,
      start_hour: window.start,
      end_hour: window.end,
      time_zone: localTimeZone(),
    };
  }, [course, draft.from, draft.to, draft.window]);

  const stepIndex = steps.indexOf(draft.step);
  const tutorsQuery = useTrialTutors(stepIndex >= 2 ? search : null);
  const tutor = tutorsQuery.data?.find((item) => item.id === draft.tutorId);

  if (currentUser?.type === 'Tutor') {
    return (
      <div className="trial container">
        <div className="trial__card trial__card--center">
          <p>{t('TRIAL.TUTOR_ACCOUNT')}</p>
          <Button component={Link} to="/dashboard" variant="contained">
            {t('NAVIGATION.DASHBOARD')}
          </Button>
        </div>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="trial container">
        <div className="trial__card">
          <TrialSessionSuccessModal onClose={() => undefined} />
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

  // What has been picked so far, beside the wizard
  const dateLabel = (yyyymmdd: string) =>
    new Date(`${yyyymmdd}T00:00:00`).toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'short',
    });
  const summary: { key: WizardStep; label: string; value?: string }[] = [
    ...(isParent
      ? [
          {
            key: 'child' as WizardStep,
            label: t('TRIAL.STEPS.CHILD'),
            value: child ? `${child.first_name} ${child.last_name}` : undefined,
          },
        ]
      : []),
    {
      key: 'course',
      label: t('TRIAL.STEPS.COURSE'),
      value: course?.full_course_name,
    },
    {
      key: 'when',
      label: t('TRIAL.STEPS.WHEN'),
      value:
        stepIndex > steps.indexOf('when')
          ? `${dateLabel(draft.from)} – ${dateLabel(draft.to)} · ${t(`TRIAL.WHEN.${draft.window.toUpperCase()}`)}`
          : undefined,
    },
    {
      key: 'tutors',
      label: t('TRIAL.STEPS.TUTOR'),
      value: tutor ? `${tutor.first_name} ${tutor.last_name}` : undefined,
    },
    {
      key: 'slot',
      label: t('TRIAL.STEPS.SLOT'),
      value: draft.slot
        ? formatSlot(draft.slot.start_time, i18n.language)
        : undefined,
    },
  ];

  return (
    <div className="trial container">
      <header className="trial__header">
        <h1 className="trial__title">{t('TRIAL.TITLE')}</h1>
        <p className="trial__subtitle">
          {t('TRIAL.SUBTITLE', { count: steps.length })}
        </p>
      </header>

      <Stepper
        activeStep={stepIndex}
        alternativeLabel
        className={`trial__stepper ${rtlClass}`}
      >
        {steps.map((step, index) => (
          <Step key={step} completed={index < stepIndex}>
            <StepButton
              onClick={() => index < stepIndex && goTo(step)}
              disabled={index > stepIndex}
            >
              {labels[step]}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <div className="trial__layout">
        <div className="trial__card">
          {draft.step === 'child' && (
            <ChildStep
              childId={draft.childId}
              onNext={(childId) =>
                update({
                  childId,
                  // Another child: the tutors and slot are looked up afresh
                  tutorId:
                    childId === draft.childId ? draft.tutorId : undefined,
                  slot: childId === draft.childId ? draft.slot : undefined,
                  step: 'course',
                })
              }
            />
          )}
          {draft.step === 'course' && (
            <CourseStep
              courses={coursesQuery.data}
              loading={coursesQuery.isLoading}
              courseId={draft.courseId}
              onNext={(courseId) => {
                update({
                  courseId,
                  tutorId:
                    courseId === draft.courseId ? draft.tutorId : undefined,
                  slot: courseId === draft.courseId ? draft.slot : undefined,
                  step: 'when',
                });
              }}
            />
          )}
          {draft.step === 'when' && (
            <WhenStep
              from={draft.from}
              to={draft.to}
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
              onPickTutor={(tutorId) =>
                update({ tutorId, slot: undefined, step: 'slot' })
              }
              onPickSlot={(tutorId, slot) =>
                update({ tutorId, slot, step: 'confirm' })
              }
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
              tutor={tutor}
              slot={draft.slot}
              loading={tutorsQuery.isLoading || coursesQuery.isLoading}
              guardianPhone={
                draft.guardianPhone ||
                (isParent ? (currentUser?.phone_number ?? '') : '')
              }
              onGuardianPhone={(guardianPhone) => update({ guardianPhone })}
              signedIn={!!currentUser}
              onBack={() => goTo('slot')}
              onBooked={() => {
                clearDraft();
                setBooked(true);
              }}
            />
          )}
        </div>

        <aside className="trial__aside">
          <section className="trial__panel">
            <h2 className="trial__panel-title">{t('TRIAL.SUMMARY.TITLE')}</h2>
            <ol className="trial__picks">
              {summary.map((item) => (
                <li
                  key={item.key}
                  className={`trial__pick${item.value ? ' trial__pick--done' : ''}${
                    draft.step === item.key ? ' trial__pick--now' : ''
                  }`}
                >
                  <CheckCircleRounded
                    className="trial__pick-icon"
                    aria-hidden="true"
                  />
                  <span className="trial__pick-label">{item.label}</span>
                  <span className="trial__pick-value" dir="auto">
                    {item.value ?? t('TRIAL.SUMMARY.PENDING')}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="trial__panel trial__panel--expect">
            <h2 className="trial__panel-title">{t('TRIAL.EXPECT.TITLE')}</h2>
            <ul className="trial__expect">
              <li>
                <ScheduleRounded aria-hidden="true" />
                {t('TRIAL.EXPECT.LENGTH')}
              </li>
              <li>
                <VideocamRounded aria-hidden="true" />
                {t('TRIAL.EXPECT.ONLINE')}
              </li>
              <li>
                <PaidRounded aria-hidden="true" />
                {t('TRIAL.EXPECT.FREE')}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TrialPage;
