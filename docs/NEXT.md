# NEXT — what is real, what is placeholder, what comes after

State of the character-tethered UI after phases 0–4. Read this before touching the
rig or the renderer.

## What is real (works today)

- One fixed transparent window, 520×640, always on top, bottom-right, click-through
  except over the character, bubble, card and pill.
- A nine-state machine (`src/state/anuState.js`) with an explicit transition
  allowlist: `idle`, `summoned`, `typing`, `listening`, `thinking`, `responding`,
  `acting`, `error`, `sleeping`. Every visual (expression, ears, ring brightness,
  status light) is derived from the state, not set ad hoc by the UI.
- Summon: hold-free tap of the global hotkey opens the input pill and focuses it.
  Default `Ctrl+Alt+Space`, overridable in `config/anu.json`; a hotkey that cannot be
  parsed or is already taken is reported in the status light and the app keeps
  running.
- Push-to-talk: hold the same hotkey → `listening` with a live mic level driving the
  status ring and a `--mic` CSS variable. Release → `thinking` → placeholder caption.
  The hook is `uiohook-napi`, so one physical key does both tap and hold without a
  double trigger.
- Replies: streaming text into a bubble anchored above the character, lifetime
  `2s + words/3`, capped at 20 s, click to pin. Anything over 60 words or containing
  a code block, list or table becomes a dismissible card instead. Action receipts
  (`opened Spotify`) render under the reply.
- Archive: a second window opened from the tray menu only. It reads and appends
  `archive.jsonl` in the app's userData folder. It never opens by itself.
- `npm test` — 8 unit tests over the state machine, lifetime rule, card rule and the
  stub replies. Playwright drives the live app end to end (20 checks).

## What is placeholder

| Area | Placeholder | Consequence |
|---|---|---|
| Character art | Six expression busts + hero + front cropped from `assets/ref/ANU_sheet.png`; see `docs/ART_TODO.md` | No separate parts, so nothing body-level can be animated |
| Gaze | Cursor following is a CSS `transform` tilt of the whole bust | The pupils do not move relative to the eyes |
| Blink | A fast crossfade to `sleepy.png` | Eyelids are not animated; the whole head changes |
| Mouth | Nothing — the mouth comes from the expression image | No lipsync; speech shows as expression changes only |
| Ears | `data-ears` attribute on the stage, no art reacts to it | "Ears up" is not visible yet |
| Status ring | `.status-light` is hidden (`display: none` in `ui.css`) | No tail in the flat art, so the ring floated beside the bust; state shows through the expression only |
| Voice input | Web Audio RMS → `--mic`; no transcription | Push-to-talk records nothing; the caption is canned |
| Reply text | `src/services/askAnu.js` returns fixed strings | No model, no network, no memory |
| Archive | Plain JSONL, no search, no delete | Grows forever |

`hero.png` is used only for `summoned`, where it is a different pose of the same
character at a different framing, so the swap can read as a small scale jump. That is
the art, not a bug.

## The one seam to keep

`askAnu(text)` in `src/services/askAnu.js` resolves `{ text, receipt? }`. Replace its
body with a real call; the UI, the card rule, the log and the bubble lifetime all key
off the resolved shape, so nothing else has to change.

## Hand-cut art (the unlock for everything above)

`assets/parts/` is where the hand-cut layers go — the full list is in
`docs/ART_TODO.md`. Three layers buy the most: `eye-L`/`eye-R`/`iris highlights`
(pupil gaze), `eyelids` (real blinks), and `mouth-*` (lipsync). They must share the
expression canvas and the head anchor so they composite without per-frame offsets.

## Next steps, in the order that pays off

1. **Pointing overlay.** A full-screen transparent window that highlights a target
   the model asks about, so "this button" is visible. Keep it a separate window; do
   not grow the companion window.
2. **Voice recognition.** Swap the mic level for a streaming transcriber; the
   `listening → thinking` transition and the caption already exist. Keep push-to-talk
   semantics: nobody wants an always-open mic.
3. **Gemini hookup.** Implement `askAnu` over IPC to the main process, keep the key
   in the main process only, stream chunks into `bubble.show` so the typewriter keeps
   working, and return a `receipt` for anything that changed the user's machine.
4. **Permission gate for acting.** `acting` exists as a state but nothing acts. When
   tools land, every consequential call needs an explicit confirm on the bubble.
5. **Archive polish.** Search, delete, and a "forget this" action — needed as soon as
   a real model answers.

## Known rough edges

- The window is click-through by default, so a click on a *closed* bubble area hits
  the app underneath — intended, but it means hover cannot be used as a trigger.
- The hotkey fallback (`globalShortcut`) is only used when the hook fails or the
  configured hotkey is not the default; in that mode there is no hold-to-talk.
- `thinking.png` carries a few pixels of shoulder contour below the chin (connected
  in the source art, so the island filter cannot drop it).
- The busts end where the design sheet's label chip covered the body. The last fifth
  is alpha-faded so it dissolves instead of ending in a line; it is not real art.
