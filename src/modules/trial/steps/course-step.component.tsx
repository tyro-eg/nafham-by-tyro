import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';

interface CourseStepProps {
  courses?: GradeSubject[];
  loading: boolean;
  courseId?: number;
  onNext: (courseId: number) => void;
}

/** A curriculum, stage, subject or variant to choose from; 0 stands for "general" */
interface Option {
  id: number;
  name: string;
}

interface Picks {
  curriculum?: number;
  sub?: number;
  grade?: number;
  subject?: number;
  board?: number;
}

const NONE = '';

const distinct = (
  courses: GradeSubject[],
  read: (course: GradeSubject) => Option | null | undefined,
  general: string,
): Option[] => {
  const map = new Map<number, Option>();
  courses.forEach((course) => {
    const option = read(course);
    if (option) map.set(option.id, option);
    else map.set(0, { id: 0, name: general });
  });
  return Array.from(map.values()).sort((a, b) =>
    a.id === 0 ? -1 : b.id === 0 ? 1 : a.name.localeCompare(b.name),
  );
};

/** The picks that describe an already chosen course, so a reload shows them */
const picksFor = (course?: GradeSubject): Picks =>
  course
    ? {
        curriculum: course.curriculum.id,
        sub: course.sub_curriculum?.id ?? 0,
        grade: course.grade.id,
        subject: course.subject.id,
        board: course.exam_board?.id ?? 0,
      }
    : {};

/**
 * Curriculum, then level and exam board only when the curriculum has them,
 * stage and subject. Each list only offers what still leads to a course a
 * tutor teaches, and a list with a single entry is picked for you.
 */
const CourseStep: FC<CourseStepProps> = ({
  courses = [],
  loading,
  courseId,
  onNext,
}) => {
  const { t } = useTranslation();
  const general = t('TRIAL.COURSE.GENERAL');
  const [picks, setPicks] = useState<Picks>(() =>
    picksFor(courses.find((course) => course.id === courseId)),
  );

  const curriculumOptions = distinct(courses, (c) => c.curriculum, general);
  const curriculum =
    picks.curriculum ??
    (curriculumOptions.length === 1 ? curriculumOptions[0].id : undefined);
  const inCurriculum = courses.filter((c) => c.curriculum.id === curriculum);

  const subOptions = distinct(inCurriculum, (c) => c.sub_curriculum, general);
  const hasSubs = subOptions.some((option) => option.id !== 0);
  const sub = hasSubs
    ? (picks.sub ?? (subOptions.length === 1 ? subOptions[0].id : undefined))
    : 0;
  const afterSub = inCurriculum.filter(
    (c) => sub === undefined || (c.sub_curriculum?.id ?? 0) === sub,
  );

  const gradeOptions = distinct(afterSub, (c) => c.grade, general);
  const grade =
    picks.grade ?? (gradeOptions.length === 1 ? gradeOptions[0].id : undefined);
  const afterGrade = afterSub.filter((c) => c.grade.id === grade);

  const subjectOptions = distinct(afterGrade, (c) => c.subject, general);
  const subject =
    picks.subject ??
    (subjectOptions.length === 1 ? subjectOptions[0].id : undefined);
  const afterSubject = afterGrade.filter((c) => c.subject.id === subject);

  const boardOptions = distinct(afterSubject, (c) => c.exam_board, general);
  const hasBoards = boardOptions.some((option) => option.id !== 0);
  const board = hasBoards
    ? (picks.board ??
      (boardOptions.length === 1 ? boardOptions[0].id : undefined))
    : 0;
  const matches = afterSubject.filter(
    (c) => board === undefined || (c.exam_board?.id ?? 0) === board,
  );
  const resolved =
    subject !== undefined && board !== undefined ? matches[0] : undefined;

  const pick = (key: keyof Picks, value: string) => {
    const id = value === NONE ? undefined : Number(value);
    // Every pick below the changed one starts over
    const order: (keyof Picks)[] = [
      'curriculum',
      'sub',
      'grade',
      'subject',
      'board',
    ];
    const reset = order.slice(order.indexOf(key) + 1);
    setPicks((prev) => {
      const next: Picks = { ...prev, [key]: id };
      reset.forEach((later) => delete next[later]);
      return next;
    });
  };

  const select = (
    key: keyof Picks,
    label: string,
    options: Option[],
    value: number | undefined,
    disabled = false,
  ) => (
    <FormControl size="small" fullWidth disabled={disabled}>
      <InputLabel id={`trial-${key}-label`}>{label}</InputLabel>
      <Select
        labelId={`trial-${key}-label`}
        label={label}
        value={value === undefined ? NONE : String(value)}
        onChange={(event) => pick(key, String(event.target.value))}
      >
        {options.map((option) => (
          <MenuItem key={option.id} value={String(option.id)}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
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
        {select(
          'curriculum',
          t('TRIAL.COURSE.CURRICULUM'),
          curriculumOptions,
          curriculum,
        )}
        {hasSubs &&
          select('sub', t('TRIAL.COURSE.SUB_CURRICULUM'), subOptions, sub)}
        {select(
          'grade',
          t('TRIAL.COURSE.GRADE'),
          gradeOptions,
          grade,
          sub === undefined,
        )}
        {select(
          'subject',
          t('TRIAL.COURSE.SUBJECT'),
          subjectOptions,
          subject,
          grade === undefined,
        )}
        {hasBoards &&
          select(
            'board',
            t('TRIAL.COURSE.EXAM_BOARD'),
            boardOptions,
            board,
            subject === undefined,
          )}
      </div>
      {resolved && (
        <p className="trial__resolved">{resolved.full_course_name}</p>
      )}
      <div className="trial__actions">
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForward />}
          disabled={!resolved}
          onClick={() => resolved && onNext(resolved.id)}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default CourseStep;
