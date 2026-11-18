import { describe, expect, it } from 'vitest';
import type { LocalMessage } from 'stream-chat';

import { STREAM_ADMIN_USER_ID } from '../../lib/streamChat';
import {
  authorOf,
  groupPositionOf,
  isLatestFromNafham,
  isMediaOnly,
  messageKindOf,
  noticePathOf,
  pathLabelOf,
  previewOf,
  roleOf,
  seenByOthers,
  ticksOf,
} from './message-model';

const ADMIN = STREAM_ADMIN_USER_ID;

const card = (overrides: Record<string, unknown> = {}) => ({
  v: 1,
  kind: 'proposal',
  state: 'answered',
  subject: { slug: 'move', student_id: 1, tutor_id: 2 },
  actions: [],
  ...overrides,
});

const msg = (overrides: Partial<LocalMessage> = {}) =>
  ({
    id: 'm1',
    type: 'regular',
    text: 'Hello',
    user: { id: '7', name: 'Sara Ahmed' },
    ...overrides,
  }) as LocalMessage;

const fromNafham = (overrides: Partial<LocalMessage> = {}) =>
  msg({ user: { id: ADMIN, name: 'Nafham Support' }, ...overrides });

const sameText = (text: string) => text;

describe('messageKindOf', () => {
  it('reads a person as a plain message', () => {
    expect(messageKindOf(msg())).toEqual({
      fromAdmin: false,
      helper: false,
      bot: false,
      announcement: false,
      card: null,
    });
  });

  it('reads a person on the Nafham team as support, not a notice', () => {
    const kind = messageKindOf(fromNafham());
    expect(kind.fromAdmin).toBe(true);
    expect(kind.bot).toBe(false);
    expect(kind.announcement).toBe(false);
  });

  it('draws a Nafham system message as an announcement', () => {
    expect(messageKindOf(fromNafham({ system: true })).announcement).toBe(true);
  });

  it('ignores system on a message from anyone else', () => {
    expect(messageKindOf(msg({ system: true })).announcement).toBe(false);
  });

  it('reads the lesson bot with its card', () => {
    const kind = messageKindOf(
      fromNafham({ bot: true, system: true, assistant: card() as never }),
    );
    expect(kind.bot).toBe(true);
    expect(kind.helper).toBe(false);
    expect(kind.announcement).toBe(false);
    expect(kind.card?.state).toBe('answered');
  });

  it('reads the support assistant (assistant: true) without a card', () => {
    const kind = messageKindOf(fromNafham({ assistant: true }));
    expect(kind.helper).toBe(true);
    expect(kind.bot).toBe(true);
    expect(kind.card).toBeNull();
  });

  it('does not trust assistant: true from someone else', () => {
    const kind = messageKindOf(msg({ assistant: true }));
    expect(kind.helper).toBe(false);
    expect(kind.bot).toBe(false);
  });

  it('drops a malformed card but still reads the bot', () => {
    const kind = messageKindOf(
      fromNafham({ bot: true, assistant: { v: 2 } as never }),
    );
    expect(kind.bot).toBe(true);
    expect(kind.card).toBeNull();
  });

  it('copes with a card whose actions are null', () => {
    const kind = messageKindOf(
      fromNafham({ bot: true, assistant: card({ actions: null }) as never }),
    );
    expect(kind.card?.actions).toEqual([]);
  });
});

