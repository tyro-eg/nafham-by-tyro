import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockedStorage, memoryStorage } from '../test/memory-storage';

const post = vi.fn();
vi.mock('../assets/utils/api', () => ({
  post: (...args: unknown[]) => post(...args),
}));

// Imported after the mock, so the module under test uses it
const {
  MAX_BATCH,
  flushFunnel,
  newVisitorId,
  resetFunnelOnce,
  trackFunnel,
  trackFunnelOnce,
  visitorId,
} = await import('./funnel');

describe('the visitor id', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is made once and kept for this browser', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const first = visitorId();
    expect(first).toMatch(/^[A-Za-z0-9]{22}$/);
    expect(visitorId()).toBe(first);
  });

  it('replaces a stored value the server would not accept', () => {
    vi.stubGlobal('localStorage', memoryStorage({ 'tyro.visitorId': 'x y' }));
    expect(visitorId()).toMatch(/^[A-Za-z0-9]{22}$/);
  });

  it('is different every time it is made', () => {
    expect(newVisitorId()).not.toBe(newVisitorId());
  });

  it('is missing when storage is blocked', () => {
    vi.stubGlobal('localStorage', blockedStorage());
    expect(visitorId()).toBeNull();
  });
});

describe('reporting steps', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({});
    vi.stubGlobal('localStorage', memoryStorage());
  });
  afterEach(async () => {
    await flushFunnel();
    vi.unstubAllGlobals();
  });

  it('sends a visitor’s steps together, to the public endpoint', async () => {
    trackFunnel('trial_started');
    trackFunnel('trial_step_viewed', { step: 'tutors', child: undefined });
    await flushFunnel();

    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/public/funnel_events');
    expect(body.platform).toBe('web');
    expect(body.anonymous_id).toBe(visitorId());
    expect(body.events).toEqual([
      { name: 'trial_started', properties: {} },
      { name: 'trial_step_viewed', properties: { step: 'tutors' } },
    ]);
  });

  it('sends with the account once signed in, keeping the visitor id', async () => {
    const id = visitorId();
    localStorage.setItem('tyro.token', 'token');
    trackFunnel('buy_started');
    await flushFunnel();

    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/funnel_events');
    expect(body.anonymous_id).toBe(id);
  });

  it('splits a long run into requests the server takes whole', async () => {
    for (let i = 0; i < MAX_BATCH + 5; i += 1) trackFunnel('buy_step_viewed');
    await flushFunnel();

    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[0][1].events).toHaveLength(MAX_BATCH);
    expect(post.mock.calls[1][1].events).toHaveLength(5);
  });

  it('never throws when the request fails', async () => {
    post.mockRejectedValue(new Error('offline'));
    trackFunnel('landing_viewed');
    await expect(flushFunnel()).resolves.toBeUndefined();
  });

  it('sends nothing when there is nobody to count it for', async () => {
    vi.stubGlobal('localStorage', blockedStorage());
    trackFunnel('landing_viewed');
    await flushFunnel();
    expect(post).not.toHaveBeenCalled();
  });

  it('has nothing to send when nothing happened', async () => {
    await flushFunnel();
    expect(post).not.toHaveBeenCalled();
  });
});

describe('a step that counts once per run', () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({});
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage());
  });
  afterEach(async () => {
    await flushFunnel();
    vi.unstubAllGlobals();
  });

  it('is reported once, however often the page is mounted', async () => {
    trackFunnelOnce('trial', 'trial_started');
    trackFunnelOnce('trial', 'trial_started');
    await flushFunnel();
    expect(post.mock.calls[0][1].events).toHaveLength(1);
  });

  it('counts again after the run ended', async () => {
    trackFunnelOnce('trial', 'trial_started');
    resetFunnelOnce('trial');
    trackFunnelOnce('trial', 'trial_started');
    await flushFunnel();
    expect(post.mock.calls[0][1].events).toHaveLength(2);
  });

  it('still reports when storage is blocked', async () => {
    vi.stubGlobal('sessionStorage', blockedStorage());
    trackFunnelOnce('trial', 'trial_started');
    await flushFunnel();
    expect(post).toHaveBeenCalledTimes(1);
  });
});
