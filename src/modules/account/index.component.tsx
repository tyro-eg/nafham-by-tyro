import { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRtlClass } from '../../assets/utils/utils';
import PageTabs from '../../component/page-tabs/page-tabs.component';
import FamilySettings from '../family/family-settings.component';
import PaymentsHistory from '../payments/history.component';
import '../family/family.styles.scss';
import './account.styles.scss';

export const ACCOUNT_TABS = ['details', 'children', 'payments'] as const;
export type AccountTab = (typeof ACCOUNT_TABS)[number];

/** The tab in the address (?tab=children), or Details */
export const accountTab = (value: string | null): AccountTab =>
  ACCOUNT_TABS.find((tab) => tab === value) ?? 'details';

/**
 * A parent's Account (19 Nov 2026): one page instead of Family settings and
 * Payments. Details (contacts, terms), Children (logins, recording, add a
 * child) and Payments (receipts, unfinished payments), one tab each. The old
 * addresses open the matching tab.
 */
const AccountPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const [params, setParams] = useSearchParams();
  const tab = accountTab(params.get('tab'));

  return (
    <div className={`family-home ${rtlClass}`}>
      <div className="container fam-container">
        <header className="fam-head">
          <div>
            <h1 className="fam-head__title">{t('ACCOUNT.TITLE')}</h1>
            <p className="fam-head__sub">{t('ACCOUNT.SUBTITLE')}</p>
          </div>
        </header>

        <PageTabs
          label={t('ACCOUNT.TITLE')}
          tabs={ACCOUNT_TABS.map((key) => ({
            key,
            label: t(`ACCOUNT.TABS.${key.toUpperCase()}`),
          }))}
          value={tab}
          onChange={(key) => setParams({ tab: key }, { replace: true })}
        />

        <div role="tabpanel">
          {tab === 'payments' ? (
            <PaymentsHistory embedded />
          ) : (
            <FamilySettings section={tab} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
