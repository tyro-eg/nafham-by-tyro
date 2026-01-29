import { FC, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@mui/material';

import {
  useInstructors,
  useInfiniteInstructors,
} from '../../hooks/useInstructors';
import { Instructor, GradeSubject } from '../../assets/types';

import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';
import PrivateSessionsFilter from './private-sessions-filter/private-sessions-filter.component';
import InstructorCard from '../../component/instructor-card/instructor-card.component';

import './index.styles.scss';

const PrivateSessions: FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<GradeSubject | null>(
    null,
  );
  const pageSize = 10;

  // Build filters object
  const filters = useMemo(() => {
    const filterObj: { grade_subject_id?: number } = {};
    if (selectedCourse) {
      filterObj.grade_subject_id = selectedCourse.id;
    }
    return filterObj;
  }, [selectedCourse]);

  // Use infinite query when searching to get all instructors across all pages
  const hasSearchQuery = !!searchQuery.trim();
  const { data: paginatedData } = useInstructors(
    currentPage,
    pageSize,
    filters,
  );
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteInstructors(pageSize, filters);

  // Fetch all pages when searching to enable searching across all instructors
  useEffect(() => {
    if (hasSearchQuery && hasNextPage && !isFetchingNextPage) {
      // Keep fetching until all pages are loaded
      fetchNextPage();
    }
  }, [
    hasSearchQuery,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    infiniteData,
  ]);

  // Get all instructors from infinite query when searching, otherwise use paginated data
  const allInstructors = useMemo(() => {
    if (hasSearchQuery && infiniteData?.pages) {
      // Flatten all pages from infinite query
      return infiniteData.pages.flatMap((page) => page.data);
    }
    return paginatedData?.data || [];
  }, [hasSearchQuery, infiniteData, paginatedData]);

  const instructorsPagination = paginatedData?.pagination;

  // Reset to page 1 when search query or course filter changes
  useEffect(() => {
    if ((hasSearchQuery || selectedCourse) && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [hasSearchQuery, selectedCourse, currentPage]);

  /**
   * Filter instructors client-side based on search query
   * Searches in: first_name, last_name, bio, and grade_subjects
   */
  const filteredInstructors = useMemo(() => {
    if (!hasSearchQuery) {
      return allInstructors;
    }

    const query = searchQuery.toLowerCase().trim();

    return allInstructors.filter((instructor: Instructor) => {
      // Search in name
      const fullName =
        `${instructor.first_name} ${instructor.last_name}`.toLowerCase();
      if (fullName.includes(query)) {
        return true;
      }

      // Search in bio
      if (instructor.bio?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in grade_subjects (course names)
      if (
        instructor.grade_subjects?.some((subject) =>
          subject.full_course_name?.toLowerCase().includes(query),
        )
      ) {
        return true;
      }

      return false;
    });
  }, [allInstructors, searchQuery, hasSearchQuery]);

  const instructors = filteredInstructors;

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
      <PrivateSessionsFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
      />
      <section className="instructor-list">
        <div className="instructor-list__container container">
          {instructors?.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>

        {((instructors && instructors.length === 0) || !instructors) &&
          renderNoResults()}
      </section>

      {/* Hide pagination only when searching (client-side filter) */}
      {!searchQuery.trim() &&
        instructors?.length &&
        instructorsPagination?.['total-pages'] && (
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
