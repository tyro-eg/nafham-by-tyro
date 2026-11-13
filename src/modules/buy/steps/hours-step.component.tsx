import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Skeleton } from '@mui/material';
import { AddShoppingCartRounded, ArrowBackRounded } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';

import {
  paymentErrorMessage,
  useRenewalOptions,
  type RenewalOption,
} from '../../../hooks/usePayments';
import { usePurchaseOptions } from '../../../hooks/usePurchases';
import { formatMoney } from '../../../lib/money';
import type { TutorChoice } from '../buy.types';

const LOCALES = { ar: arSA, en: enUS };

interface HoursStepProps {
  studentId: number;
  courseId: number;
  examBoardId?: number;
  choice: TutorChoice;
  lessonsPerWeek?: number;
  hours?: number;
  onAdd: (
    option: RenewalOption,
    quote: { currency: string; vatApplies: boolean; vatRatePercent: number },
  ) => void;
  onBack: () => void;
}

/**
 * How many hours: every size on the price list that applies to the chosen
 * tutor (or to a standard tutor for a match, or to the package being
 * renewed), priced today with VAT when the payer is in the UAE.
 */
const HoursStep: FC<HoursStepProps> = ({
  studentId,
  courseId,
  examBoardId,
  choice,
  lessonsPerWeek,
  hours,
  onAdd,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const renewal = useRenewalOptions(
    choice.kind === 'renewal' ? choice.packageId : null,
  );
  const purchase = usePurchaseOptions(
    choice.kind === 'renewal'
      ? null
      : {
          student_id: studentId,
          grade_subject_id: courseId,
          tutor_id: choice.kind === 'tutor' ? choice.tutorId : undefined,
          match: choice.kind === 'match',
          exam_board_id: examBoardId,
        },
  );
  const query = choice.kind === 'renewal' ? renewal : purchase;
  const data = query.data;
  const options = data?.options ?? [];
  const ok =
    choice.kind === 'renewal'
      ? (renewal.data?.renewable ?? false)
      : (purchase.data?.purchasable ?? false);
  const reasons = data?.reasons ?? [];
  const [picked, setPicked] = useState<number | undefined>(hours);

  // The size the package was bought at, else the first size
  useEffect(() => {
    if (picked !== undefined || options.length === 0) return;
    const current = options.find((option) => option.same_as_current);
    setPicked((current ?? options[0]).hours);
  }, [options, picked]);

  const currency = data?.currency ?? 'AED';
  const money = (value: number) => formatMoney(value, currency, i18n.language);
  const chosen = options.find((option) => option.hours === picked) ?? null;
  const offerDay = (iso: string) => format(parseISO(iso), 'PP', { locale });
  const weeks =
    chosen && lessonsPerWeek ? Math.ceil(chosen.hours / lessonsPerWeek) : null;

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">
        {choice.kind === 'match'
          ? t('BUY.HOURS.TITLE_MATCH')
          : t('BUY.HOURS.TITLE')}
      </h2>
      {choice.kind !== 'match' && (
        <p className="trial__hint">
          {t('BUY.HOURS.WITH', { name: choice.tutorName })}
        </p>
      )}

      {query.isLoading && (
        <>
          <Skeleton variant="rounded" height={64} />
          <Skeleton variant="rounded" height={64} />
          <Skeleton variant="rounded" height={64} />
        </>
      )}

      {query.isError && (
        <Alert severity="error">
          {paymentErrorMessage(query.error, t('FAMILY.ERROR'))}
        </Alert>
      )}

      {data && !ok && (
        <Alert severity="info">
          <strong>{t('BUY.TUTORS.NOT_ONLINE')}</strong>
          <ul className="renew-reasons">
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Alert>
      )}

      {data && ok && (
        <>
          <p className="renew-choose">{t('BUY.HOURS.CHOOSE')}</p>
          <ul className="renew-options">
            {options.map((option) => {
              const selected = option.hours === picked;
              return (
                <li key={option.hours}>
                  <button
                    type="button"
                    className={`renew-option${selected ? ' renew-option--on' : ''}`}
                    onClick={() => setPicked(option.hours)}
                    aria-pressed={selected}
                  >
                    <span className="renew-option__hours">
                      {t('PAYMENTS.RENEW.HOURS', { count: option.hours })}
                    </span>
                    <span className="renew-option__price">
                      {money(option.price)}
                      {option.saving > 0 && (
                        <s className="renew-option__list">
                          {money(option.list_price)}
                        </s>
                      )}
                    </span>
                    <span className="renew-option__tags">
                      {option.saving > 0 && (
                        <span className="renew-tag renew-tag--save">
                          {t('PAYMENTS.RENEW.SAVE', {
                            amount: money(option.saving),
                          })}
                        </span>
                      )}
                      {option.offer_until && (
                        <span className="renew-option__until">
                          {t('PAYMENTS.RENEW.OFFER_UNTIL', {
                            date: offerDay(option.offer_until),
                          })}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {chosen && (
            <dl className="renew-summary">
              <div>
                <dt>{t('PAYMENTS.RENEW.HOURS', { count: chosen.hours })}</dt>
                <dd>{money(chosen.price)}</dd>
              </div>
              {data.vat_applies && (
                <div>
                  <dt>
                    {t('PAYMENTS.RENEW.VAT', { rate: data.vat_rate_percent })}
                  </dt>
                  <dd>{money(chosen.vat)}</dd>
                </div>
              )}
              <div className="renew-summary__total">
                <dt>{t('PAYMENTS.RENEW.TOTAL')}</dt>
                <dd>{money(chosen.total)}</dd>
              </div>
            </dl>
          )}
          {weeks && (
            <p className="trial__hint">
              {t('BUY.HOURS.WEEKS', { count: weeks, lessons: lessonsPerWeek })}
            </p>
          )}
        </>
      )}

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('BUY.ACTIONS.BACK')}
        </Button>
        <Button
          className="trial__cta"
          variant="contained"
          startIcon={<AddShoppingCartRounded />}
          disabled={!chosen || !ok}
          onClick={() =>
            chosen &&
            data &&
            onAdd(chosen, {
              currency: data.currency,
              vatApplies: data.vat_applies,
              vatRatePercent: data.vat_rate_percent,
            })
          }
        >
          {t('BUY.ACTIONS.ADD')}
        </Button>
      </div>
    </div>
  );
};

export default HoursStep;
