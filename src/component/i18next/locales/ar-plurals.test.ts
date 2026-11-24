import { describe, expect, it } from 'vitest';
import ar from './ar/translation.json';

// Arabic picks zero, one, two, few (3–10), many (11–99) or other. A missing
// form makes i18next fall back to English, so "140 hours" showed in English.
const FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

const pluralBases = (
  node: Record<string, unknown>,
  path: string[] = [],
): Map<string, Set<string>> => {
  const found = new Map<string, Set<string>>();
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object') {
      pluralBases(value as Record<string, unknown>, [...path, key]).forEach(
        (v, k) => found.set(k, v),
      );
      continue;
    }
    const at = key.lastIndexOf('_');
    const form = key.slice(at + 1);
    if (at > 0 && FORMS.includes(form)) {
      const base = [...path, key.slice(0, at)].join('.');
      found.set(base, (found.get(base) ?? new Set()).add(form));
    }
  }
  return found;
};

describe('Arabic plurals', () => {
  it('every counted text has all six Arabic forms', () => {
    const incomplete = [...pluralBases(ar)]
      .filter(([, forms]) => forms.size < FORMS.length)
      .map(([base]) => base);
    expect(incomplete).toEqual([]);
  });
});
