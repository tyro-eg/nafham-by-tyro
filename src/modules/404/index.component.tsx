import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import './index.styles.scss';

const NotFound404 = () => {
  const { t } = useTranslation();
  return (
    <div className="not-found">
      <div className="not-found__content">
        <p className="not-found__404" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__info">{t('404.NOT_FOUND')}</h1>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          className="not-found__button"
        >
          {t('404.BACK_HOME')}
        </Button>
      </div>
    </div>
  );
};

export default NotFound404;
