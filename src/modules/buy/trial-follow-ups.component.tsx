import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { ArrowForwardRounded, CardGiftcardRounded } from '@mui/icons-material';

import { getNameInitials } from '../../assets/utils/utils';
import { useTrialFollowUps } from '../../hooks/usePurchases';
import { subjectName } from '../dashboard/dashboard.utils';
import { formatSlot } from '../trial/trial.types';
import './buy.styles.scss';

/**
 * "Continue with Ms Sara": one card per free trial the family had recently
 * with a tutor the child has no package with yet. The button opens the buy
 * wizard with the child, course and tutor already picked.
 */
const TrialFollowUps: FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const followUps = useTrialFollowUps(enabled);
  const rows = followUps.data ?? [];
  if (rows.length === 0) return null;

  return (
    <ul className="buy-follow-ups">
      {rows.map((row) => (
        <li key={row.session_id} className="buy-follow-up">
          <div
            className="buy-follow-up__avatar"
            style={
              row.tutor_avatar
                ? { backgroundImage: `url(${row.tutor_avatar})` }
                : undefined
            }
            aria-hidden="true"
          >
            {row.tutor_avatar ? null : getNameInitials(row.tutor_name)}
          </div>
          <div className="buy-follow-up__text">
            <span className="buy-follow-up__title" dir="auto">
              {t('BUY.CONTINUE.TITLE', { tutor: row.tutor_first_name })}
            </span>
            <span className="buy-follow-up__meta" dir="auto">
              <CardGiftcardRounded fontSize="inherit" />{' '}
              {t('BUY.CONTINUE.META', {
                student: row.student_first_name,
                course: subjectName(row.course_name),
                date: formatSlot(row.trial_on, locale),
              })}
            </span>
          </div>
          <Button
            component={Link}
            to={row.buy_path}
            variant="contained"
            size="small"
            className="buy-follow-up__cta"
            endIcon={<ArrowForwardRounded className="sd-flip" />}
          >
            {t('BUY.CONTINUE.BUTTON', { tutor: row.tutor_first_name })}
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default TrialFollowUps;
