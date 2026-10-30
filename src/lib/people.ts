/** "First Last" for anyone the API returns with a split name */
export const fullName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`.trim();
