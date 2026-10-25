import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import './home-statistics.styles.scss';

/** Three numbers, no decoration: the scale of the platform at a glance */
const HomeStatistics: FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: t('LANDING.BLOCK4.ITEM1.TITLE'), label: t('LANDING.STATS.ITEM1') },
    { value: t('LANDING.BLOCK4.ITEM2.TITLE'), label: t('LANDING.STATS.ITEM2') },
    { value: t('LANDING.BLOCK4.ITEM3.TITLE'), label: t('LANDING.STATS.ITEM3') },
  ];

  return (
    <section className="landing__statistics">
      <dl className="ds-container stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stats__item">
            <dd className="stats__value">{stat.value}</dd>
            <dt className="stats__label">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default HomeStatistics;
