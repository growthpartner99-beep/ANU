// Central companion state store. Pure data + events, no DOM, no timers.
(function () {
  const STATES = [
    'idle',
    'summoned',
    'typing',
    'listening',
    'thinking',
    'responding',
    'acting',
    'error',
    'sleeping',
  ];

  // Explicit allowlist. 'idle' (dismiss) is reachable from everywhere by design.
  const TRANSITIONS = {
    idle: ['summoned', 'typing', 'listening', 'sleeping', 'error'],
    summoned: ['typing', 'listening', 'thinking', 'idle', 'error'],
    typing: ['thinking', 'listening', 'summoned', 'idle', 'error'],
    listening: ['thinking', 'typing', 'idle', 'error'],
    thinking: ['responding', 'acting', 'error', 'idle'],
    responding: ['acting', 'thinking', 'idle', 'error'],
    acting: ['responding', 'idle', 'error'],
    error: ['idle', 'summoned', 'typing', 'listening'],
    sleeping: ['summoned', 'typing', 'listening', 'idle'],
  };

  // State -> look. `expression` picks the placeholder art file (one of the six
  // sheet expressions); `pose` overrides it with a full-body crop when present.
  const LOOK = {
    idle: { expression: 'happy', ears: 'rest', rings: 'soft', tail: 'dim' },
    summoned: { expression: 'happy', pose: 'hero', ears: 'up', rings: 'bright', tail: 'dim' },
    typing: { expression: 'happy', ears: 'up', rings: 'bright', tail: 'idle' },
    listening: { expression: 'happy', ears: 'up', rings: 'bright', tail: 'mic' },
    thinking: { expression: 'thinking', ears: 'up', rings: 'mid', tail: 'think' },
    responding: { expression: 'happy', ears: 'up', rings: 'soft', tail: 'bright' },
    acting: { expression: 'excited', ears: 'up', rings: 'bright', tail: 'steady' },
    error: { expression: 'surprised', ears: 'flat', rings: 'red', tail: 'error' },
    sleeping: { expression: 'sleepy', ears: 'rest', rings: 'off', tail: 'dim' },
  };

  function canTransition(from, to) {
    if (!STATES.includes(from) || !STATES.includes(to)) return false;
    if (from === to) return true;
    return (TRANSITIONS[from] || []).includes(to);
  }

  function lookFor(state) {
    return LOOK[state] || LOOK.idle;
  }

  function createAnuState(initial = 'idle') {
    if (!STATES.includes(initial)) throw new Error(`Unknown ANU state: ${initial}`);

    let current = initial;
    const listeners = new Set();

    function send(next) {
      if (!STATES.includes(next)) return false;
      if (!canTransition(current, next)) return false;
      if (next === current) return true;
      const previous = current;
      current = next;
      listeners.forEach((fn) => fn(current, previous, lookFor(current)));
      return true;
    }

    return {
      get: () => current,
      look: () => lookFor(current),
      send,
      can: (to) => canTransition(current, to),
      subscribe(fn) {
        listeners.add(fn);
        fn(current, current, lookFor(current));
        return () => listeners.delete(fn);
      },
    };
  }

  const api = { STATES, TRANSITIONS, LOOK, createAnuState, canTransition, lookFor };

  if (typeof window !== 'undefined') window.AnuState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
