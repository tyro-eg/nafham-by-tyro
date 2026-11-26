import { describe, expect, it } from 'vitest';
import { signUpBody } from './register.utils';

const typed = {
  first_name: ' Huda ',
  last_name: ' Salem ',
  email: ' huda@example.com ',
  password: 'Chosen1234!',
  phone_number: '971 50 123 4567',
  country_code: 'ae',
};

describe('what the short sign-up form sends', () => {
  it('a parent: their details, and the child under their last name', () => {
    expect(signUpBody(typed, 'Parent', ' Omar ')).toEqual({
      first_name: 'Huda',
      last_name: 'Salem',
      email: 'huda@example.com',
      password: 'Chosen1234!',
      password_confirmation: 'Chosen1234!',
      phone_number: '+971501234567',
      country_code: 'AE',
      nationality: 'AE',
      type: 'Parent',
      child: { first_name: 'Omar', last_name: 'Salem' },
    });
  });

  it('a student: no child, even if a name was left in the box', () => {
    const body = signUpBody(typed, 'Student', 'Omar');
    expect(body.type).toBe('Student');
    expect('child' in body).toBe(false);
  });

  it('keeps a plus that was typed, and takes the country from the phone', () => {
    const body = signUpBody(
      { ...typed, phone_number: '+20 100 555 0101', country_code: 'eg' },
      'Student',
      '',
    );
    expect(body.phone_number).toBe('+201005550101');
    expect([body.country_code, body.nationality]).toEqual(['EG', 'EG']);
  });
});
