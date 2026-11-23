import { FC, MouseEvent, useEffect } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowBackRounded } from '@mui/icons-material';
import { backTarget, recordPage } from '../../lib/back-trail';
import './back-link.styles.scss';

/**
 * The one Back button of the website (23 Nov 2026): a small pill above the
 * page title. It goes to the page you came from in this tab, named after it
 * ("My Tutors"); opened from a link or a new tab, to `fallback` instead.
 * `label` overrides the words (e.g. "Back to homework").
 */
export const BackLink: FC<{
  fallback: string;
  label?: string;
  className?: string;
  testId?: string;
}> = ({ fallback, label, className = '', testId = 'back-link' }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const target = backTarget(location.key !== 'default', fallback);
  const place = label ?? t(target.labelKey);
  const onClick = (event: MouseEvent) => {
    if (!target.useHistory) return;
    event.preventDefault();
    navigate(-1);
  };
  return (
    <Link
      to={target.to}
      onClick={onClick}
      className={`back-link ${className}`}
      aria-label={
        label ??
        (target.labelKey === 'BACK_LINK.BACK'
          ? place
          : t('BACK_LINK.TO', { place }))
      }
      data-testid={testId}
    >
      <ArrowBackRounded aria-hidden="true" />
      <span>{place}</span>
    </Link>
  );
};

/** Keeps the page before this one, for BackLink's words. Mounted once in Routes. */
export const BackTrail: FC = () => {
  const location = useLocation();
  const how = useNavigationType();
  useEffect(() => {
    recordPage(`${location.pathname}${location.search}`, how === 'REPLACE');
  }, [location.pathname, location.search, how]);
  return null;
};

export default BackLink;
