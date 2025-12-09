import { FC, useState, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Tab, Box } from '@mui/material';

import { tabsProps } from '../../../assets/utils/utils';
import { SessionFilters } from '../../../lib/queryKeys';

import TabPanel from '../../../component/tabs/tab-banal.component';
import SessionsList from './sessions-list/sessions-list.component';
// TODO: Uncomment when backend is ready
// import SessionsRate, {
//   RateSession,
// } from '../sessions-rate/sessions-rate.component';
import SessionsCalendarContainer from './sessions-calendar-container/sessions-calendar-container.component';

// TODO: Uncomment when backend is ready
// import UNRATED_SESSIONS_DATA from '../sessions-rate/unrated-sessions-data';

import './sessions-info.styles.scss';

interface SessionsInfoProps {
  filters?: SessionFilters;
}

/**
 * SessionsInfo Component
 *
 * Manages the sessions view with tabs for Calendar/List views
 * and nested tabs for Sessions views.
 * Passes filters down to SessionsList component.
 *
 * @param filters - Session filters from parent component
 */
const SessionsInfo: FC<SessionsInfoProps> = ({ filters }) => {
  const { t, i18n } = useTranslation();
  const [tab1, setTab1] = useState(1);
  const [tab2, setTab2] = useState(0);

  const handleTab1Change = (_event: SyntheticEvent, newValue: number) =>
    setTab1(newValue);
  const handleTab2Change = (_event: SyntheticEvent, newValue: number) =>
    setTab2(newValue);

  return (
    <Box className="sessions-info">
      <Tabs
        value={tab1}
        onChange={handleTab1Change}
        indicatorColor="primary"
        textColor="primary"
        aria-label="my sessions tabs"
        sx={{ marginBottom: 2 }}
        className="session-tab1"
      >
        <Tab
          className="tab1"
          label={t('MYSESSIONS.MAIN.CALENDAR')}
          {...tabsProps(0)}
        />
        <Tab
          className="tab1"
          label={t('MYSESSIONS.MAIN.LIST')}
          {...tabsProps(1)}
        />
      </Tabs>

      <Box className="sessions-info__tab-init">
        <TabPanel value={tab1} index={1} dir={i18n.dir()}>
          <Tabs
            value={tab2}
            onChange={handleTab2Change}
            indicatorColor="primary"
            textColor="primary"
            aria-label="sessions lists"
            sx={{ marginBottom: 2 }}
            className="session-tab2"
          >
            <Tab
              className="tab2"
              label={t('MYSESSIONS.TABS.SESSIONS')}
              {...tabsProps(0)}
            />
            {/* TODO: Uncomment when backend is ready */}
            {/* <Tab
              className="tab2"
              label={t('MYSESSIONS.TABS.RATE')}
              {...tabsProps(1)}
            /> */}
          </Tabs>

          <Box className="session-list-tabs">
            <TabPanel value={tab2} index={0} dir={i18n.dir()}>
              <SessionsList filters={filters} />
            </TabPanel>
            {/* TODO: Uncomment when backend is ready */}
            {/* <TabPanel value={tab2} index={1} dir={i18n.dir()}>
              {UNRATED_SESSIONS_DATA && (
                <SessionsRate
                  unratedSessions={UNRATED_SESSIONS_DATA as RateSession[]}
                />
              )}
            </TabPanel> */}
          </Box>
        </TabPanel>

        <TabPanel value={tab1} index={0} dir={i18n.dir()}>
          <SessionsCalendarContainer filters={filters} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SessionsInfo;
