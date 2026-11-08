import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EventRepeatRounded,
  FamilyRestroomRounded,
  HourglassBottomRounded,
  MenuBookRounded,
  PeopleAltRounded,
  ShoppingBasketRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import { useFamily } from '../../hooks/useFamily';
import { useTrialCourses } from '../../hooks/useTrial';
import { usePurchaseTutors, type TutorSearch } from '../../hooks/usePurchases';
import { trackEvent } from '../../lib/analytics';
import { formatMoney } from '../../lib/money';
import {
  scheduleIsEmpty,
  scheduleSummary,
  type ScheduleWindow,
} from '../../lib/weekly-schedule';
import OpenPaymentBanner from '../payments/open-payment-banner.component';
import {
  DEFAULT_HOURS,
  clearDraft,
  courseKey,
  draftFrom,
  loadDraft,
  saveDraft,
  stepsFor,
  type BasketLine,
  type BuyDraft,
  type Step,
  type TutorChoice,
} from './buy.types';
import BuyGuard from './buy-guard.component';
import BuyRail from './buy-rail.component';
import AlreadyLearningNotice from './already-learning-notice.component';
import WhoStep from './steps/who-step.component';
import CourseStep from '../trial/steps/course-step.component';
import WhenStep from './steps/when-step.component';
import TutorsStep from './steps/tutors-step.component';
import HoursStep from './steps/hours-step.component';
import BasketStep from './steps/basket-step.component';

import '../trial/trial.styles.scss';
import './buy.styles.scss';

const ICONS: Record<Step, JSX.Element> = {
  who: <FamilyRestroomRounded />,
  what: <MenuBookRounded />,
  when: <EventRepeatRounded />,
  tutors: <PeopleAltRounded />,
  hours: <HourglassBottomRounded />,
  basket: <ShoppingBasketRounded />,
};

const BUNDLE = { minSubjects: 4, discountPercent: 5 };

/**
 * The buy wizard: who the course is for, which course, the weekly times,
 * who teaches (a ranked list, the tutors the child trialed with, or Nafham
 * matching one), how many hours, then the basket and one payment. The
 * draft lives in sessionStorage per payer and survives the trip to Nomod.
 */
