import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn();
const set = vi.fn();
vi.mock('react-ga4', () => ({
  default: {
    send: (...args: unknown[]) => send(...args),
    set: (...args: unknown[]) => set(...args),
  },
}));

// Imported after the mock, so the module under test uses it
const { trackPageView } = await import('./analytics');

const TOKEN = 'eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1qUT0ifX0--9f8a7b6c5d4e';

describe('page views sent to analytics', () => {
  beforeEach(() => {
    send.mockReset();
    set.mockReset();
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
    vi.stubGlobal('window', { location: { origin: 'https://nafham.test' } });
    vi.stubGlobal('document', { title: 'Nafham' });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('never carry the activation link’s token, in the path or the address', () => {
    trackPageView(`/activate/${TOKEN}`);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({
      hitType: 'pageview',
      page: '/activate/:token',
      location: 'https://nafham.test/activate/:token',
    });
    // What GA measures by itself afterwards reads this address, not the bar
    expect(set).toHaveBeenCalledWith({
      page_location: 'https://nafham.test/activate/:token',
    });
    expect(JSON.stringify([send.mock.calls, set.mock.calls])).not.toContain(
      TOKEN,
    );
  });

  it('send every other page as it is', () => {
    trackPageView('/my_sessions?status=upcoming', 'My sessions');
    expect(send.mock.calls[0][0]).toEqual({
      hitType: 'pageview',
      page: '/my_sessions?status=upcoming',
      location: 'https://nafham.test/my_sessions?status=upcoming',
      title: 'My sessions',
    });
  });

  it('send nothing while analytics is off', () => {
    vi.stubEnv('VITE_ENABLE_ANALYTICS', '');
    trackPageView('/dashboard');
    expect(send).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });
});
