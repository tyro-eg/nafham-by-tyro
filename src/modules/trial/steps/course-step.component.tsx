import { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CircularProgress,
  FormControl,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { ArrowForwardRounded, CheckCircleRounded } from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import type { TrialCourse } from '../../../hooks/useTrial';
import type { Choice } from './choice-chips.component';
import {
  STAGES,
  asksExamBoard,
  asksLevel,
  compareGrades,
  curriculumName,
  isIGCSE,
  shownCurriculum,
  stageOf,
  type Stage,
} from './course-map';

interface CourseStepProps {
  courses?: TrialCourse[];
  loading: boolean;
  courseId?: number;
  examBoardId?: number;
  /** The question asked; the trial's by default, the buy wizard asks its own */
  title?: string;
  /** Told which course the picks currently resolve to, as they change */
  onResolve?: (courseId: number | undefined) => void;
  /** Shown under the resolved course (the buy wizard's "already learning") */
  notice?: ReactNode;
  onNext: (courseId: number, examBoardId?: number) => void;
}

/**
 * Picks are names, not ids: one curriculum can join several of the backend's
 * (British System and IGCSE), each with its own grade and level ids.
 */
interface Picks {
  curriculum?: string;
  grade?: string;
  sub?: string;
  subject?: string;
  board?: number;
}

const ORDER: (keyof Picks)[] = [
  'curriculum',
  'grade',
  'sub',
  'subject',
  'board',
];

/** A choice under a heading (a grade under its stage) */
type Grouped = Choice & { group?: Stage };

/** The "general" choice: a course with no level */
const GENERAL = '__general__';

/** The distinct names of one part of a course, "general" first */
const distinct = (
  courses: GradeSubject[],
  read: (
    course: GradeSubject,
  ) => { name: string; position?: number } | null | undefined,
  general: string,
): Choice[] => {
  const map = new Map<string, Choice>();
  const positions = new Map<string, number>();
  courses.forEach((course) => {
    const part = read(course);
    if (part) {
      map.set(part.name, { id: part.name, label: part.name });
      if (part.position !== undefined) positions.set(part.name, part.position);
    } else map.set(GENERAL, { id: GENERAL, label: general });
  });
  // Levels come in their taught order (OL, AS, A2, AL); the rest alphabetically
  return Array.from(map.values()).sort((a, b) => {
    if (a.id === GENERAL || b.id === GENERAL) return a.id === GENERAL ? -1 : 1;
    const byPosition =
      (positions.get(String(a.id)) ?? 0) - (positions.get(String(b.id)) ?? 0);
    return (
      byPosition || a.label.localeCompare(b.label, undefined, { numeric: true })
    );
  });
};

/** The curriculum a course is offered under (IGCSE under British System) */
const curriculumOf = (course: GradeSubject) =>
  curriculumName(course.curriculum.name);

/** The picks that describe an already chosen course, so a reload shows them */
const picksFor = (course?: GradeSubject, examBoardId?: number): Picks =>
  course
    ? {
        curriculum: curriculumOf(course),
        sub: course.sub_curriculum?.name ?? GENERAL,
        grade: course.grade.name,
        subject: course.subject.name,
        board: examBoardId,
      }
    : {};

/**
 * Nafham System's course map (see course-map.ts): curriculum, then grade
 * (under its stage), a level only for IGCSE, American and IB at Secondary,
 * subject, and an exam board only for IGCSE. Each group only offers what
 * still leads to a course a tutor teaches; a group with a single entry is
 * picked for you.
 */
const CourseStep: FC<CourseStepProps> = ({
  courses = [],
  loading,
  courseId,
  examBoardId,
  title,
  onResolve,
  notice,
  onNext,
}) => {
  const { t } = useTranslation();
  const general = t('TRIAL.COURSE.GENERAL');
  const [picks, setPicks] = useState<Picks>(() =>
    picksFor(
      courses.find((course) => course.id === courseId),
      examBoardId,
    ),
  );

  const shown = courses.filter((c) => shownCurriculum(c.curriculum.name));
  const curriculumOptions = Array.from(new Set(shown.map(curriculumOf)))
    .sort((a, b) => a.localeCompare(b))
    .map((name): Choice => ({ id: name, label: name }));
  const curriculum =
    picks.curriculum ??
    (curriculumOptions.length === 1
      ? String(curriculumOptions[0].id)
      : undefined);
  const inCurriculum = shown.filter((c) => curriculumOf(c) === curriculum);
  const curriculumLabel = curriculum ?? '';

  // Grades under their stage (Primary: G1…G6), stages in taught order
  const gradeOptions = distinct(inCurriculum, (c) => c.grade, general)
    .map(
      (option): Grouped => ({
        ...option,
        group: stageOf(option.label, curriculumLabel),
      }),
    )
    .sort(
      (a, b) =>
        STAGES.indexOf(a.group ?? 'OTHER') -
          STAGES.indexOf(b.group ?? 'OTHER') || compareGrades(a.label, b.label),
    );
  const grade =
    picks.grade ??
    (gradeOptions.length === 1 ? String(gradeOptions[0].id) : undefined);
  const afterGrade = inCurriculum.filter((c) => c.grade.name === grade);
  const stage = gradeOptions.find((option) => option.id === grade)?.group;

  // A level only where Nafham System asks one; elsewhere every variant counts
  const levelAsked = !!stage && asksLevel(curriculumLabel, stage);
  const subOptions = levelAsked
    ? distinct(afterGrade, (c) => c.sub_curriculum, general)
    : [];
  const hasSubs = subOptions.some((option) => option.id !== GENERAL);
  const sub = hasSubs
    ? (picks.sub ??
      (subOptions.length === 1 ? String(subOptions[0].id) : undefined))
    : undefined;
  const afterSub = hasSubs
    ? afterGrade.filter((c) => (c.sub_curriculum?.name ?? GENERAL) === sub)
    : afterGrade;

  const subjectOptions = distinct(afterSub, (c) => c.subject, general);
  const subject =
    picks.subject ??
    (subjectOptions.length === 1 ? String(subjectOptions[0].id) : undefined);
  const afterSubject = afterSub.filter((c) => c.subject.name === subject);

  // The course itself. British Secondary is IGCSE: its IGCSE course first.
  // Then the plain one (no level, no board) when there is one.
  const boardAsked = !!stage && asksExamBoard(curriculumLabel, stage);
  const candidates = boardAsked
    ? [
        ...afterSubject.filter((c) => isIGCSE(c.curriculum.name)),
        ...afterSubject.filter((c) => !isIGCSE(c.curriculum.name)),
      ]
    : afterSubject;
  const resolved =
    subject !== undefined && (!hasSubs || sub !== undefined)
      ? (candidates.find((c) => !c.sub_curriculum && !c.exam_board) ??
        candidates.find((c) => !c.exam_board) ??
        candidates[0])
      : undefined;

  // The board the student sits: British Secondary (IGCSE) only, once the
  // course's tutors declare any
  const boardOptions: Choice[] = boardAsked
    ? (resolved?.exam_boards ?? []).map((b) => ({ id: b.id, label: b.name }))
    : [];
  const hasBoards = boardOptions.length > 0;
  const board = hasBoards
    ? (picks.board ??
      (boardOptions.length === 1 ? Number(boardOptions[0].id) : undefined))
    : undefined;
  const complete = !!resolved && (!hasBoards || board !== undefined);

  const resolvedId = resolved?.id;
  useEffect(() => {
    onResolve?.(resolvedId);
  }, [resolvedId, onResolve]);

  const pick = (key: keyof Picks) => (id: Choice['id']) => {
    // Every pick below the changed one starts over
    const reset = ORDER.slice(ORDER.indexOf(key) + 1);
    setPicks((prev) => {
      const next: Picks = {
        ...prev,
        [key]: key === 'board' ? Number(id) : String(id),
      };
      reset.forEach((later) => delete next[later]);
      return next;
    });
  };

  const NONE = '';
  const field = (
    key: keyof Picks,
    label: string,
    options: Grouped[],
    value: Choice['id'] | undefined,
  ) => (
    <div className="trial-field">
      <span className="trial-field__label" id={`trial-${key}-label`}>
        {label}
      </span>
      <FormControl fullWidth>
        <Select
          className="trial-select"
          labelId={`trial-${key}-label`}
          displayEmpty
          value={value === undefined ? NONE : String(value)}
          onChange={(event) => pick(key)(String(event.target.value))}
          renderValue={(selected) =>
            selected === NONE ? (
              <span className="trial-select__placeholder">
                {t('TRIAL.COURSE.PLACEHOLDER')}
              </span>
            ) : (
              options.find((option) => String(option.id) === selected)?.label
            )
          }
          MenuProps={{ className: 'trial-select__menu' }}
        >
          {options.flatMap((option, index) => {
            const item = (
              <MenuItem key={option.id} value={String(option.id)}>
                {option.label}
              </MenuItem>
            );
            const heading =
              option.group && option.group !== options[index - 1]?.group;
            return heading
              ? [
                  <ListSubheader
                    key={`stage-${option.group}`}
                    className="trial-select__group"
                  >
                    {t(`TRIAL.COURSE.STAGES.${option.group}`)}
                  </ListSubheader>,
                  item,
                ]
              : [item];
          })}
        </Select>
      </FormControl>
    </div>
  );

  if (loading) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
        <span>{t('TRIAL.COURSE.LOADING')}</span>
      </div>
    );
  }

  if (!courses.length) {
    return <p className="trial__empty">{t('TRIAL.COURSE.EMPTY')}</p>;
  }

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{title ?? t('TRIAL.COURSE.TITLE')}</h2>

      <div className="trial__fields">
        {field(
          'curriculum',
          t('TRIAL.COURSE.CURRICULUM'),
          curriculumOptions,
          curriculum,
        )}
        {curriculum !== undefined &&
          field('grade', t('TRIAL.COURSE.GRADE'), gradeOptions, grade)}
        {hasSubs &&
          field('sub', t('TRIAL.COURSE.SUB_CURRICULUM'), subOptions, sub)}
        {grade !== undefined &&
          (!hasSubs || sub !== undefined) &&
          field('subject', t('TRIAL.COURSE.SUBJECT'), subjectOptions, subject)}
        {hasBoards &&
          field('board', t('TRIAL.COURSE.EXAM_BOARD'), boardOptions, board)}
      </div>

      {resolved && notice}

      {complete && resolved && (
        <p className="trial__resolved">
          <CheckCircleRounded />
          {resolved.full_course_name}
          {board !== undefined && (
            <span className="trial__resolved-board">
              {boardOptions.find((option) => option.id === board)?.label}
            </span>
          )}
        </p>
      )}

      <div className="trial__actions">
        <Button
          className="trial__cta"
          variant="contained"
          endIcon={<ArrowForwardRounded />}
          disabled={!complete}
          onClick={() => resolved && onNext(resolved.id, board)}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default CourseStep;
