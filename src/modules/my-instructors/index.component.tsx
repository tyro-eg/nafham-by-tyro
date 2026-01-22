import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useMyInstructors } from '../../hooks/useInstructors';
import InstructorCard from '../../component/instructor-card/instructor-card.component';
import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';

import './index.styles.scss';

const MyInstructors: FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMyInstructors();

  const instructors = data?.data || [];

  const renderEmptyState = () => (
    <div className="no_results container">
      <div className="no_results__img">
        <EmptyImg />
      </div>
      <div className="no_results__content">
        <p>{t('MYINSTRUCTORS.EMPTY.FIRST_P')}</p>
        <p>{t('MYINSTRUCTORS.EMPTY.SECOND_P')}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="my-instructors">
        <div className="container">
          <p>{t('MYINSTRUCTORS.LOADING')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-instructors">
      <section className="instructor-list">
        <div className="instructor-list__container container">
          {instructors?.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>

        {((instructors && instructors.length === 0) || !instructors) &&
          renderEmptyState()}
      </section>
    </div>
  );
};

export default MyInstructors;
