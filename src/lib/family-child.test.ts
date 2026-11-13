import { describe, expect, it } from 'vitest';
import { findChildPackage } from './family-child';

const children = [
  { id: 1, first_name: 'Sara', packages: [{ id: 10 }, { id: 11 }] },
  { id: 2, first_name: 'Omar', packages: [{ id: 20 }] },
  { id: 3, first_name: 'Lina', packages: [] },
];

describe('findChildPackage', () => {
  it('finds the child that owns the package', () => {
    const found = findChildPackage(children, 20);
    expect(found?.child.first_name).toBe('Omar');
    expect(found?.pkg).toEqual({ id: 20 });
  });

  it('is null for a package no child owns, or before the family loads', () => {
    expect(findChildPackage(children, 99)).toBeNull();
    expect(findChildPackage(undefined, 10)).toBeNull();
  });
});
