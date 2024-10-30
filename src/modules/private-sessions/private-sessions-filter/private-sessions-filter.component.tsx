import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  useMediaQuery,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { rtlClass } from '../../../assets/utils/utils';
import SearchIcon from '../../../assets/images/Icon.png';

import './private-sessions-filter.styles.scss';

const CATEGORIES = [
  { id: 1, name: 'Languages', visible: true },
  { id: 2, name: 'Business', visible: true },
  { id: 4, name: 'Exam Preparation', visible: true },
  { id: 5, name: 'Math', visible: true },
  { id: 256, name: 'Science', visible: true },
  { id: 260, name: 'Soft Skills', visible: true },
  { id: 265, name: 'IG-', visible: true },
  { id: 267, name: 'National-English', visible: true },
  { id: 270, name: 'Programming', visible: true },
  { id: 274, name: 'SEO', visible: true },
  { id: 281, name: 'Arabic', visible: true },
  { id: 283, name: 'ACT English', visible: true },
  { id: 287, name: 'IG Arabic', visible: true },
  { id: 291, name: 'Primary', visible: true },
];

const PrivateSessionsFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [category, setCategory] = useState('');
  const [field, setField] = useState('');
  const [listBody, setListBody] = useState(!isSmallScreen);

  useEffect(() => {
    setListBody(!isSmallScreen);
  }, [isSmallScreen]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    if (event.target.value === '') setField('');
    setCategory(event.target.value);
  };

  const handleFieldChange = (event: SelectChangeEvent<string>) => {
    setField(event.target.value);
  };

  const toggleListBody = () => setListBody((prev) => !prev);

  return (
    <div className="home-filter">
      <Container maxWidth="lg">
        <div className="home-filter__container">
          <div
            className={`home-filter__dropdown-container ${
              listBody ? 'visible' : 'hidden'
            }`}
          >
            <div className={`home-filter__dropdown-group ${rtlClass()}`}>
              <FormControl variant="outlined" sx={{ width: '100%', mb: 2 }}>
                <InputLabel id="category-label">
                  {t('COURSES.COURSE_FILTER.CATEGORY.PLACEHOLDER')}
                </InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                  label={t('COURSES.COURSE_FILTER.CATEGORY.PLACEHOLDER')}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {CATEGORIES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" sx={{ width: '100%' }}>
                <InputLabel id="fields-label">
                  {t('COURSES.COURSE_FILTER.FIELD.PLACEHOLDER')}
                </InputLabel>
                <Select
                  labelId="fields-label"
                  id="fields"
                  value={field}
                  onChange={handleFieldChange}
                  label={t('COURSES.COURSE_FILTER.FIELD.PLACEHOLDER')}
                  disabled={!category}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                  <MenuItem value={20}>Twenty</MenuItem>
                  <MenuItem value={30}>Thirty</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className={`home-filter__field--search ${rtlClass()}`}>
            <input
              type="search"
              placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
              className={rtlClass()}
            />
            <Button className={rtlClass()} type="button">
              <img src={SearchIcon} alt="Search" />
            </Button>
          </div>

          <div className={`home-filter__field--filter ${rtlClass()}`}>
            <Button
              onClick={toggleListBody}
              startIcon={<Search />}
              className={`${listBody ? 'active' : ''} ${rtlClass()}`}
              type="button"
            >
              {t('COURSES.COURSE_FILTER.FILTERS')}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivateSessionsFilter;
