import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';

import { useMyInstructors } from '../../hooks/useInstructors';
import { useGradeSubjects } from '../../hooks/useGradeSubjects';
import { GradeSubject } from '../../assets/types';
import { useRtlClass } from '../../assets/utils/utils';
import InstructorCard from '../../component/instructor-card/instructor-card.component';
import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';

import '../sessions/dashboard-shell.styles.scss';
import '../private-sessions/private-sessions-filter/private-sessions-filter.styles.scss';
import './index.styles.scss';

const MyInstructors: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const [selectedCourse, setSelectedCourse] = useState<GradeSubject | null>(
    null,
  );

  // Fetch grade subjects (courses)
  const { data: gradeSubjectsData, isLoading: isLoadingCourses } =
    useGradeSubjects();

  const allCourses = gradeSubjectsData?.data ?? [];

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: { grade_subject_id?: number } = {};
    if (selectedCourse) {
      filterObj.grade_subject_id = selectedCourse.id;
    }
    return filterObj;
  }, [selectedCourse]);

  const { data, isLoading } = useMyInstructors(filters);

  const instructors = data?.data || [];

  const renderHeader = () => (
    <header className="dashboard-header">
      <div className="container dashboard-header__inner">
        <div className="dashboard-header__text">
          <h1 className="dashboard-header__title">
            {t('NAVIGATION.MY_INSTRUCTORS')}
            {!isLoading && instructors.length > 0 && (
              <span className="dashboard-header__count">
                {instructors.length}
              </span>
            )}
          </h1>
        </div>
      </div>
    </header>
  );

  const renderEmptyState = () => (
    <div className="no_results dashboard-empty">
      <div className="dashboard-empty__img" aria-hidden="true">
        <EmptyImg />
      </div>
      <p className="dashboard-empty__title">
        {t('MYINSTRUCTORS.EMPTY.FIRST_P')}
      </p>
      <p className="dashboard-empty__text">
        {t('MYINSTRUCTORS.EMPTY.SECOND_P')}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="my-instructors dashboard-page">
        {renderHeader()}
        <div className="container dashboard-page__body">
          <div className="dashboard-empty" role="status">
            <p className="dashboard-empty__text">
              {t('MYINSTRUCTORS.LOADING')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-instructors dashboard-page">
      {renderHeader()}

      <div className="container dashboard-page__body">
        {/* Course Filter */}
        <div className="home-filter">
          <div className="home-filter__container">
            <div className={`home-filter__field--course ${rtlClass}`}>
              <Autocomplete
                value={selectedCourse}
                onChange={(_event, newValue) => {
                  setSelectedCourse(newValue);
                }}
                options={allCourses}
                getOptionLabel={(option) => option.full_course_name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={isLoadingCourses}
                loadingText={t('MYSESSIONS.FILTERS.LOADING_COURSES')}
                noOptionsText={t('MYSESSIONS.FILTERS.NO_COURSES_FOUND')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('MYSESSIONS.FILTERS.COURSE')}
                    variant="outlined"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingCourses ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps?.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <section className="instructor-list">
          {!!instructors?.length && (
            <div className="instructor-list__container">
              {instructors.map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          )}

          {((instructors && instructors.length === 0) || !instructors) &&
            renderEmptyState()}
        </section>
      </div>
    </div>
  );
};

export default MyInstructors;
