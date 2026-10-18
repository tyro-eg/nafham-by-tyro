import { FC, FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';
import {
  CheckCircleRounded,
  Close,
  SupportAgentRounded,
} from '@mui/icons-material';

import { usePackages } from '../../hooks/usePackages';
import { useMyInstructors } from '../../hooks/useInstructors';
import {
  sessionRequestErrorMessage,
  useCreateSessionRequest,
  type SessionRequestKind,
} from '../../hooks/useSessionRequests';
import type { Package } from '../../assets/types';

import './request-sessions-modal.styles.scss';

/** The minimum an instructor option needs; cards and profiles pass more */
export interface RequestInstructor {
  id: number;
  first_name: string;
  last_name: string;
  grade_subjects?: { id: number; full_course_name: string }[];
}

interface RequestSessionsModalProps {
  handleClose: () => void;
  /** Preselect (and lock) an instructor, e.g. from their card or profile */
  instructor?: RequestInstructor;
  defaultKind?: SessionRequestKind;
}

const NONE = '';

const fullName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`.trim();

/**
 * Students cannot book sessions themselves. This modal sends a request to
 * the support team, who schedule the sessions from the admin panel.
 */
const RequestSessionsModal: FC<RequestSessionsModalProps> = ({
  handleClose,
  instructor,
  defaultKind,
}) => {
  const { t } = useTranslation();
  const createRequest = useCreateSessionRequest();

  const { data: packagesData, isLoading: packagesLoading } = usePackages(
    1,
    100,
  );
  const { data: instructorsData } = useMyInstructors();

  const packages = useMemo(
    () => packagesData?.data ?? [],
    [packagesData?.data],
  );
  const hasHours = packages.some((pkg) => pkg.remaining_hours > 0);

  const [kind, setKind] = useState<SessionRequestKind>(
    defaultKind ?? (hasHours ? 'schedule' : 'more_hours'),
  );
  const [tutorId, setTutorId] = useState<string>(
    instructor ? String(instructor.id) : NONE,
  );
  const [courseId, setCourseId] = useState<string>(NONE);
  const [hours, setHours] = useState<string>('');
  const [preferredTimes, setPreferredTimes] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Once packages load, default to scheduling from existing hours
  useEffect(() => {
    if (!defaultKind && !packagesLoading && hasHours) setKind('schedule');
  }, [defaultKind, packagesLoading, hasHours]);

  /** Instructors the student can pick: their own, plus the preselected one */
  const instructorOptions = useMemo(() => {
    const map = new Map<number, RequestInstructor>();
    (instructorsData?.data ?? []).forEach((ins) => map.set(ins.id, ins));
    packages.forEach((pkg) => {
      if (!map.has(pkg.tutor.id)) map.set(pkg.tutor.id, pkg.tutor);
    });
    if (instructor) map.set(instructor.id, instructor);
    return Array.from(map.values());
  }, [instructorsData?.data, packages, instructor]);

  /** Courses relevant to the chosen instructor (or all of the student's) */
  const courseOptions = useMemo(() => {
    const map = new Map<number, string>();
    const relevant = tutorId
      ? packages.filter((pkg) => String(pkg.tutor.id) === tutorId)
      : packages;
    relevant.forEach((pkg) =>
      map.set(pkg.grade_subject.id, pkg.grade_subject.full_course_name),
    );
    if (instructor && String(instructor.id) === tutorId) {
      instructor.grade_subjects?.forEach((gs) =>
        map.set(gs.id, gs.full_course_name),
      );
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [packages, tutorId, instructor]);

  // With a single instructor there is nothing to choose: preselect them
  useEffect(() => {
    if (!tutorId && instructorOptions.length === 1) {
      setTutorId(String(instructorOptions[0].id));
    }
  }, [tutorId, instructorOptions]);

  // Same for the course; also drop one that no longer matches the instructor
  useEffect(() => {
    if (courseId && !courseOptions.some((c) => String(c.id) === courseId)) {
      setCourseId(NONE);
    } else if (!courseId && courseOptions.length === 1) {
      setCourseId(String(courseOptions[0].id));
    }
  }, [courseId, courseOptions]);

  /** The package the request is about, when tutor and course are known */
  const matchedPackage: Package | undefined = useMemo(
    () =>
      packages.find(
        (pkg) =>
          (!tutorId || String(pkg.tutor.id) === tutorId) &&
          (!courseId || String(pkg.grade_subject.id) === courseId) &&
          pkg.remaining_hours > 0,
      ),
    [packages, tutorId, courseId],
  );

  const needsTimes = kind !== 'more_hours';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (needsTimes && !preferredTimes.trim()) {
      setError(t('SESSION_REQUEST.REQUIRED_TIMES'));
      return;
    }

    try {
      await createRequest.mutateAsync({
        kind,
        tutor_id: tutorId ? Number(tutorId) : null,
        grade_subject_id: courseId ? Number(courseId) : null,
        package_id: kind === 'schedule' ? (matchedPackage?.id ?? null) : null,
        hours_requested: hours ? Number(hours) : null,
        preferred_times: preferredTimes.trim(),
        note: note.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(sessionRequestErrorMessage(err, t('SESSION_REQUEST.ERROR')));
    }
  };

  if (sent) {
    return (
      <div className="request-sessions-modal__success">
        <CheckCircleRounded className="request-sessions-modal__success-icon" />
        <h4 className="success-title">{t('SESSION_REQUEST.SUCCESS.TITLE')}</h4>
        <p className="success-text">{t('SESSION_REQUEST.SUCCESS.TEXT')}</p>
        <Button variant="contained" color="primary" onClick={handleClose}>
          {t('SESSION_REQUEST.SUCCESS.BUTTON')}
        </Button>
      </div>
    );
  }

  return (
    <form className="request-sessions-modal" onSubmit={submit} noValidate>
      <header className="request-sessions-modal__header">
        <div className="request-sessions-modal__icon">
          <SupportAgentRounded />
        </div>
        <div className="request-sessions-modal__heading">
          <h4 className="request-sessions-modal__title">
            {t('SESSION_REQUEST.TITLE')}
          </h4>
          <p className="request-sessions-modal__subtitle">
            {t('SESSION_REQUEST.SUBTITLE')}
          </p>
        </div>
        <IconButton
          aria-label={t('SESSION_REQUEST.CANCEL')}
          className="request-sessions-modal__close"
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </header>

      <div className="request-sessions-modal__body">
        <FormControl
          component="fieldset"
          className="request-sessions-modal__field"
        >
          <span className="request-sessions-modal__label">
            {t('SESSION_REQUEST.KIND.LABEL')}
          </span>
          <RadioGroup
            value={kind}
            onChange={(e) => setKind(e.target.value as SessionRequestKind)}
          >
            {hasHours && (
              <FormControlLabel
                value="schedule"
                control={<Radio size="small" />}
                label={t('SESSION_REQUEST.KIND.SCHEDULE')}
              />
            )}
            <FormControlLabel
              value="more_hours"
              control={<Radio size="small" />}
              label={t('SESSION_REQUEST.KIND.MORE_HOURS')}
            />
            <FormControlLabel
              value="trial"
              control={<Radio size="small" />}
              label={t('SESSION_REQUEST.KIND.TRIAL')}
            />
          </RadioGroup>
        </FormControl>

        <div className="request-sessions-modal__row">
          <FormControl className="request-sessions-modal__field" size="small">
            <InputLabel id="request-instructor-label">
              {t('SESSION_REQUEST.INSTRUCTOR')}
            </InputLabel>
            <Select
              labelId="request-instructor-label"
              label={t('SESSION_REQUEST.INSTRUCTOR')}
              value={tutorId}
              disabled={!!instructor}
              onChange={(e) => setTutorId(e.target.value)}
            >
              <MenuItem value={NONE}>
                {t('SESSION_REQUEST.ANY_INSTRUCTOR')}
              </MenuItem>
              {instructorOptions.map((ins) => (
                <MenuItem key={ins.id} value={String(ins.id)}>
                  {fullName(ins)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className="request-sessions-modal__field" size="small">
            <InputLabel id="request-course-label">
              {t('SESSION_REQUEST.COURSE')}
            </InputLabel>
            <Select
              labelId="request-course-label"
              label={t('SESSION_REQUEST.COURSE')}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <MenuItem value={NONE}>
                {t('SESSION_REQUEST.ANY_COURSE')}
              </MenuItem>
              {courseOptions.map((course) => (
                <MenuItem key={course.id} value={String(course.id)}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {kind === 'schedule' && matchedPackage && (
          <p className="request-sessions-modal__hint">
            {t('SESSION_REQUEST.HOURS_LEFT', {
              hours: matchedPackage.remaining_hours,
              course: matchedPackage.grade_subject.full_course_name,
            })}
          </p>
        )}

        <TextField
          className="request-sessions-modal__field"
          size="small"
          type="number"
          label={t('SESSION_REQUEST.HOURS')}
          helperText={t('SESSION_REQUEST.HOURS_HINT')}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          inputProps={{ min: 1, max: 100, step: 1 }}
        />

        <TextField
          className="request-sessions-modal__field"
          size="small"
          multiline
          minRows={2}
          required={needsTimes}
          label={t('SESSION_REQUEST.PREFERRED_TIMES')}
          placeholder={t('SESSION_REQUEST.PREFERRED_TIMES_PLACEHOLDER')}
          value={preferredTimes}
          onChange={(e) => setPreferredTimes(e.target.value)}
          inputProps={{ maxLength: 1000 }}
        />

        <TextField
          className="request-sessions-modal__field"
          size="small"
          multiline
          minRows={2}
          label={t('SESSION_REQUEST.NOTE')}
          placeholder={t('SESSION_REQUEST.NOTE_PLACEHOLDER')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          inputProps={{ maxLength: 2000 }}
        />

        {error && <Alert severity="error">{error}</Alert>}
      </div>

      <footer className="request-sessions-modal__footer">
        <Button variant="outlined" onClick={handleClose}>
          {t('SESSION_REQUEST.CANCEL')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={createRequest.isPending}
        >
          {t('SESSION_REQUEST.SUBMIT')}
        </Button>
      </footer>
    </form>
  );
};

export default RequestSessionsModal;
