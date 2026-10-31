import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material';
import { ArrowForwardRounded, CheckCircleRounded } from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import type { TrialCourse } from '../../../hooks/useTrial';
import type { Choice } from './choice-chips.component';

interface CourseStepProps {
  courses?: TrialCourse[];
  loading: boolean;
  courseId?: number;
  examBoardId?: number;
  onNext: (courseId: number, examBoardId?: number) => void;
}

interface Picks {
  curriculum?: number;
  sub?: number;
  grade?: number;
  subject?: number;
  board?: number;
}

const ORDER: (keyof Picks)[] = [
  'curriculum',
  'sub',
  'grade',
  'subject',
  'board',
];

/** The distinct values of one part of a course, "general" (0) first */
const distinct = (
  courses: GradeSubject[],
  read: (
    course: GradeSubject,
  ) => { id: number; name: string } | null | undefined,
  general: string,
): Choice[] => {
  const map = new Map<number, Choice>();
  courses.forEach((course) => {
    const part = read(course);
    if (part) map.set(part.id, { id: part.id, label: part.name });
    else map.set(0, { id: 0, label: general });
  });
  return Array.from(map.values()).sort((a, b) =>
    a.id === 0
      ? -1
      : b.id === 0
        ? 1
        : a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
};

/** The picks that describe an already chosen course, so a reload shows them */
const picksFor = (course?: GradeSubject, examBoardId?: number): Picks =>
  course
    ? {
        curriculum: course.curriculum.id,
        sub: course.sub_curriculum?.id ?? 0,
        grade: course.grade.id,
        subject: course.subject.id,
        board: examBoardId,
      }
    : {};

/**
 * Curriculum, then level and exam board only when the curriculum has them,
 * stage and subject. Each group only offers what still leads to a course a
 * tutor teaches; a group with a single entry is picked for you.
 */
const CourseStep: FC<CourseStepProps> = ({
  courses = [],
  loading,
  courseId,
  examBoardId,
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

  const curriculumOptions = distinct(courses, (c) => c.curriculum, general);
  const curriculum =
    picks.curriculum ??
    (curriculumOptions.length === 1
      ? Number(curriculumOptions[0].id)
      : undefined);
  const inCurriculum = courses.filter((c) => c.curriculum.id === curriculum);

  const subOptions = distinct(inCurriculum, (c) => c.sub_curriculum, general);
  const hasSubs = subOptions.some((option) => option.id !== 0);
  const sub = hasSubs
    ? (picks.sub ??
      (subOptions.length === 1 ? Number(subOptions[0].id) : undefined))
    : 0;
  const afterSub = inCurriculum.filter(
    (c) => sub === undefined || (c.sub_curriculum?.id ?? 0) === sub,
  );

  const gradeOptions = distinct(afterSub, (c) => c.grade, general);
  const grade =
    picks.grade ??
    (gradeOptions.length === 1 ? Number(gradeOptions[0].id) : undefined);
  const afterGrade = afterSub.filter((c) => c.grade.id === grade);

  const subjectOptions = distinct(afterGrade, (c) => c.subject, general);
  const subject =
    picks.subject ??
    (subjectOptions.length === 1 ? Number(subjectOptions[0].id) : undefined);
  const afterSubject = afterGrade.filter((c) => c.subject.id === subject);

  // The course itself; a course split by board (legacy variants) resolves to its general entry
  const resolved =
    subject !== undefined
      ? (afterSubject.find((c) => !c.exam_board) ?? afterSubject[0])
      : undefined;

  // The board the student sits: required once the course's tutors declare any
  const boardOptions: Choice[] = (resolved?.exam_boards ?? []).map((b) => ({
    id: b.id,
    label: b.name,
  }));
  const hasBoards = boardOptions.length > 0;
  const board = hasBoards
    ? (picks.board ??
      (boardOptions.length === 1 ? Number(boardOptions[0].id) : undefined))
    : undefined;
  const complete = !!resolved && (!hasBoards || board !== undefined);

  const pick = (key: keyof Picks) => (id: Choice['id']) => {
    // Every pick below the changed one starts over
    const reset = ORDER.slice(ORDER.indexOf(key) + 1);
    setPicks((prev) => {
      const next: Picks = { ...prev, [key]: Number(id) };
      reset.forEach((later) => delete next[later]);
      return next;
    });
  };

  const NONE = '';
  const field = (
    key: keyof Picks,
    label: string,
    options: Choice[],
    value: number | undefined,
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
          {options.map((option) => (
            <MenuItem key={option.id} value={String(option.id)}>
              {option.label}
            </MenuItem>
          ))}
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
      <h2 className="trial__step-title">{t('TRIAL.COURSE.TITLE')}</h2>

      <div className="trial__fields">
        {field(
          'curriculum',
          t('TRIAL.COURSE.CURRICULUM'),
          curriculumOptions,
          curriculum,
        )}
        {hasSubs &&
          curriculum !== undefined &&
          field('sub', t('TRIAL.COURSE.SUB_CURRICULUM'), subOptions, sub)}
        {sub !== undefined &&
          field('grade', t('TRIAL.COURSE.GRADE'), gradeOptions, grade)}
        {grade !== undefined &&
          field('subject', t('TRIAL.COURSE.SUBJECT'), subjectOptions, subject)}
        {hasBoards &&
          field('board', t('TRIAL.COURSE.EXAM_BOARD'), boardOptions, board)}
      </div>

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
