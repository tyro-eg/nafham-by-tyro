import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@mui/material';
import { useActiveChild, useFamily } from '../../hooks/useFamily';
import { ALL_CHILDREN, childColor } from '../../lib/family-child';
import './child-tabs.styles.scss';

/**
 * A row of the children at the top of a page, for a parent: All, then one
 * tab per child in the family's colours. Picking one drives the same
 * choice as the sidebar switcher, so every page follows.
 */
const ChildTabs: FC = () => {
  const { t } = useTranslation();
  const family = useFamily();
  const children = family.data?.children;
  const { childId, choose } = useActiveChild(children);
  if (!children || children.length < 2) return null;

  const tab = (
    key: string,
    active: boolean,
    onClick: () => void,
    label: string,
    color?: string,
  ) => (
    <button
      key={key}
      type="button"
      role="tab"
      aria-selected={active}
      className={`child-tabs__tab${active ? ' child-tabs__tab--on' : ''}`}
      style={color ? ({ '--kid': color } as React.CSSProperties) : undefined}
      onClick={onClick}
    >
      {color && <Avatar className="child-tabs__avatar">{label[0]}</Avatar>}
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="child-tabs"
      role="tablist"
      aria-label={t('FAMILY.SWITCHER')}
    >
      {tab(
        'all',
        childId === ALL_CHILDREN,
        () => choose(ALL_CHILDREN),
        t('FAMILY.ALL_CHILDREN'),
      )}
      {children.map((child, index) =>
        tab(
          String(child.id),
          childId === child.id,
          () => choose(child.id),
          child.first_name,
          childColor(index),
        ),
      )}
    </div>
  );
};

export default ChildTabs;
