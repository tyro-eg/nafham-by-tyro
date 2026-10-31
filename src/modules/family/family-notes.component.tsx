import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { ArrowBackRounded } from '@mui/icons-material';
import { useFamily, useFamilyNotes } from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { formatDateTime } from '../homework/homework.utils';
import './family.styles.scss';

const ALL = 0;

/**
 * The lesson notes across the family, newest first: what was covered, where
 * the child struggled, what comes next. Written by the assistant after each
 * recorded lesson, in parent wording.
 */
const FamilyNotes: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const family = useFamily();
  const [childId, setChildId] = useState<number>(ALL);
  const notes = useFamilyNotes(childId === ALL ? undefined : childId);
  const children = family.data?.children ?? [];

  return (
    <div className={`family ${rtlClass}`}>
      <div className="container">
        <Link to="/family" className="family__back">
          <ArrowBackRounded aria-hidden="true" />
          {t('FAMILY.BACK')}
        </Link>
        <header className="family__header">
          <div>
            <h1 className="family__title">{t('FAMILY.NOTES.TITLE')}</h1>
            <p className="family__subtitle">{t('FAMILY.NOTES.SUBTITLE')}</p>
          </div>
          {children.length > 1 && (
            <TextField
              select
              size="small"
              value={childId}
              onChange={(e) => setChildId(Number(e.target.value))}
            >
              <MenuItem value={ALL}>{t('FAMILY.NOTES.ALL_CHILDREN')}</MenuItem>
              {children.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.first_name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </header>

        {notes.isLoading && <Skeleton variant="rounded" height={200} />}
        {notes.data && notes.data.length === 0 && (
          <div className="family__section family__empty">
            {t('FAMILY.NOTES.EMPTY')}
          </div>
        )}
        {notes.data && notes.data.length > 0 && (
          <ul className="family__list">
            {notes.data.map((note) => (
              <li key={note.id} className="family__section">
                <div className="family__row">
                  <h2 className="family__section-title">
                    {note.child.first_name} · {note.session.course_name}
                  </h2>
                  <span className="family__muted">
                    {formatDateTime(note.session.start_time, i18n.language)}
                  </span>
                </div>
                {note.summary && (
                  <p className="family__prose" dir="auto">
                    {note.summary}
                  </p>
                )}
                <dl className="family__facts">
                  <div>
                    <dt>{t('FAMILY.NOTES.COVERED')}</dt>
                    <dd dir="auto">{note.covered.join(' · ') || '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('FAMILY.NOTES.STRUGGLED')}</dt>
                    <dd dir="auto">{note.struggles.join(' · ') || '—'}</dd>
                  </div>
                  <div>
                    <dt>{t('FAMILY.NOTES.NEXT')}</dt>
                    <dd dir="auto">{note.next_steps.join(' · ') || '—'}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FamilyNotes;
