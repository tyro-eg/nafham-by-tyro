import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Container,
} from '@mui/material';

import { useMyInstructors } from '../../hooks/useInstructors';
import { useGradeSubjects } from '../../hooks/useGradeSubjects';
import { GradeSubject } from '../../assets/types';
import { useRtlClass } from '../../assets/utils/utils';
import InstructorCard from '../../component/instructor-card/instructor-card.component';
import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';

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
      {/* Course Filter */}
      <div className="home-filter">
        <Container maxWidth="lg">
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
        </Container>
      </div>

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
