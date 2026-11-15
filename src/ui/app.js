import { createRig } from '../rig/rig.js';
import { Pill } from './pill/pill.js';
import { Bubble } from './bubble/bubble.js';

const ANU = window.ANU;
const { createAnuState } = window.AnuState;
const { needsCard } = window.AnuText;

const bridge = window.anu || null;
const params = new URLSearchParams(window.location.search);
const shotMode = params.get('shot');

const characterEl = document.getElementById('character');
const rig = createRig({ container: characterEl, baseUrl: '../../assets/states/' });
const store = createAnuState('idle');

const pill = new Pill({
  root: document.getElementById('pill'),
  input: document.getElementById('pill-input'),
  caption: document.getElementById('pill-caption'),
  onSubmit: (value) => submit(value),
  onDismiss: () => dismissAll(),
  onValueChange: (value) => {
    noteActivity();
    if (value.trim() && store.get() === 'summoned') store.send('typing');
    if (!value.trim() && store.get() === 'typing') store.send('summoned');
  },
});

const bubble = new Bubble({
  root: document.getElementById('bubble'),
  text: document.getElementById('bubble-text'),
  receipt: document.getElementById('bubble-receipt'),
  card: document.getElementById('card'),
  cardBody: document.getElementById('card-body'),
  cardReceipt: document.getElementById('card-receipt'),
  cardClose: document.getElementById('card-close'),
  onDismiss: () => {
    if (store.get() === 'responding') store.send('idle');
    noteActivity();
  },
});

// ---------------------------------------------------------------- state -> look
store.subscribe((state, _previous, look) => {
  rig.setExpression(look.expression, look.pose);
  rig.setTailStatus(look.tail);
  document.body.dataset.state = state;
  document.body.dataset.rings = look.rings;
  document.body.dataset.ears = look.ears;
  document.body.dataset.listening = String(state === 'listening');
  if (state === 'sleeping') {
    pill.close();
    pill.setCaption('');
    bubble.hide();
  }
});

// --------------------------------------------------------------------- timers
let idleTimer = null;
let flowToken = 0;

function noteActivity() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (store.get() === 'idle') store.send('sleeping');
  }, ANU.SLEEP_AFTER_MS);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------ pill flow
function openPill() {
  noteActivity();
  bubble.hide();
  if (!store.can('summoned')) store.send('idle');
  store.send('summoned');
  pill.open();
}

function enterThinking() {
  const state = store.get();
  if (state === 'thinking') return true;
  if (state === 'listening') return store.send('thinking');
  if (state === 'responding' || state === 'acting') store.send('idle');
  if (store.get() === 'idle' || store.get() === 'sleeping' || store.get() === 'error') {
    store.send('summoned');
  }
  if (store.get() === 'summoned') store.send('typing');
  return store.send('thinking');
}

async function submit(text) {
  const value = String(text || '').trim();
  if (!value) return;
  noteActivity();
  const token = ++flowToken;
  bubble.hide();
  bubble.hideCard();
  enterThinking();

  // askAnu() is the single seam for a real backend (src/services/askAnu.js).
  const reply = await window.askAnu(value);
  if (token !== flowToken) return;

  if (reply.acting) {
    store.send('acting');
    await wait(900);
    if (token !== flowToken) return;
  }
  store.send('responding');

  const asCard = needsCard(reply.text);
  if (asCard) bubble.showCard(reply.text, { receipt: reply.receipt });
  else bubble.show(reply.text, { receipt: reply.receipt });
  noteActivity();

  if (bridge) {
    bridge.logExchange({ user: value, anu: reply.text, kind: asCard ? 'card' : 'bubble', receipt: reply.receipt || '' });
  }
}

// ------------------------------------------------------------ push-to-talk
let mic = null;

async function startMic() {
  if (mic || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    mic = { stream, ctx, analyser, data };

    const tick = () => {
      if (!mic) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      rig.setMicLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
      mic.raf = requestAnimationFrame(tick);
    };
    tick();
  } catch (error) {
    console.warn('[ANU] microphone unavailable:', error.message);
  }
}

