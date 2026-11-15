// THE single place the real AI backend plugs in later.
// Today it is a deterministic stub so the whole UI is testable with no network.
// Replace the body of askAnu() with an IPC call to the main process; keep the
// resolved shape { text, receipt } so the UI does not change.
(function () {
  const SHORT =
    'I am running on canned replies right now. Wire up a model and I will actually answer this.';

  const TWENTY_WORDS =
    'Nice to meet you. I live in the corner of your screen, follow your cursor, ' +
    'and keep quiet until you summon me with the hotkey.';

  const LONG =
    'Here is a longer answer so you can see what happens when a reply outgrows a bubble. ' +
    'Once a reply passes sixty words it stops being something you can read in passing and ' +
    'becomes a small document, so it moves into a card. The card stays on screen until you ' +
    'close it, which means it does not fight the timer that dismisses short bubbles. ' +
    'This is deliberately verbose filler. The real value is in the shell around it: the ' +
    'character keeps its state, the reply keeps its anchored position next to the character, ' +
    'and the exchange is logged to the archive window so you can look it up later without ' +
    'the companion window growing into a chat application again. That separation is the ' +
    'whole point of this prototype: the character is the interface, the archive is the ' +
    'history, and neither one has to pretend to be the other.';

  const CODE =
    'Here is the shape of the function you would replace with a real backend:\n\n' +
    '```js\n' +
    'async function askAnu(text) {\n' +
    '  const reply = await window.anu.ask(text); // real backend goes here\n' +
    '  return { text: reply.text, receipt: reply.receipt };\n' +
    '}\n' +
    '```\n\n' +
    'Everything else in the UI already accepts that shape.';

  const ACTING = 'Opening Spotify. This is a stub action, so nothing actually launched.';

  function pickReply(text) {
    const t = String(text || '').toLowerCase();
    if (/\b(spotify|open|launch|play)\b/.test(t)) {
      return { text: ACTING, receipt: 'opened Spotify', acting: true };
    }
    if (/\b(code|snippet|function|script|example)\b/.test(t)) return { text: CODE };
    if (/\b(long|detail|explain|plan|essay|80)\b/.test(t)) return { text: LONG };
    if (/\b(hi|hello|hey|morning|evening)\b/.test(t)) {
      return { text: "Hi! I'm ANU. Try the hotkey, or ask me for code, a long answer, or Spotify." };
    }
    if (/\?\s*$/.test(t)) return { text: TWENTY_WORDS };
    if (/\b(mic|voice|listen)\b/.test(t)) {
      return { text: 'Hold the hotkey to talk. Speech recognition is not wired yet.' };
    }
    return { text: SHORT };
  }

  function askAnu(text) {
    const reply = pickReply(text);
    const delay = 350 + (String(text || '').length % 5) * 120;
    return new Promise((resolve) => {
      setTimeout(() => resolve(reply), delay);
    });
  }

  if (typeof window !== 'undefined') window.askAnu = askAnu;
  if (typeof module !== 'undefined' && module.exports) module.exports = { askAnu, pickReply };
})();