const BuyPage: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const locale = `${i18n.language}-u-nu-latn`;
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const isAdult = currentUser?.type === 'Student' && !currentUser.family_id;
  // The profile's country, when the API sends one; the family's wins for a parent
  const payerCountry = (currentUser as { country_code?: string | null } | null)
    ?.country_code;
  const userId = currentUser?.id ?? 0;
  const [params, setParams] = useSearchParams();
  const initial = useRef(draftFrom(loadDraft(userId), isParent, params));
  const [draft, setDraft] = useState<BuyDraft>(initial.current.draft);
  const steps = stepsFor(isParent);

  // The link's picks are in the draft now; keep the address clean
  useEffect(() => {
    if ([...params.keys()].length) setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveDraft(userId, draft);
  }, [draft, userId]);

  const update = (patch: Partial<BuyDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const goTo = (step: Step) => {
    update({ step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const family = useFamily(isParent);
  const child = family.data?.children.find((c) => c.id === draft.childId);
  const studentId = isParent ? draft.childId : currentUser?.id;
  const studentName = isParent
    ? (child?.first_name ?? '')
    : (currentUser?.first_name ?? '');

  const coursesQuery = useTrialCourses();

  // A link naming a course the catalog does not offer (or one removed since
  // the draft was saved) drops back to the course step rather than stalling
  useEffect(() => {
    if (!coursesQuery.data || draft.courseId === undefined) return;
    if (coursesQuery.data.some((item) => item.id === draft.courseId)) return;
    setDraft((prev) => ({
      ...prev,
      courseId: undefined,
      examBoardId: undefined,
      choice: undefined,
      step: ['when', 'tutors', 'hours'].includes(prev.step)
        ? 'what'
        : prev.step,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesQuery.data, draft.courseId]);
  const course = coursesQuery.data?.find((item) => item.id === draft.courseId);

  // The course the picks on the course step resolve to, before Continue, so
  // a subject the child already learns is flagged right there
  const [resolvedCourseId, setResolvedCourseId] = useState<number>();
  const onResolve = useCallback(
    (id: number | undefined) => setResolvedCourseId(id),
    [],
  );
  const resolvedCourse = coursesQuery.data?.find(
    (item) => item.id === resolvedCourseId,
  );
  const alreadyLearning = useMemo(() => {
    if (!resolvedCourse || !child) return null;
    const wanted = courseKey(resolvedCourse.full_course_name);
    return (
      child.packages.find((pkg) => courseKey(pkg.course_name) === wanted) ??
      null
    );
  }, [resolvedCourse, child]);
  const board = course?.exam_boards.find((b) => b.id === draft.examBoardId);

  const search = useMemo<TutorSearch | null>(() => {
    if (!studentId || !course) return null;
    return {
      student_id: studentId,
      grade_subject_id: course.id,
      exam_board_id: draft.examBoardId,
      hours: draft.hours ?? DEFAULT_HOURS,
      days: draft.schedule.days,
      windows: draft.schedule.windows,
      lessons_per_week: draft.schedule.lessons_per_week,
      time_zone: draft.schedule.time_zone,
    };
  }, [studentId, course, draft.examBoardId, draft.hours, draft.schedule]);
  const stepIndex = steps.indexOf(draft.step);
  const tutorsQuery = usePurchaseTutors(
    stepIndex >= steps.indexOf('tutors') ? search : null,
  );

  useEffect(() => {
    if (!tutorsQuery.data || !course) return;
    trackEvent(
      'Purchase',
      'view_item_list',
      course.full_course_name,
      undefined,
      {
        item_list_id: `course-${course.id}`,
        items: tutorsQuery.data.tutors.length,
      },
    );
  }, [tutorsQuery.data, course]);

  const pricing = draft.pricing ??
    (tutorsQuery.data && {
      currency: tutorsQuery.data.currency,
      vatApplies: tutorsQuery.data.vat_applies,
      vatRatePercent: 5,
    }) ?? { currency: 'AED', vatApplies: false, vatRatePercent: 5 };

  if (!currentUser || (!isParent && !isAdult)) {
    return <BuyGuard child={currentUser?.type === 'Student'} />;
  }

  const windowLabel = (w: ScheduleWindow) => t(`BUY.WHEN.${w.toUpperCase()}`);
  const lessonsLabel = (n: number) => t('BUY.WHEN.LESSONS_COUNT', { count: n });
  const choiceLabel = (choice?: TutorChoice) =>
    !choice
      ? undefined
      : choice.kind === 'match'
        ? t('BUY.TUTORS.MATCH_TITLE')
        : choice.tutorName;

  const labels: Record<Step, string> = {
    who: t('BUY.STEPS.WHO'),
    what: t('BUY.STEPS.WHAT'),
    when: t('BUY.STEPS.WHEN'),
    tutors: t('BUY.STEPS.TUTORS'),
    hours: t('BUY.STEPS.HOURS'),
    basket: t('BUY.STEPS.BASKET'),
  };
  const chosen: Record<Step, string | undefined> = {
    who: child ? `${child.first_name} ${child.last_name}`.trim() : undefined,
    what:
      course && `${course.full_course_name}${board ? ` · ${board.name}` : ''}`,
    when: scheduleIsEmpty(draft.schedule)
      ? undefined
      : scheduleSummary(draft.schedule, locale, {
          window: windowLabel,
          lessons: lessonsLabel,
        }),
    tutors: choiceLabel(draft.choice),
    hours: draft.hours
      ? t('PAYMENTS.RENEW.HOURS', { count: draft.hours })
      : undefined,
    basket:
      draft.basket.length > 0
        ? t('BUY.BASKET.COUNT', { count: draft.basket.length })
        : undefined,
  };

  const addLine = (
    option: { hours: number; price: number; vat: number; floor_price: number },
    quote: { currency: string; vatApplies: boolean; vatRatePercent: number },
  ) => {
    if (!course || !studentId || !draft.choice) return;
    const line: BasketLine = {
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      studentId,
      studentName,
      courseId: course.id,
      courseName: course.full_course_name,
      examBoardId: draft.examBoardId,
      examBoardName: board?.name,
      choice: draft.choice,
      hours: option.hours,
      price: option.price,
      vat: option.vat,
      floorPrice: option.floor_price,
      schedule: draft.schedule,
    };
    trackEvent(
      'Purchase',
      'add_to_cart',
      course.full_course_name,
      option.price,
      {
        currency: quote.currency,
        hours: option.hours,
        kind: draft.choice.kind,
      },
    );
    update({
      basket: [...draft.basket, line],
      hours: option.hours,
      pricing: quote,
      choice: undefined,
    });
    goTo('basket');
  };

  return (
    <div className={`trial buy ${rtlClass}`}>
      <div className="trial__container container">
        <header className="trial__header">
          <span className="trial__eyebrow">{t('BUY.EYEBROW')}</span>
          <h1 className="trial__title">{t('BUY.TITLE')}</h1>
          <p className="trial__subtitle">{t('BUY.SUBTITLE')}</p>
        </header>

        <OpenPaymentBanner />

        <div className="trial__layout">
          <BuyRail
            steps={steps}
            stepIndex={stepIndex}
            icons={ICONS}
            labels={labels}
            chosen={chosen}
            basketCount={draft.basket.length}
            basketAmount={formatMoney(
              draft.basket.reduce((sum, line) => sum + line.price, 0),
              pricing.currency,
              i18n.language,
            )}
            onGo={goTo}
          />

          <section className="trial__card" key={draft.step}>
            <div className="trial__step-head">
              <span className="trial__step-icon">{ICONS[draft.step]}</span>
              <span className="trial__step-count">
                {t('BUY.STEP_COUNT', {
                  step: stepIndex + 1,
                  count: steps.length,
                })}
              </span>
            </div>

            {draft.step === 'who' && (
              <WhoStep
                childId={draft.childId}
                onNext={(childId) => {
                  update({
                    childId,
                    choice:
                      childId === draft.childId ? draft.choice : undefined,
                  });
                  goTo('what');
                }}
              />
            )}
            {draft.step === 'what' && (
              <CourseStep
                key={coursesQuery.data ? 'ready' : 'loading'}
                courses={coursesQuery.data}
                loading={coursesQuery.isLoading}
                courseId={draft.courseId}
                examBoardId={draft.examBoardId}
                title={t('BUY.WHAT.TITLE', { name: studentName })}
                onResolve={onResolve}
                notice={
                  alreadyLearning && (
                    <AlreadyLearningNotice
                      studentName={studentName}
                      pkg={alreadyLearning}
                      onRenew={() => {
                        update({
                          courseId: resolvedCourseId,
                          examBoardId: undefined,
                          choice: {
                            kind: 'renewal',
                            packageId: alreadyLearning.id,
                            tutorName: alreadyLearning.tutor_name,
                          },
                        });
                        goTo('hours');
                      }}
                    />
                  )
                }
                onNext={(courseId, examBoardId) => {
                  const same =
                    courseId === draft.courseId &&
                    examBoardId === draft.examBoardId;
                  update({
                    courseId,
                    examBoardId,
                    choice: same ? draft.choice : undefined,
                  });
                  goTo('when');
                }}
              />
            )}
            {draft.step === 'when' && (
              <WhenStep
                schedule={draft.schedule}
                onChange={(schedule) => update({ schedule })}
                onBack={() => goTo('what')}
                onNext={() => goTo('tutors')}
              />
            )}
            {draft.step === 'tutors' && (
              <TutorsStep
                result={tutorsQuery.data}
                loading={tutorsQuery.isLoading || coursesQuery.isLoading}
                failed={tutorsQuery.isError}
                schedule={draft.schedule}
                preferredTutorId={initial.current.preferredTutorId}
                onChoose={(choice) => {
                  trackEvent(
                    'Purchase',
                    'select_item',
                    choiceLabel(choice),
                    undefined,
                    {
                      kind: choice.kind,
                    },
                  );
                  update({ choice });
                  goTo('hours');
                }}
                onAddTimes={() => goTo('when')}
                onBack={() => goTo('when')}
              />
            )}
            {draft.step === 'hours' && studentId && course && draft.choice && (
              <HoursStep
                studentId={studentId}
                courseId={course.id}
                examBoardId={draft.examBoardId}
                choice={draft.choice}
                lessonsPerWeek={draft.schedule.lessons_per_week}
                hours={draft.hours}
                onAdd={addLine}
                onBack={() => goTo('tutors')}
              />
            )}
            {draft.step === 'basket' && (
              <BasketStep
                lines={draft.basket}
                currency={pricing.currency}
                vatApplies={pricing.vatApplies}
                vatRatePercent={pricing.vatRatePercent}
                termsPending={
                  isParent && !!family.data && !family.data.terms.accepted
                }
                countryMissing={
                  isParent
                    ? !!family.data &&
                      !family.data.country_code &&
                      !payerCountry
                    : !payerCountry
                }
                bundle={BUNDLE}
                onRemove={(key) =>
                  update({
                    basket: draft.basket.filter((line) => line.key !== key),
                  })
                }
                onAddAnother={() => {
                  update({
                    courseId: undefined,
                    examBoardId: undefined,
                    choice: undefined,
                  });
                  goTo(isParent ? 'who' : 'what');
                }}
                onBack={() => goTo(draft.choice ? 'hours' : 'tutors')}
                onPaid={() => clearDraft(userId)}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
