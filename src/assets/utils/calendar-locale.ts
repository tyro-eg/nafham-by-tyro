import type { LocaleInput } from '@fullcalendar/core';
import arKwLocale from '@fullcalendar/core/locales/ar-kw';

/**
 * FullCalendar Arabic locale (ar-kw texts, RTL, week start) that formats
 * numbers with Western digits, matching the rest of the app.
 * The `-u-nu-latn` extension is passed straight to Intl.
 */
const arLocale: LocaleInput = {
  ...arKwLocale,
  code: 'ar-u-nu-latn',
};

export default arLocale;
