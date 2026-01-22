import { FC, useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
  TextField,
  CircularProgress,
  Autocomplete,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';
import { useInfiniteInstructors } from '../../../hooks/useInstructors';
import { useGradeSubjects } from '../../../hooks/useGradeSubjects';
import { SessionFilters } from '../../../lib/queryKeys';
import { Instructor, GradeSubject } from '../../../assets/types';

import './session-filter.styles.scss';

interface Option {
  id: string;
  display: string;
}

interface SessionFilterProps {
  onFiltersChange: (filters: SessionFilters) => void;
}

/**
 * SessionFilter Component
 *
 * Provides filtering options for sessions list:
 * - Session Status (scheduled, open, completed, cancelled)
 * - Instructor (searchable select with infinite scroll)
 *
 * Commented filters (Session Type, Session Date) are for future backend support.
 *
 * @param onFiltersChange - Callback fired when filters change
 */
const SessionFilter: FC<SessionFilterProps> = ({ onFiltersChange }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const rtlClass = useRtlClass();

  // Status filter options (backend-supported values)
  const sessionStateOptions: Option[] = [
    { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
    { id: 'scheduled', display: t('MYSESSIONS.FILTERS.SCHEDULED') },
    { id: 'open', display: t('MYSESSIONS.FILTERS.OPEN') },
    { id: 'completed', display: t('MYSESSIONS.FILTERS.COMPLETED') },
    { id: 'cancelled', display: t('MYSESSIONS.FILTERS.CANCELLED') },
  ];

  // Commented out - Not supported by backend yet
  // const sessionTypeOptions: Option[] = [
  //   { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
  //   { id: 'privateSession', display: t('MYSESSIONS.FILTERS.1TO1SESSION') },
  //   { id: 'groupSession', display: t('MYSESSIONS.FILTERS.GROUPSESSION') },
  //   {
  //     id: 'freeTrialSession',
  //     display: t('MYSESSIONS.FILTERS.FREETRIALSESSION'),
  //   },
  // ];

  // const sessionDateOptions: Option[] = [
  //   { id: 'today', display: t('MYSESSIONS.FILTERS.TODAYSESSIONS') },
  //   { id: 'thisWeek', display: t('MYSESSIONS.FILTERS.THISWEEKSESSIONS') },
  //   { id: 'nextWeek', display: t('MYSESSIONS.FILTERS.NEXTWEEKSESSIONS') },
  //   { id: 'lastWeek', display: t('MYSESSIONS.FILTERS.LASTWEEKSESSIONS') },
  // ];

  // Filter state
  const [status, setStatus] = useState('all');
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<GradeSubject | null>(
    null,
  );
  const [listBody, setListBody] = useState(!isSmallScreen);

  // Fetch instructors with infinite scroll
  const {
    data: instructorsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInstructors,
  } = useInfiniteInstructors(10);

  // Fetch grade subjects (courses)
  const { data: gradeSubjectsData, isLoading: isLoadingCourses } =
    useGradeSubjects();

  // Flatten all instructor pages
  const allInstructors =
    instructorsData?.pages.flatMap((page) => page.data) ?? [];

  // Get all courses
  const allCourses = gradeSubjectsData?.data ?? [];

  useEffect(() => {
    setListBody(!isSmallScreen);
  }, [isSmallScreen]);

  // Emit filter changes to parent
  useEffect(() => {
    const filters: SessionFilters = {};

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (selectedInstructor) {
      filters.tutor_id = selectedInstructor.id;
    }

    if (selectedCourse) {
      filters.grade_subject_id = selectedCourse.id;
    }

    onFiltersChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedInstructor, selectedCourse]);

  const handleStatusChange = (event: SelectChangeEvent<string>) =>
    setStatus(event.target.value);

  const toggleListBody = () => setListBody(!listBody);

  return (
    <div className="session-filter">
      <div className="container session-filter__container">
        <div
          className={`session-filter__dropdown-container ${listBody ? 'visible' : 'hidden'}`}
        >
          <div className={`session-filter__dropdown-group ${rtlClass}`}>
            {/* Session Status Filter */}
            <div className={`session-filter__field ${rtlClass}`}>
              <InputLabel id="status-label">
                {t('MYSESSIONS.FILTERS.SESSIONSTATE')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Select
                  labelId="status-label"
                  id="status"
                  value={status}
                  onChange={handleStatusChange}
                  displayEmpty
                  sx={{ height: '44px' }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        minHeight: '175px',
                      },
                    },
                  }}
                >
                  {sessionStateOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Instructor Filter with Autocomplete */}
            <div className={`session-filter__field ${rtlClass}`}>
              <InputLabel id="instructor-label">
                {t('MYSESSIONS.FILTERS.INSTRUCTOR')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Autocomplete
                  value={selectedInstructor}
                  onChange={(_event, newValue) => {
                    setSelectedInstructor(newValue);
                  }}
                  options={allInstructors}
                  getOptionLabel={(option) =>
                    `${option.first_name} ${option.last_name}`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  loading={isLoadingInstructors}
                  loadingText={t('MYSESSIONS.FILTERS.LOADING_INSTRUCTORS')}
                  noOptionsText={t('MYSESSIONS.FILTERS.NO_INSTRUCTORS_FOUND')}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: '8px 16px !important',
                      }}
                    >
                      <Avatar
                        src={option.avatar}
                        alt={`${option.first_name} ${option.last_name}`}
                        sx={{ width: 40, height: 40 }}
                      >
                        {option.first_name?.[0]}
                        {option.last_name?.[0]}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option.first_name} {option.last_name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '12px',
                            color: 'text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option.email}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '12px',
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        ID: {option.id}
                      </Typography>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t('MYSESSIONS.FILTERS.SELECT_INSTRUCTOR')}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '44px',
                        },
                      }}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isLoadingInstructors ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps?.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                  slotProps={{
                    popper: {
                      style: {
                        width: 'fit-content',
                        minWidth: '300px',
                        maxWidth: '300px',
                      },
                    },
                    listbox: {
                      className: 'instructor-autocomplete-listbox',
                      style: {
                        maxHeight: '280px', // Increased for avatar + 2 lines per item
                      },
                      onScroll: (event: React.SyntheticEvent) => {
                        const listboxNode = event.currentTarget;
                        const scrollThreshold = 10; // Load more when within 10px of bottom
                        if (
                          listboxNode.scrollTop + listboxNode.clientHeight >=
                            listboxNode.scrollHeight - scrollThreshold &&
                          hasNextPage &&
                          !isFetchingNextPage
                        ) {
                          fetchNextPage();
                        }
                      },
                    },
                  }}
                />
              </FormControl>
            </div>

            {/* Course Filter */}
            <div className={`session-filter__field ${rtlClass}`}>
              <InputLabel id="course-label">
                {t('MYSESSIONS.FILTERS.COURSE')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Autocomplete
                  value={selectedCourse}
                  onChange={(_event, newValue) => {
                    setSelectedCourse(newValue);
                  }}
                  options={allCourses}
                  getOptionLabel={(option) => option.full_course_name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  loading={isLoadingCourses}
                  loadingText={t('MYSESSIONS.FILTERS.LOADING_COURSES')}
                  noOptionsText={t('MYSESSIONS.FILTERS.NO_COURSES_FOUND')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={t('MYSESSIONS.FILTERS.SELECT_COURSE')}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '44px',
                        },
                      }}
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
              </FormControl>
            </div>

            {/* Commented Out - Not supported by backend yet */}
            {/* <div className={`session-filter__field ${rtlClass}`}>
              <InputLabel id="type-label">
                {t('MYSESSIONS.FILTERS.SESSIONTYPE')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Select
                  labelId="type-label"
                  id="type"
                  value={type}
                  onChange={handleTypeChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {t('MYSESSIONS.FILTERS.SESSIONTYPE')}
                  </MenuItem>
                  {sessionTypeOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div> */}

            {/* <div className={`session-filter__field ${rtlClass}`}>
              <InputLabel id="date-label">
                {t('MYSESSIONS.FILTERS.SESSIONDATE')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Select
                  labelId="date-label"
                  id="date"
                  value={date}
                  onChange={handleDateChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {t('MYSESSIONS.FILTERS.SESSIONDATE')}
                  </MenuItem>
                  {sessionDateOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div> */}
          </div>
        </div>

        {/* Removed search box as per requirements */}

        <div className={`session-filter__field--filter ${rtlClass}`}>
          <Button
            onClick={toggleListBody}
            startIcon={<Search />}
            className={listBody ? 'active' : ''}
          >
            {t('COURSES.COURSE_FILTER.FILTERS')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionFilter;
