/**
 * Where a signed-in user lands: students get their dashboard, tutors the
 * instructors page.
 */
export const getHomePath = (user?: { type?: string } | null): string =>
  user?.type === 'Student' ? '/dashboard' : '/home';
