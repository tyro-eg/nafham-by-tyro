import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TrailModalCard from '../../component/trail-modal-card/trail-modal-card.component';
import { useInstructors } from '../../hooks/useInstructors';

import './free-trail-modal.styles.scss';

const FreeTrailModal: FC = () => {
  const { t } = useTranslation();
  const { data } = useInstructors(1, 10);
  const instructors = data?.data || [];

  return (
    <div className="instructor-trial-modal">
      <div className="instructor-trial-modal__header">
        <h1 className="title">{t('INSTRUCTOR_MODAL.TITLE')}</h1>
        <p className="subtitle">{t('INSTRUCTOR_MODAL.SUBTITLE')}</p>
      </div>
      {instructors && instructors.length > 0 && (
        <div className="instructors-container">
          {instructors.map(
            (instructor, index) =>
              index < 6 && (
                <TrailModalCard key={instructor.id} instructor={instructor} />
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default FreeTrailModal;
