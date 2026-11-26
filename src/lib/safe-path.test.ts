import { describe, expect, it } from 'vitest';
import { safePath, scrubAddresses } from './safe-path';

const TOKEN = 'eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1qUT0ifX0--9f8a7b6c5d4e';

describe('addresses reported to analytics and error tracking', () => {
  it('names the activation route instead of its token', () => {
    expect(safePath(`/activate/${TOKEN}`)).toBe('/activate/:token');
    expect(safePath(`/activate/${TOKEN}?utm_source=whatsapp`)).toBe(
      '/activate/:token?utm_source=whatsapp',
    );
    expect(safePath(`https://nafham.com/activate/${TOKEN}#top`)).toBe(
      'https://nafham.com/activate/:token#top',
    );
  });

  it('covers the API calls behind the activation page', () => {
    expect(safePath(`https://api.test/api/v1/activations/${TOKEN}/code`)).toBe(
      'https://api.test/api/v1/activations/:token/code',
    );
    expect(safePath(`GET /api/v1/activations/${TOKEN}`)).toBe(
      'GET /api/v1/activations/:token',
    );
  });

  it('drops the staff token and the app’s sign-in code', () => {
    expect(
      safePath('/impersonate?token=abc.def.ghi&impersonator_email=a@b.co'),
    ).toBe('/impersonate');
    expect(safePath('https://nafham.com/handoff#code=12345')).toBe(
      'https://nafham.com/handoff',
    );
  });

  it('leaves every other address as it is', () => {
    for (const path of [
      '/',
      '/dashboard',
      '/my_sessions?status=upcoming',
      '/payments/abc123/return?paid=1',
      '/profile/42',
      '/activate',
    ]) {
      expect(safePath(path)).toBe(path);
    }
  });

  it('cleans every text inside a report, in place', () => {
    const report = {
      request: { url: `https://nafham.com/activate/${TOKEN}` },
      transaction: `/activate/${TOKEN}`,
      breadcrumbs: [
        { data: { from: '/', to: `/activate/${TOKEN}` } },
        { data: { url: `https://api.test/api/v1/activations/${TOKEN}` } },
      ],
      urls: [`https://nafham.com/activate/${TOKEN}`],
      level: 'error',
      count: 3,
      nothing: null,
    };
    expect(scrubAddresses(report)).toBe(report);
    expect(JSON.stringify(report)).not.toContain(TOKEN);
    expect(report.request.url).toBe('https://nafham.com/activate/:token');
    expect(report.urls).toEqual(['https://nafham.com/activate/:token']);
    expect(report.level).toBe('error');
    expect(report.count).toBe(3);
  });

  it('survives a report that points back at itself', () => {
    const report: Record<string, unknown> = { url: `/activate/${TOKEN}` };
    report.self = report;
    expect(() => scrubAddresses(report)).not.toThrow();
    expect(report.url).toBe('/activate/:token');
  });
});
