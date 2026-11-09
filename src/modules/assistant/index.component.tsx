import { FC, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  InputAdornment,
  Skeleton,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import {
  AutoAwesomeRounded,
  EmojiObjectsRounded,
  MenuBookRounded,
  AssignmentRounded,
  SchoolRounded,
  SearchRounded,
} from '@mui/icons-material';

import { useCoachStudents, type CoachStudentRow } from '../../hooks/useCoach';
import { useRtlClass } from '../../assets/utils/utils';
import { tabsProps } from '../../assets/utils/utils';
import TabPanel from '../../component/tabs/tab-banal.component';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';
import {
  TABS,
  formatDate,
  fullName,
  isTab,
  pairKey,
  subjectName,
  type AssistantTab,
} from './assistant.utils';
import LearnerInsights from './learner-insights.component';
import LessonPlanTab from './lesson-plan.component';
import HomeworkTab from './homework.component';
import BetterTeacher from './better-teacher.component';

import './assistant.styles.scss';

const TAB_ICONS: Record<AssistantTab, JSX.Element> = {
  insights: <EmojiObjectsRounded />,
  plan: <MenuBookRounded />,
  homework: <AssignmentRounded />,
  coach: <SchoolRounded />,
};

const Dot: FC<{ tone: 'mint' | 'sun' | 'gray'; title: string }> = ({
  tone,
  title,
}) => <span className={`as-dot as-dot--${tone}`} title={title} />;

const dotTone = (status: string): 'mint' | 'sun' | 'gray' => {
  if (status === 'ready' || status === 'accepted') return 'mint';
  if (status === 'stale' || status === 'draft') return 'sun';
  return 'gray';
};

/**
 * The AI Teaching Assistant: the tutor picks a student and course on the
 * left, and the four tabs on the right show what the assistant made from
 * that pair's recorded lessons. The selection and tab live in the URL so
 * chat notices and session cards can deep-link here.
 */
const Assistant: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const [params, setParams] = useSearchParams();
  const studentsQuery = useCoachStudents();
  const rows = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);
  const [search, setSearch] = useState('');

  const tab: AssistantTab = isTab(params.get('tab'))
    ? (params.get('tab') as AssistantTab)
    : 'insights';
  const studentParam = Number(params.get('student'));
  const courseParam = Number(params.get('course'));

  const selected = useMemo<CoachStudentRow | undefined>(() => {
    if (!rows.length) return undefined;
    return (
      rows.find(
        (row) =>
          row.student.id === studentParam &&
          (!courseParam || row.grade_subject.id === courseParam),
      ) ?? rows[0]
    );
  }, [rows, studentParam, courseParam]);

  // Write the default selection back so the URL is always shareable
  useEffect(() => {
    if (!selected) return;
    if (
      selected.student.id !== studentParam ||
      selected.grade_subject.id !== courseParam
    ) {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('student', String(selected.student.id));
          next.set('course', String(selected.grade_subject.id));
          return next;
        },
        { replace: true },
      );
    }
  }, [selected, studentParam, courseParam, setParams]);

  const select = (row: CoachStudentRow) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('student', String(row.student.id));
      next.set('course', String(row.grade_subject.id));
      return next;
    });

  const selectTab = (value: AssistantTab) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      return next;
    });

  const filtered = rows.filter((row) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      fullName(row.student).toLowerCase().includes(needle) ||
      row.grade_subject.full_course_name.toLowerCase().includes(needle)
    );
  });

  const tabIndex = Math.max(0, TABS.indexOf(tab));

  return (
    <section className={`assistant ${rtlClass}`}>
      <div className="container as-container">
        <header className="as-header">
          <div>
            <h1 className="as-header__title">
              <AutoAwesomeRounded className="as-header__icon" />
              {t('ASSISTANT.TITLE')}
            </h1>
            <p className="as-header__subtitle">{t('ASSISTANT.SUBTITLE')}</p>
          </div>
        </header>

        {studentsQuery.isLoading && (
          <div className="as-layout">
            <Skeleton variant="rounded" height={420} />
            <Skeleton variant="rounded" height={420} />
          </div>
        )}

        {!studentsQuery.isLoading && rows.length === 0 && (
          <div className="as-panel as-panel--empty">
            <img src={emptyArt} alt="" className="as-empty__art" />
            <h2 className="as-empty__title">{t('ASSISTANT.EMPTY.TITLE')}</h2>
            <p className="as-empty__text">{t('ASSISTANT.EMPTY.TEXT')}</p>
          </div>
        )}

        {!studentsQuery.isLoading && rows.length > 0 && selected && (
          <div className="as-layout">
            <aside className="as-students" aria-label={t('ASSISTANT.STUDENTS')}>
              <TextField
                size="small"
                fullWidth
                placeholder={t('ASSISTANT.SEARCH')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <ul className="as-students__list">
                {filtered.map((row) => {
                  const active = pairKey(row) === pairKey(selected);
                  return (
                    <li key={pairKey(row)}>
                      <button
                        type="button"
                        className={`as-student${active ? ' as-student--active' : ''}`}
                        onClick={() => select(row)}
                        aria-current={active ? 'true' : undefined}
                      >
                        <Avatar
                          src={row.student.avatar ?? undefined}
                          alt=""
                          sx={{ width: 40, height: 40 }}
                        >
                          {row.student.first_name?.[0]}
                        </Avatar>
                        <span className="as-student__body">
                          <span className="as-student__name" dir="auto">
                            {fullName(row.student)}
                          </span>
                          <span className="as-student__course" dir="auto">
                            {subjectName(row.grade_subject.full_course_name)}
                          </span>
                          <span className="as-student__meta">
                            {row.next_session
                              ? t('ASSISTANT.LIST.NEXT', {
                                  date: formatDate(
                                    row.next_session.start_time,
                                    i18n.language,
                                  ),
                                })
                              : t('ASSISTANT.LIST.LESSONS', {
                                  count: row.lessons_recorded,
                                })}
                          </span>
                        </span>
                        <span className="as-student__dots" aria-hidden="true">
                          <Dot
                            tone={dotTone(row.insight_status)}
                            title={t('ASSISTANT.TABS.INSIGHTS')}
                          />
                          <Dot
                            tone={dotTone(row.plan_status)}
                            title={t('ASSISTANT.TABS.PLAN')}
                          />
                          <Dot
                            tone={dotTone(row.homework_status)}
                            title={t('ASSISTANT.TABS.HOMEWORK')}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="as-students__none">
                    {t('ASSISTANT.LIST.NO_MATCH')}
                  </li>
                )}
              </ul>
            </aside>

            <main className="as-main">
              <div className="as-pair">
                <Avatar
                  src={selected.student.avatar ?? undefined}
                  alt=""
                  sx={{ width: 56, height: 56 }}
                >
                  {selected.student.first_name?.[0]}
                </Avatar>
                <div className="as-pair__body">
                  <h2 className="as-pair__name" dir="auto">
                    {fullName(selected.student)}
                  </h2>
                  <p className="as-pair__course" dir="auto">
                    {selected.grade_subject.full_course_name}
                  </p>
                  <p className="as-pair__meta">
                    {t('ASSISTANT.LIST.LESSONS', {
                      count: selected.lessons_recorded,
                    })}
                    {selected.next_session && (
                      <>
                        {' · '}
                        {t('ASSISTANT.LIST.NEXT', {
                          date: formatDate(
                            selected.next_session.start_time,
                            i18n.language,
                          ),
                        })}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <Tabs
                value={tabIndex}
                onChange={(_, index: number) => selectTab(TABS[index])}
                variant="scrollable"
                scrollButtons="auto"
                className="as-tabs"
              >
                {TABS.map((key, index) => (
                  <Tab
                    key={key}
                    icon={TAB_ICONS[key]}
                    iconPosition="start"
                    label={t(`ASSISTANT.TABS.${key.toUpperCase()}`)}
                    {...tabsProps(index)}
                  />
                ))}
              </Tabs>

              <TabPanel value={tabIndex} index={0}>
                <LearnerInsights row={selected} />
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                <LessonPlanTab row={selected} />
              </TabPanel>
              <TabPanel value={tabIndex} index={2}>
                <HomeworkTab row={selected} />
              </TabPanel>
              <TabPanel value={tabIndex} index={3}>
                <BetterTeacher />
              </TabPanel>
            </main>
          </div>
        )}
      </div>
    </section>
  );
};

export default Assistant;
