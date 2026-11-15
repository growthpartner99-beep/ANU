// Pure text rules used by the bubble: when a reply becomes a card, and how long
// a bubble lives. Kept DOM-free so it can be unit tested from node.
(function () {
  const LONG_WORDS = 60;

  function wordCount(text) {
    return (String(text || '').trim().match(/\S+/g) || []).length;
  }

  function needsCard(text) {
    const t = String(text || '');
    if (wordCount(t) > LONG_WORDS) return true;
    if (/```/.test(t)) return true; // fenced code
    if (/^[ \t]*([-*+]|\d+\.)[ \t]+\S/m.test(t)) return true; // list
    if (/^[ \t]*\|.*\|[ \t]*$/m.test(t)) return true; // table
    return false;
  }

  // 2s + words/3 seconds, capped at 20s.
  function bubbleLifetimeMs(text) {
    return Math.min(20000, 2000 + Math.round((wordCount(text) / 3) * 1000));
  }

  const api = { LONG_WORDS, wordCount, needsCard, bubbleLifetimeMs };

  if (typeof window !== 'undefined') window.AnuText = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
