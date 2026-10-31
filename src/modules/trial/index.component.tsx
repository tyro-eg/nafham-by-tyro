import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Step, StepButton, Stepper } from '@mui/material';

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
  loadDraft,
  localTimeZone,
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

/**
 * The free-trial wizard, for visitors and signed-in students alike: course,
 * dates and time of day, the tutors our team ranks best for it, a slot,
 * then confirmation. A visitor creates their account at the last step; the
 * draft lives in sessionStorage so it survives the sign-up round trip.
 */
const TrialPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const [draft, setDraft] = useState<TrialDraft>(loadDraft);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = (patch: Partial<TrialDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const goTo = (step: WizardStep) => update({ step });

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

  const stepIndex = STEPS.indexOf(draft.step);
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
    course: t('TRIAL.STEPS.COURSE'),
    when: t('TRIAL.STEPS.WHEN'),
    tutors: t('TRIAL.STEPS.TUTOR'),
    slot: t('TRIAL.STEPS.SLOT'),
    confirm: t('TRIAL.STEPS.CONFIRM'),
  };

  return (
    <div className="trial container">
      <header className="trial__header">
        <h1 className="trial__title">{t('TRIAL.TITLE')}</h1>
        <p className="trial__subtitle">{t('TRIAL.SUBTITLE')}</p>
      </header>

      <Stepper
        activeStep={stepIndex}
        alternativeLabel
        className={`trial__stepper ${rtlClass}`}
      >
        {STEPS.map((step, index) => (
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

      <div className="trial__card">
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
      </div>
    </div>
  );
};

export default TrialPage;
