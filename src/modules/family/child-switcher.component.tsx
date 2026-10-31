import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';
import { useActiveChild, useFamily } from '../../hooks/useFamily';

/**
 * Which child the parent is looking at. Every student page follows the pick;
 * with one child nothing is shown.
 */
const ChildSwitcher: FC = () => {
  const { t } = useTranslation();
  const family = useFamily();
  const children = family.data?.children;
  const { childId, choose } = useActiveChild(children);
  if (!children || children.length < 2) return null;
  return (
    <TextField
      select
      size="small"
      fullWidth
      className="side-layout__child"
      value={childId ?? ''}
      onChange={(e) => choose(Number(e.target.value))}
      aria-label={t('FAMILY.SWITCHER')}
    >
      {children.map((child) => (
        <MenuItem key={child.id} value={child.id}>
          {child.first_name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ChildSwitcher;
