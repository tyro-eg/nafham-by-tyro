import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@mui/material';

import { selectInstructors } from '../../redux/user/user.selectors';
import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';
import PrivateSessionsFilter from './private-sessions-filter/private-sessions-filter.component';
// import Group from '../../assets/images/landing/feature_3.png';

import './index.styles.scss';
import { getInstructors } from '../../redux/user/user.actions';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { Instructor } from '../../assets/types';
import InstructorCard from '../../component/instructor-card/instructor-card.component';

const PrivateSessions: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const instructors: Instructor[] = useAppSelector(selectInstructors);
  // const instructorsPagination = useSelector(selectInstructorsPagination);
  const instructorsPagination = {
    'total-pages': 3,
    pageNumber: 1,
  };

  useEffect(() => {
    dispatch(getInstructors({ pageNumber: 1, pageSize: 10 }));
  }, [dispatch]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    dispatch(getInstructors({ pageNumber: value, pageSize: 10 }));
    scrollToTop();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInstructors = (start: number, end: number) =>
    instructors
      ?.slice(start, end)
      .map((instructor) => (
        <InstructorCard key={instructor.id} instructor={instructor} />
      ));

  // const renderBanner = () => (
  //   <div className="banner">
  //     <div className="banner__container container">
  //       <div className="banner__block1">
  //         <h5 className="title1">{t('HOME.BANNER.TITLE1')}</h5>
  //         <h2 className="title2">{t('HOME.BANNER.TITLE2')}</h2>
  //         <p className="description">{t('HOME.BANNER.DESCRIPTION')}</p>
  //       </div>
  //       <div className="banner__block2">
  //         <img className="image" src={Group} alt="feature_1" />
  //         <Button
  //           size="large"
  //           className="button"
  //           variant="contained"
  //           color="primary"
  //           onClick={() => {}}
  //         >
  //           {t('HOME.BANNER.ACTION')}
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );

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
          {renderInstructors(0, 3)}
        </div>

        {/* {instructors && instructors.length > 0 && renderBanner()} */}

        <div className="instructor-list__container container">
          {renderInstructors(3, instructors?.length)}
        </div>

        {((instructors && instructors.length === 0) || !instructors) &&
          renderNoResults()}
      </section>

      {instructors?.length && instructorsPagination?.['total-pages'] && (
        <Pagination
          color="primary"
          size="large"
          count={Number(instructorsPagination['total-pages'])}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PrivateSessions;
