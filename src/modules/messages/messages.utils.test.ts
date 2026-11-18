import { describe, expect, it } from 'vitest';

import {
  clockTime,
  dayLabel,
  formatConversationTime,
  matchesListFilter,
  textInLanguage,
  typingLabelOf,
} from './messages.utils';

// Echoes the key (and the name) so tests can read what was asked for
const t = (key: string, opts?: Record<string, unknown>) =>
  opts?.name !== undefined ? `${key}:${opts.name}` : key;

// Wednesday 11 November 2026, mid-afternoon local time
const now = new Date(2026, 10, 11, 15, 0);

describe('textInLanguage', () => {
  const both = 'Your lesson moved.\n\nانتقلت حصتك.';

  it("keeps the reader's paragraphs when both languages are there", () => {
    expect(textInLanguage(both, 'en')).toBe('Your lesson moved.');
    expect(textInLanguage(both, 'ar')).toBe('انتقلت حصتك.');
    expect(textInLanguage(both, 'ar-EG')).toBe('انتقلت حصتك.');
  });

  it('keeps several paragraphs of the same language in order', () => {
    const text = 'One.\n\nTwo.\n\nواحد.\n\nاثنان.';
    expect(textInLanguage(text, 'en')).toBe('One.\n\nTwo.');
    expect(textInLanguage(text, 'ar')).toBe('واحد.\n\nاثنان.');
  });

  it('leaves text in one language alone', () => {
    expect(textInLanguage('Only English', 'ar')).toBe('Only English');
    expect(textInLanguage('عربي فقط', 'en')).toBe('عربي فقط');
  });

  it('classes an Arabic paragraph with English course names as Arabic', () => {
    const text = 'Omar has 2 hours left.\n\nتبقى لعمر ساعتان في IGCSE رياضيات.';
    expect(textInLanguage(text, 'ar')).toBe(
      'تبقى لعمر ساعتان في IGCSE رياضيات.',
    );
  });

  it('accepts blank lines with spaces between paragraphs', () => {
    expect(textInLanguage('Hi.\n  \nأهلاً.', 'en')).toBe('Hi.');
  });

  it('copes with empty text', () => {
    expect(textInLanguage('', 'ar')).toBe('');
  });
});

describe('clockTime', () => {
  it('is empty without a date', () => {
    expect(clockTime(undefined, 'en')).toBe('');
  });

  it('uses Western digits in Arabic', () => {
    expect(clockTime(new Date(2026, 10, 11, 9, 5), 'ar')).toMatch(/9:05/);
  });
});

describe('dayLabel', () => {
  it('says today and yesterday', () => {
    expect(dayLabel(new Date(2026, 10, 11, 8), 'en', t, now)).toBe(
      'MESSAGES.TODAY',
    );
    expect(dayLabel(new Date(2026, 10, 10, 23), 'en', t, now)).toBe(
      'MESSAGES.YESTERDAY',
    );
  });

  it('names the weekday earlier this week (weeks start on Saturday)', () => {
    // Saturday 7 November is the first day of this week
    expect(dayLabel(new Date(2026, 10, 7), 'en', t, now)).toBe('Saturday');
  });

  // The comma after the weekday depends on the ICU version
  it('gives a date before this week, with the year only when needed', () => {
    expect(dayLabel(new Date(2026, 10, 6), 'en', t, now)).toMatch(
      /^Fri,? 6 Nov$/,
    );
    expect(dayLabel(new Date(2025, 0, 2), 'en', t, now)).toMatch(
      /^Thu,? 2 Jan 2025$/,
    );
  });
});

describe('formatConversationTime', () => {
  it('shows the clock today, then yesterday, then a short date', () => {
    expect(
      formatConversationTime(new Date(2026, 10, 11, 9, 5), 'en', t, now),
    ).toMatch(/9:05/);
    expect(formatConversationTime(new Date(2026, 10, 10), 'en', t, now)).toBe(
      'MESSAGES.YESTERDAY',
    );
    expect(formatConversationTime(new Date(2026, 10, 2), 'en', t, now)).toBe(
      '2 Nov',
    );
  });
});

describe('matchesListFilter', () => {
  const lesson = {
    unread: 0,
    support: false,
    searchable: ['Nour Tutor', 'IGCSE - Year 10 - Mathematics'],
  };
  const support = { unread: 2, support: true, searchable: ['Nafham Support'] };

  it('passes everything under All with no search', () => {
    expect(matchesListFilter(lesson, 'all', '')).toBe(true);
    expect(matchesListFilter(support, 'all', '   ')).toBe(true);
  });

  it('keeps only unread or only support conversations', () => {
    expect(matchesListFilter(lesson, 'unread', '')).toBe(false);
    expect(matchesListFilter(support, 'unread', '')).toBe(true);
    expect(matchesListFilter(lesson, 'nafham', '')).toBe(false);
    expect(matchesListFilter(support, 'nafham', '')).toBe(true);
  });

  it('searches names and subject, ignoring case and spaces around', () => {
    expect(matchesListFilter(lesson, 'all', ' nour ')).toBe(true);
    expect(matchesListFilter(lesson, 'all', 'MATH')).toBe(true);
    expect(matchesListFilter(lesson, 'all', 'physics')).toBe(false);
    expect(matchesListFilter(support, 'all', 'support')).toBe(true);
  });

  it('applies the filter and the search together', () => {
    expect(matchesListFilter(support, 'nafham', 'nour')).toBe(false);
  });

  it('skips missing names', () => {
    expect(
      matchesListFilter(
        { unread: 0, support: false, searchable: [undefined] },
        'all',
        'x',
      ),
    ).toBe(false);
  });
});

describe('typingLabelOf', () => {
  it('is empty when nobody types', () => {
    expect(typingLabelOf([], t)).toBe('');
  });

  it('names one person by first name', () => {
    expect(typingLabelOf(['Sara Ahmed'], t)).toBe('MESSAGES.TYPING_ONE:Sara');
    expect(typingLabelOf([undefined], t)).toBe('MESSAGES.TYPING_ONE:');
  });

  it('says several are typing', () => {
    expect(typingLabelOf(['A', 'B'], t)).toBe('MESSAGES.TYPING_MANY');
  });
});
