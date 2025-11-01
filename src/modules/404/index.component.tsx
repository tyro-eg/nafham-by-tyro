import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './index.styles.scss';

const NotFound404 = () => {
  const { t } = useTranslation();
  return (
    <div className="not-found">
      <div className="not-found__content">
        <p className="not-found__404">404</p>
        <h3 className="not-found__info">{t('404.NOT_FOUND')}</h3>
        <Link className="custom-button" to="/">
          {t('404.BACK_HOME')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;
