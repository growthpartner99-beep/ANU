const assert = require('node:assert/strict');
const test = require('node:test');

const { createAnuState, canTransition, STATES, LOOK } = require('../src/state/anuState.js');
const { needsCard, bubbleLifetimeMs, wordCount } = require('../src/shared/text.js');
const { askAnu, pickReply } = require('../src/services/askAnu.js');

const EXPRESSIONS = ['happy', 'winking', 'excited', 'thinking', 'sleepy', 'surprised'];

test('every state has a look that points at real placeholder art', () => {
  for (const state of STATES) {
    const look = LOOK[state];
    assert.ok(look, `missing look for ${state}`);
    assert.ok(EXPRESSIONS.includes(look.expression), `bad expression for ${state}`);
    if (look.pose) assert.equal(look.pose, 'hero');
    assert.ok(['rest', 'up', 'flat'].includes(look.ears));
    assert.ok(['dim', 'idle', 'mic', 'think', 'bright', 'steady', 'error'].includes(look.tail));
  }
});

test('idle timeout can only fall asleep from idle', () => {
  assert.equal(canTransition('idle', 'sleeping'), true);
  assert.equal(canTransition('typing', 'sleeping'), false);
  assert.equal(canTransition('listening', 'sleeping'), false);
  assert.equal(canTransition('sleeping', 'thinking'), false);
  assert.equal(canTransition('thinking', 'responding'), true);
});

test('every state can be dismissed to idle', () => {
  for (const state of STATES) {
    assert.equal(canTransition(state, 'idle'), true, `${state} cannot return to idle`);
  }
});

test('store emits only legal transitions', () => {
  const store = createAnuState('idle');
  const seen = [];
  store.subscribe((state) => seen.push(state));

  assert.equal(store.send('summoned'), true);
  assert.equal(store.send('responding'), false);
  assert.equal(store.get(), 'summoned');
  assert.equal(store.send('typing'), true);
  assert.equal(store.send('thinking'), true);
  assert.equal(store.send('responding'), true);
  assert.deepEqual(seen, ['idle', 'summoned', 'typing', 'thinking', 'responding']);
});

test('bubble becomes a card only for long or structured replies', () => {
  assert.equal(needsCard(Array(60).fill('word').join(' ')), false);
  assert.equal(needsCard(Array(61).fill('word').join(' ')), true);
  assert.equal(needsCard('text\n```js\nconst x = 1;\n```'), true);
  assert.equal(needsCard('steps:\n- one\n- two'), true);
  assert.equal(needsCard('| a | b |\n| - | - |'), true);
  assert.equal(needsCard('just a short line'), false);
});

test('bubble lifetime is 2s + words/3, capped at 20s', () => {
  assert.equal(bubbleLifetimeMs(''), 2000);
  assert.equal(bubbleLifetimeMs(Array(9).fill('w').join(' ')), 5000);
  assert.equal(bubbleLifetimeMs(Array(900).fill('w').join(' ')), 20000);
});

test('stub replies cover greeting, short, long, code and an action receipt', async () => {
  assert.match(pickReply('hey there').text, /Hi! I'm ANU/);

  const long = pickReply('explain this in detail with 80 words');
  assert.ok(wordCount(long.text) > 60, 'long reply must force the card path');

  const code = pickReply('show me a code example');
  assert.match(code.text, /```/);

  const action = pickReply('open spotify');
  assert.equal(action.receipt, 'opened Spotify');
  assert.equal(action.acting, true);
});

test('askAnu resolves with text and optional receipt', async () => {
  const reply = await askAnu('hello');
  assert.equal(typeof reply.text, 'string');
  assert.ok(reply.text.length > 0);
});