describe('noticePathOf', () => {
  const notice = (path: unknown) =>
    fromNafham({ system: true, path: path as string });

  it('keeps an app path on a Nafham notice', () => {
    expect(noticePathOf(notice('/my_packages'), null)).toBe('/my_packages');
  });

  it('needs a notice from Nafham', () => {
    expect(noticePathOf(fromNafham({ path: '/my_packages' }), null)).toBe(
      undefined,
    );
    expect(
      noticePathOf(msg({ system: true, path: '/my_packages' }), null),
    ).toBe(undefined);
  });

  it('refuses anything that is not an app path', () => {
    expect(noticePathOf(notice('https://evil.example'), null)).toBe(undefined);
    expect(noticePathOf(notice('//evil.example'), null)).toBe(undefined);
    expect(noticePathOf(notice(42), null)).toBe(undefined);
    expect(noticePathOf(notice(undefined), null)).toBe(undefined);
  });

  it('hides the button while the card still has answers here', () => {
    const open = card({ state: 'open' }) as never;
    expect(noticePathOf(notice('/requests'), open)).toBe(undefined);
    const done = card({ state: 'answered' }) as never;
    expect(noticePathOf(notice('/requests'), done)).toBe('/requests');
  });

  it('never links to the conversation being read', () => {
    expect(noticePathOf(notice('/messages/abc'), null, 'abc')).toBe(undefined);
    expect(noticePathOf(notice('/messages/xyz'), null, 'abc')).toBe(
      '/messages/xyz',
    );
  });
});

describe('pathLabelOf', () => {
  it('names another chat', () => {
    expect(pathLabelOf('/messages/abc', 'move_proposed')).toBe(
      'SESSION_CHANGES.CHAT.OPEN_CHAT',
    );
  });

  it('prefers the template, then the path, then sessions', () => {
    expect(pathLabelOf('/sessions', 'freeze_created')).toBe(
      'SESSION_CHANGES.CHAT.PACKAGES',
    );
    expect(pathLabelOf('/requests')).toBe('SESSION_CHANGES.CHAT.ANSWER');
    expect(pathLabelOf('/my_packages', 'unknown')).toBe(
      'SESSION_CHANGES.CHAT.PACKAGES',
    );
    expect(pathLabelOf('/anything')).toBe('SESSION_CHANGES.CHAT.SESSIONS');
  });
});

describe('roleOf', () => {
  const data = { tutor_id: 2, student_id: 1 };

  it('names the instructor, the student and Nafham Support', () => {
    expect(roleOf(data, '2')).toBe('instructor');
    expect(roleOf(data, '1')).toBe('student');
    expect(roleOf(data, ADMIN)).toBe('support');
  });

  it('leaves anyone else (a parent) without a role', () => {
    expect(roleOf(data, '99')).toBeUndefined();
    expect(roleOf(undefined, '2')).toBeUndefined();
    expect(roleOf(data, undefined)).toBeUndefined();
  });

  it('does not match a missing id to an empty one', () => {
    expect(roleOf({}, '')).toBeUndefined();
    expect(roleOf({ tutor_id: undefined }, 'undefined')).toBeUndefined();
  });
});

describe('isLatestFromNafham', () => {
  const thread = [
    fromNafham({ id: 'a' }),
    msg({ id: 'b' }),
    fromNafham({ id: 'c' }),
    msg({ id: 'd' }),
  ];

  it("keeps the options on Nafham's newest message past the person's replies", () => {
    expect(isLatestFromNafham(thread, 'c')).toBe(true);
    expect(isLatestFromNafham(thread, 'a')).toBe(false);
  });

  it('is false for a missing thread or id', () => {
    expect(isLatestFromNafham(undefined, 'c')).toBe(false);
    expect(isLatestFromNafham(thread, undefined)).toBe(false);
    expect(isLatestFromNafham([msg({ id: 'x' })], 'x')).toBe(false);
  });
});

describe('ticksOf and seenByOthers', () => {
  it('follows the send state first', () => {
    expect(ticksOf('sending', true, true)).toBe('sending');
    expect(ticksOf('failed', true, true)).toBe('failed');
  });

  it('then read, delivered, sent', () => {
    expect(ticksOf('received', true, true)).toBe('read');
    expect(ticksOf('received', false, true)).toBe('delivered');
    expect(ticksOf(undefined, false, false)).toBe('sent');
  });

  it('does not count the author as a reader', () => {
    expect(seenByOthers([{ id: '7' }], '7')).toBe(false);
    expect(seenByOthers([{ id: '7' }, { id: '8' }], '7')).toBe(true);
    expect(seenByOthers(undefined, '7')).toBe(false);
  });
});

