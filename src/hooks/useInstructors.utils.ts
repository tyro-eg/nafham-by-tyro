/**
 * Instructor filters
 */
export interface InstructorFilters {
  grade_subject_id?: number;
  /** Leave out instructors who are not taking new students */
  accepting_new_students?: boolean;
}

/** Query params for GET /tutors: one page, plus the filters that are set */
export const instructorListParams = (
  page: number,
  pageSize: number,
  filters?: InstructorFilters,
): Record<string, number | boolean> => ({
  per_page: pageSize,
  page,
  ...(filters?.grade_subject_id
    ? { grade_subject_id: filters.grade_subject_id }
    : {}),
  ...(filters?.accepting_new_students ? { accepting_new_students: true } : {}),
});