function stopMic() {
  if (!mic) {
    rig.setMicLevel(0);
    return;
  }
  if (mic.raf) cancelAnimationFrame(mic.raf);
  mic.ctx.close().catch(() => {});
  mic.stream.getTracks().forEach((track) => track.stop());
  mic = null;
  rig.setMicLevel(0);
}

async function startListening() {
  noteActivity();
  bubble.hide();
  pill.setCaption('Listening… release to stop (speech-to-text not wired yet)');
  pill.open();
  pill.input.blur();
  if (!store.can('listening')) store.send('idle');
  store.send('listening');
  await startMic();
}

async function stopListening() {
  stopMic();
  pill.setCaption('');
  pill.close();
  if (store.get() !== 'listening') return;
  const token = ++flowToken;
  store.send('thinking');
  await wait(500);
  if (token !== flowToken) return;
  store.send('responding');
  bubble.show(
    'I heard you, but speech-to-text is not wired yet. Hold the hotkey again to watch the ring react to your voice.'
  );
}

// ------------------------------------------------------------------ dismiss
function dismissAll() {
  noteActivity();
  flowToken += 1;
  pill.close();
  pill.setCaption('');
  bubble.hide();
  bubble.hideCard();
  stopMic();
  if (store.get() !== 'idle') store.send('idle');
}

// --------------------------------------------------------------- IPC events
function handleEvent(event) {
  if (!event || !event.type) return;
  switch (event.type) {
    case ANU.EVENTS.HOTKEY:
      openPill();
      break;
    case ANU.EVENTS.PTT_DOWN:
      startListening();
      break;
    case ANU.EVENTS.PTT_UP:
      stopListening();
      break;
    case ANU.EVENTS.AI_STATUS:
      if (event.payload && window.AnuState.STATES.includes(event.payload)) store.send(event.payload);
      break;
    case ANU.EVENTS.DISMISS:
      dismissAll();
      break;
    default:
      break;
  }
}

if (bridge) {
  bridge.onEvent(handleEvent);
  bridge.onCursor((point) => {
    const rect = characterEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rig.setGaze(
      (point.x - cx) / (window.innerWidth / 2),
      (point.y - cy) / (window.innerHeight / 2)
    );
  });
}

// ------------------------------------------------------- click-through gate
const HIT_SELECTOR = '[data-hit]';
let lastInteractive = null;

function updateInteractive(x, y) {
  const el = document.elementFromPoint(x, y);
  const wanted = Boolean(el && el.closest(HIT_SELECTOR));
  if (wanted === lastInteractive) return;
  lastInteractive = wanted;
  if (bridge) bridge.setInteractive(wanted);
}

window.addEventListener('mousemove', (event) => updateInteractive(event.clientX, event.clientY));
window.addEventListener('mouseleave', () => updateInteractive(-1, -1));

document.addEventListener('mousedown', (event) => {
  if (!event.target.closest(HIT_SELECTOR)) dismissAll();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') dismissAll();
});

characterEl.addEventListener('click', (event) => {
  if (bubble.isOpen) {
    event.stopPropagation();
    dismissAll();
    return;
  }
  openPill();
});

// -------------------------------------------------------------------- blink
let blinkTimer = null;
function scheduleBlink() {
  blinkTimer = setTimeout(() => {
    if (!document.hidden && store.get() !== 'sleeping') rig.blink();
    scheduleBlink();
  }, 2600 + Math.random() * 2400);
}

// --------------------------------------------------------------------- boot
noteActivity();
if (shotMode) {
  document.body.classList.add('shot');
  rig.setExpression(shotMode);
} else {
  scheduleBlink();
}

// Developer/test hooks: Playwright drives these, devtools can too.
window.anuDev = {
  state: () => store.get(),
  setState: (state) => store.send(state),
  expression: (name, pose) => rig.setExpression(name, pose),
  ask: (text) => submit(text),
  openPill,
  dismiss: dismissAll,
  showBubble: (text, options) => bubble.show(text, options),
  showCard: (text, options) => bubble.showCard(text, options),
  startListening,
  stopListening,
  rig: () => rig,
};