describe('groupPositionOf', () => {
  it('maps Stream group styles', () => {
    expect(groupPositionOf('top')).toEqual({
      group: 'top',
      first: true,
      last: false,
    });
    expect(groupPositionOf('middle')).toMatchObject({
      first: false,
      last: false,
    });
    expect(groupPositionOf('bottom')).toMatchObject({
      first: false,
      last: true,
    });
  });

  it('treats a missing style as a single message', () => {
    expect(groupPositionOf(undefined)).toEqual({
      group: 'single',
      first: true,
      last: true,
    });
    expect(groupPositionOf('')).toMatchObject({ group: 'single' });
  });
});

describe('isMediaOnly', () => {
  const image = { type: 'image' };

  it('is true for photos or videos with nothing else', () => {
    expect(isMediaOnly({ text: '' }, [image, { type: 'video' }])).toBe(true);
  });

  it('is false with text, a quote, a file or nothing attached', () => {
    expect(isMediaOnly({ text: 'look' }, [image])).toBe(false);
    expect(
      isMediaOnly({ text: '', quoted_message: {} as never }, [image]),
    ).toBe(false);
    expect(isMediaOnly({ text: '' }, [image, { type: 'file' }])).toBe(false);
    expect(isMediaOnly({ text: '' }, [])).toBe(false);
    expect(isMediaOnly({ text: '' }, [{ latitude: 1 }])).toBe(false);
  });
});

describe('previewOf', () => {
  it('says when there is nothing yet, or the message was deleted', () => {
    expect(previewOf(undefined, sameText)).toMatchObject({
      text: 'MESSAGES.NO_MESSAGES_YET',
      literal: false,
    });
    expect(previewOf(msg({ type: 'deleted' }), sameText)).toMatchObject({
      text: 'MESSAGES.DELETED_MESSAGE',
    });
  });

  it('gives a voice note its length', () => {
    const voice = msg({
      text: '',
      attachments: [{ type: 'voiceRecording', duration: 65.4 }],
    });
    expect(previewOf(voice, sameText)).toEqual({
      kind: 'voice',
      text: 'MESSAGES.VOICE_NOTE',
      literal: false,
      duration: '1:05',
    });
  });

  it('does not show a negative or missing length', () => {
    const odd = msg({
      attachments: [{ type: 'voiceRecording', duration: -3 }],
    });
    expect(previewOf(odd, sameText).duration).toBe('0:00');
    const none = msg({ attachments: [{ type: 'voiceRecording' }] });
    expect(previewOf(none, sameText).duration).toBe('0:00');
  });

  it('puts text on one line', () => {
    expect(previewOf(msg({ text: '  a\n\nb  ' }), sameText)).toEqual({
      kind: null,
      text: 'a b',
      literal: true,
    });
  });

  it("filters only Nafham's text to the reader's language", () => {
    const pick = () => 'picked';
    expect(previewOf(fromNafham({ text: 'x' }), pick).text).toBe('picked');
    expect(previewOf(msg({ text: 'x' }), pick).text).toBe('x');
  });

  it('names photos and files', () => {
    expect(
      previewOf(msg({ text: '', attachments: [{ type: 'image' }] }), sameText),
    ).toMatchObject({ kind: 'photo', text: 'MESSAGES.PHOTO' });
    expect(
      previewOf(
        msg({ text: '', attachments: [{ type: 'file', title: 'notes.pdf' }] }),
        sameText,
      ),
    ).toEqual({ kind: 'file', text: 'notes.pdf', literal: true });
    expect(
      previewOf(msg({ text: '', attachments: [{ type: 'file' }] }), sameText),
    ).toMatchObject({ kind: 'file', text: 'MESSAGES.FILE', literal: false });
  });
});

describe('authorOf', () => {
  it('tells you, the assistant, support and people apart', () => {
    expect(authorOf(undefined, '7')).toBe('none');
    expect(authorOf(msg(), '7')).toBe('you');
    expect(authorOf(msg(), '8')).toBe('person');
    expect(authorOf(fromNafham(), '8')).toBe('support');
    expect(authorOf(fromNafham({ assistant: true }), '8')).toBe('assistant');
    expect(
      authorOf(fromNafham({ bot: true, assistant: card() as never }), '8'),
    ).toBe('assistant');
  });
});
