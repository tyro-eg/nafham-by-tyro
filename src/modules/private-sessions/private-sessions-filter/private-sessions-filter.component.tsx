import { FC, ChangeEvent } from 'react';
import {
  Button,
  Container,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';
import { useGradeSubjects } from '../../../hooks/useGradeSubjects';
import { GradeSubject } from '../../../assets/types';

import SearchIcon from '../../../assets/images/Icon.png';

import './private-sessions-filter.styles.scss';

interface PrivateSessionsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCourse: GradeSubject | null;
  onCourseChange: (course: GradeSubject | null) => void;
}

const PrivateSessionsFilter: FC<PrivateSessionsFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCourse,
  onCourseChange,
}) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  // Fetch grade subjects (courses)
  const { data: gradeSubjectsData, isLoading: isLoadingCourses } =
    useGradeSubjects();

  const allCourses = gradeSubjectsData?.data ?? [];

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="home-filter">
      <Container maxWidth="lg">
        <div className="home-filter__container">
          {/* Course Filter */}
          <div className={`home-filter__field--course ${rtlClass}`}>
            <Autocomplete
              value={selectedCourse}
              onChange={(_event, newValue) => {
                onCourseChange(newValue);
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

          <div className={`home-filter__field--search ${rtlClass}`}>
            <input
              type="search"
              placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
              className={rtlClass}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <Button className={rtlClass} type="button">
              <img src={SearchIcon} alt="Search" />
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivateSessionsFilter;
