import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { rtlClass } from '../../../assets/utils/utils';
import SearchIcon from '../../../assets/images/Icon.png';

import './session-filter.styles.scss';

interface Option {
  id: string;
  display: string;
}

const SessionFilter: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const sessionTypeOptions: Option[] = [
    { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
    { id: 'privateSession', display: t('MYSESSIONS.FILTERS.1TO1SESSION') },
    { id: 'groupSession', display: t('MYSESSIONS.FILTERS.GROUPSESSION') },
    {
      id: 'freeTrialSession',
      display: t('MYSESSIONS.FILTERS.FREETRIALSESSION'),
    },
  ];

  const sessionDateOptions: Option[] = [
    { id: 'today', display: t('MYSESSIONS.FILTERS.TODAYSESSIONS') },
    { id: 'thisWeek', display: t('MYSESSIONS.FILTERS.THISWEEKSESSIONS') },
    { id: 'nextWeek', display: t('MYSESSIONS.FILTERS.NEXTWEEKSESSIONS') },
    { id: 'lastWeek', display: t('MYSESSIONS.FILTERS.LASTWEEKSESSIONS') },
  ];

  const sessionStateOptions: Option[] = [
    { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
    { id: 'missedSessions', display: t('MYSESSIONS.FILTERS.MISSEDSESSIONS') },
    {
      id: 'completedSessions',
      display: t('MYSESSIONS.FILTERS.COMPLETEDSESSIONS'),
    },
    { id: 'liveSession', display: t('MYSESSIONS.FILTERS.LIVESESSIONS') },
    {
      id: 'upcomingSession',
      display: t('MYSESSIONS.FILTERS.UPCOMINGSESSIONS'),
    },
    {
      id: 'liveSession/upcomingSession',
      display: t('MYSESSIONS.FILTERS.LIVE/UPCOMINGSESSIONS'),
    },
  ];

  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [state, setState] = useState('liveSession/upcomingSession');
  const [listBody, setListBody] = useState(!isSmallScreen);

  useEffect(() => {
    setListBody(!isSmallScreen);
  }, [isSmallScreen]);

  const handleTypeChange = (event: SelectChangeEvent<string>) =>
    setType(event.target.value);
  const handleDateChange = (event: SelectChangeEvent<string>) =>
    setDate(event.target.value);
  const handleStateChange = (event: SelectChangeEvent<string>) =>
    setState(event.target.value);
  const toggleListBody = () => setListBody(!listBody);

  return (
    <div className="session-filter">
      <div className="container session-filter__container">
        <div
          className={`session-filter__dropdown-container ${listBody ? 'visible' : 'hidden'}`}
        >
          <div className={`session-filter__dropdown-group ${rtlClass()}`}>
            <div className={`session-filter__field ${rtlClass()}`}>
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
            </div>

            <div className={`session-filter__field ${rtlClass()}`}>
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
            </div>

            <div className={`session-filter__field ${rtlClass()}`}>
              <InputLabel id="state-label">
                {t('MYSESSIONS.FILTERS.SESSIONSTATE')}
              </InputLabel>
              <FormControl sx={{ width: '100%' }}>
                <Select
                  labelId="state-label"
                  id="state"
                  value={state}
                  onChange={handleStateChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    {t('MYSESSIONS.FILTERS.SESSIONSTATE')}
                  </MenuItem>
                  {sessionStateOptions.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.display}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        <div className={`session-filter__field--search ${rtlClass()}`}>
          <input
            className={rtlClass()}
            type="search"
            placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
          />
          <Button>
            <img src={SearchIcon} alt="Magnifying Glass" />
          </Button>
        </div>

        <div className={`session-filter__field--filter ${rtlClass()}`}>
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
