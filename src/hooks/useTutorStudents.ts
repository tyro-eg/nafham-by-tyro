import { useMemo } from 'react';
import { usePackages } from './usePackages';
import { fullName } from '../lib/people';

// Enough packages to list every student without paging through the API
const PACKAGES_SIZE = 100;

export interface NamedOption {
  id: number;
  name: string;
}

/**
 * Who a tutor teaches, read off their packages: the students by name, and
 * for each student the courses they hold a package for. Both the homework
 * list filter and the "Assign homework" form start from this.
 */
export function useTutorStudents(enabled = true) {
  const query = usePackages(1, PACKAGES_SIZE);
  const packages = useMemo(
    () => (enabled ? (query.data?.data ?? []) : []),
    [enabled, query.data],
  );

  const students = useMemo<NamedOption[]>(() => {
    const byId = new Map<number, string>();
    packages.forEach((pkg) => byId.set(pkg.student.id, fullName(pkg.student)));
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [packages]);

  /** The courses one student has a package for with this tutor */
  const coursesFor = useMemo(
    () =>
      (studentId: number | string): NamedOption[] => {
        const byId = new Map<number, string>();
        packages
          .filter((pkg) => String(pkg.student.id) === String(studentId))
          .forEach((pkg) =>
            byId.set(pkg.grade_subject.id, pkg.grade_subject.full_course_name),
          );
        return Array.from(byId, ([id, name]) => ({ id, name }));
      },
    [packages],
  );

  return { students, coursesFor, isLoading: enabled && query.isLoading };
}
