import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Skeleton } from '@mui/material';
import {
  TrendingDownRounded,
  TrendingFlatRounded,
  TrendingUpRounded,
} from '@mui/icons-material';

import {
  coachErrorMessage,
  useCoachMe,
  useRefreshCoachMe,
} from '../../hooks/useCoach';
import { snackActions } from '../../assets/utils/toaster';
import {
  formatDate,
  formatDateTime,
  percent,
  useGenerating,
} from './assistant.utils';
import {
  AiChip,
  Bullets,
  EmptyTab,
  Panel,
  RefreshButton,
} from './assistant-shared.component';

interface MetricProps {
  label: string;
  value: string;
  trend: number | null | undefined;
  /** Whether a rising number is good news */
  upIsGood: boolean;
  hint: string;
}

const Metric: FC<MetricProps> = ({ label, value, trend, upIsGood, hint }) => {
  let tone = 'flat';
  let Icon = TrendingFlatRounded;
  if (trend != null && Math.abs(trend) > 0.005) {
    const good = trend > 0 === upIsGood;
    tone = good ? 'good' : 'bad';
    Icon = trend > 0 ? TrendingUpRounded : TrendingDownRounded;
  }
  return (
    <div className="as-metric" title={hint}>
      <span className="as-metric__value">{value}</span>
      <span className="as-metric__label">{label}</span>
      {trend != null && (
        <span className={`as-metric__trend as-metric__trend--${tone}`}>
          <Icon fontSize="inherit" />
        </span>
      )}
    </div>
  );
};

/**
 * Tab 4: how this tutor teaches, from the delivery feedback on their own
 * recorded lessons. Private to the tutor.
 */
const BetterTeacher: FC = () => {
  const { t, i18n } = useTranslation();
  const generating = useGenerating();
  const query = useCoachMe(generating.interval);
  const refresh = useRefreshCoachMe();
  const latest = query.data?.latest ?? null;
  const history = query.data?.history ?? [];
  const lessons = query.data?.lessons_with_notes ?? 0;

  useEffect(() => {
    generating.settle(latest?.generated_at);
  }, [latest?.generated_at, generating]);

  const requestRefresh = async () => {
    try {
      await refresh.mutateAsync();
      generating.start(latest?.generated_at);
    } catch (err) {
      snackActions.error(
        coachErrorMessage(
          err,
          t('ASSISTANT.COMMON.ERROR'),
          t('ASSISTANT.COMMON.THROTTLED'),
        ),
      );
    }
  };

  if (query.isLoading) {
    return <Skeleton variant="rounded" height={360} />;
  }

  if (!latest) {
    return (
      <EmptyTab
        title={t('ASSISTANT.COACH.EMPTY_TITLE')}
        text={
          lessons > 0
            ? t('ASSISTANT.COACH.EMPTY_TEXT_PENDING', { count: lessons })
            : t('ASSISTANT.COACH.EMPTY_TEXT')
        }
        action={
          lessons > 0 ? (
            <RefreshButton
              onClick={requestRefresh}
              busy={generating.active}
              label={t('ASSISTANT.COMMON.GENERATE')}
            />
          ) : undefined
        }
      />
    );
  }

  const { metrics } = latest;

  return (
    <div className="as-stack">
      <Panel
        title={t('ASSISTANT.COACH.TITLE')}
        chip={<AiChip label={t('ASSISTANT.COMMON.AI')} />}
        meta={t('ASSISTANT.COACH.PERIOD', {
          from: formatDate(latest.period_start, i18n.language),
          to: formatDate(latest.period_end, i18n.language),
        })}
        actions={
          <RefreshButton onClick={requestRefresh} busy={generating.active} />
        }
      >
        {generating.timedOut && (
          <Alert severity="info">{t('ASSISTANT.COMMON.TIMED_OUT')}</Alert>
        )}
        <div className="as-metrics">
          <Metric
            label={t('ASSISTANT.COACH.LESSONS')}
            value={String(metrics.lessons)}
            trend={null}
            upIsGood
            hint={t('ASSISTANT.COACH.LESSONS_HINT')}
          />
          <Metric
            label={t('ASSISTANT.COACH.TALK_RATIO')}
            value={percent(metrics.avg_talk_ratio)}
            trend={metrics.trend?.talk_ratio}
            upIsGood={false}
            hint={t('ASSISTANT.COACH.TALK_RATIO_HINT')}
          />
          <Metric
            label={t('ASSISTANT.COACH.CHECKS')}
            value={
              metrics.avg_checks != null ? metrics.avg_checks.toFixed(1) : '–'
            }
            trend={metrics.trend?.checks}
            upIsGood
            hint={t('ASSISTANT.COACH.CHECKS_HINT')}
          />
          <Metric
            label={t('ASSISTANT.COACH.MONOLOGUE')}
            value={
              metrics.avg_longest_monologue != null
                ? t('ASSISTANT.COMMON.MINUTES_SHORT', {
                    count: Math.round(metrics.avg_longest_monologue),
                  })
                : '–'
            }
            trend={metrics.trend?.longest_monologue}
            upIsGood={false}
            hint={t('ASSISTANT.COACH.MONOLOGUE_HINT')}
          />
        </div>

        <p className="as-prose" dir="auto">
          {latest.summary}
        </p>

        <div className="as-cols as-cols--two">
          <div className="as-col as-col--mint">
            <h4 className="as-subhead">{t('ASSISTANT.COACH.STRENGTHS')}</h4>
            <ul className="as-points">
              {latest.strengths.map((item, index) => (
                <li key={`${index}-${item.point}`} dir="auto">
                  <strong>{item.point}</strong>
                  <span className="as-points__evidence">{item.evidence}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="as-col as-col--coral">
            <h4 className="as-subhead">{t('ASSISTANT.COACH.IMPROVE')}</h4>
            <ul className="as-points">
              {latest.improve.map((item, index) => (
                <li key={`${index}-${item.point}`} dir="auto">
                  <strong>{item.point}</strong>
                  <span className="as-points__evidence">{item.evidence}</span>
                  <span className="as-points__technique">
                    <em>{t('ASSISTANT.COACH.TRY')}</em> {item.technique}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {latest.techniques.length > 0 && (
          <div className="as-col as-col--lilac">
            <h4 className="as-subhead">{t('ASSISTANT.COACH.TECHNIQUES')}</h4>
            <Bullets items={latest.techniques} tone="lilac" />
          </div>
        )}
      </Panel>

      {history.length > 0 && (
        <Panel title={t('ASSISTANT.COACH.HISTORY')}>
          <ul className="as-history">
            {history.map((report) => (
              <li key={report.id}>
                <span className="as-muted">
                  {formatDateTime(report.generated_at, i18n.language)}
                </span>
                <span dir="auto">{report.summary}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
};

export default BetterTeacher;
