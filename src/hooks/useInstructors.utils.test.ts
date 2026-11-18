import { describe, expect, it } from 'vitest';

import { instructorListParams } from './useInstructors.utils';

describe('instructorListParams', () => {
  it('asks for one page', () => {
    expect(instructorListParams(2, 10)).toEqual({ per_page: 10, page: 2 });
  });

  it('adds only the filters that are set', () => {
    expect(
      instructorListParams(1, 20, {
        grade_subject_id: 7,
        accepting_new_students: true,
      }),
    ).toEqual({
      per_page: 20,
      page: 1,
      grade_subject_id: 7,
      accepting_new_students: true,
    });
    expect(
      instructorListParams(1, 20, { accepting_new_students: false }),
    ).toEqual({ per_page: 20, page: 1 });
  });
});
