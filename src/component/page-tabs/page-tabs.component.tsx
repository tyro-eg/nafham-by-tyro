import { FC } from 'react';
import './page-tabs.styles.scss';

export type PageTab = { key: string; label: string };

/**
 * Pill tabs at the top of a page (19 Nov 2026): the parent's Account and the
 * tutor's My Profile. The page keeps the chosen tab in its address (?tab=).
 */
const PageTabs: FC<{
  tabs: PageTab[];
  value: string;
  onChange: (key: string) => void;
  label: string;
}> = ({ tabs, value, onChange, label }) => (
  <div className="page-tabs" role="tablist" aria-label={label}>
    {tabs.map((tab) => (
      <button
        key={tab.key}
        type="button"
        role="tab"
        aria-selected={value === tab.key}
        className={`page-tab${value === tab.key ? ' page-tab--on' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default PageTabs;
