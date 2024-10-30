import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TrailModalCard from '../../component/trail-modal-card/trail-modal-card.component';
import { RootState, useAppDispatch, useAppSelector } from '../../redux/store';

import './free-trail-modal.styles.scss';
import { selectInstructors } from '../../redux/user/user.selectors';
import { getInstructors } from '../../redux/user/user.actions';
import { Instructor } from '../../assets/types';

const FreeTrailModal = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const instructors: Instructor[] = useAppSelector((state: RootState) =>
    selectInstructors(state),
  );

  console.log('instructors', instructors);

  useEffect(() => {
    dispatch(getInstructors({}));
  }, []);

  return (
    <div className="instructor-trial-modal">
      <h1>{t('INSTRUCTOR_MODAL.TITLE')}</h1>
      <h3 className="subtitle">{t('INSTRUCTOR_MODAL.SUBTITLE')}</h3>
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
