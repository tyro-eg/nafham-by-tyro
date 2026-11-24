import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFamily } from '../../hooks/useFamily';
import { childColor } from '../../lib/family-child';

import './calendar-legend.styles.scss';

// Same colours as the calendar events (see sessions-calendar-container)
const LEGEND = [
  { key: 'SCHEDULED', color: '#ff9800' },
  { key: 'COMPLETED', color: '#4caf50' },
  { key: 'MISSED', color: '#dc3545' },
  { key: 'CANCELED', color: '#9aa8b8' },
] as const;

type ChildColor = { id: number; name: string; color: string };

/** A parent's children, one colour each, for the calendar */
export const useChildColors = (isParent: boolean) => {
  const family = useFamily(isParent);
  return useMemo(() => {
    const children: ChildColor[] = isParent
      ? (family.data?.children ?? []).map((child, i) => ({
          id: child.id,
          name: child.first_name,
          color: childColor(i),
        }))
      : [];
    const colorByStudent = children.length
      ? Object.fromEntries(children.map((c) => [c.id, c.color]))
      : undefined;
    return { children, colorByStudent };
  }, [isParent, family.data]);
};

/**
 * What the calendar colours mean: each child's colour for a parent, the
 * session states for everyone else. Came over from the separate Calendar
 * page when it joined My Sessions (23 Nov 2026).
 */
const CalendarLegend: FC<{ kids: ChildColor[] }> = ({ kids }) => {
  const { t } = useTranslation();
  return (
    <ul className="cal-legend">
      {kids.length
        ? kids.map((child) => (
            <li key={child.id} className="cal-legend__child">
              <span
                className="cal-legend__dot"
                style={{ backgroundColor: child.color }}
              />
              {child.name}
            </li>
          ))
        : LEGEND.map((item) => (
            <li key={item.key}>
              <span
                className="cal-legend__dot"
                style={{ backgroundColor: item.color }}
              />
              {t(`CALENDAR_PAGE.LEGEND.${item.key}`)}
            </li>
          ))}
      <li className="cal-legend__hint">{t('CALENDAR_PAGE.HINT')}</li>
    </ul>
  );
};

export default CalendarLegend;
