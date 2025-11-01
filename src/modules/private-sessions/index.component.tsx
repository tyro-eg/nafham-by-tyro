import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@mui/material';

import { useInstructors } from '../../hooks/useInstructors';

import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';
import PrivateSessionsFilter from './private-sessions-filter/private-sessions-filter.component';
import InstructorCard from '../../component/instructor-card/instructor-card.component';

import './index.styles.scss';

const PrivateSessions: FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data } = useInstructors(currentPage, pageSize);
  const instructors = data?.data || [];
  const instructorsPagination = data?.pagination;

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNoResults = () => (
    <div className="no_results container">
      <div className="no_results__img">
        <EmptyImg />
      </div>
      <div className="no_results__content">
        <p>{t('COURSES.COURSE_LIST.NO_RESULTS.FIRST_P')}</p>
        <p>{t('COURSES.COURSE_LIST.NO_RESULTS.SECOND_P')}!</p>
      </div>
    </div>
  );

  return (
    <div>
      <PrivateSessionsFilter />
      <section className="instructor-list">
        <div className="instructor-list__container container">
          {instructors?.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>

        {((instructors && instructors.length === 0) || !instructors) &&
          renderNoResults()}
      </section>

      {instructors?.length && instructorsPagination?.['total-pages'] && (
        <Pagination
          color="primary"
          size="large"
          page={currentPage}
          count={Number(instructorsPagination['total-pages'])}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PrivateSessions;
