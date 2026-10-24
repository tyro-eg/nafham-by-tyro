/**
 * Where a signed-in user lands: both students and tutors get their
 * dashboard.
 */
export const getHomePath = (user?: { type?: string } | null): string =>
  user ? '/dashboard' : '/';
