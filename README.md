# ANU

ANU is a **Windows desktop AI companion**: a small cartoon character that
floats in the bottom-right corner of your screen and, over time, will be able
to talk with you, understand what is happening on your computer, and help
accomplish tasks.

ANU is **not a website**. It is a local Electron desktop application.

> **Stage: character-tethered UI, placeholder art.**
> The window, the state machine and the whole summon → type → reply → archive loop
> exist and are tested. The character is cropped from a design sheet and the replies
> are canned — see `docs/NEXT.md` for what is real and what is placeholder.

## Implemented

- Transparent, frameless, click-through Electron window (520×640), always on top,
  anchored bottom-right above the taskbar
- Character-tethered UI: the character is the interface. A `Ctrl+Alt+Space` tap opens
  a small input pill under it; a hold turns the same key into push-to-talk
- Nine-state machine (`idle`, `summoned`, `typing`, `listening`, `thinking`,
  `responding`, `acting`, `error`, `sleeping`) with an explicit transition allowlist;
  every visual is derived from the state
- Replies stream into a bubble above the character (2 s + words/3, max 20 s, click to
  pin); anything over 60 words or with code/lists/tables becomes a dismissible card
- Action receipts (`opened Spotify`) under the reply
- Tray menu with an **Archive** window that reads/appends `archive.jsonl`; it never
  opens by itself
- Placeholder rig: six expression crops crossfaded per state, gaze as a CSS tilt,
  blink as a fast crossfade to the sleepy expression
- Mic level from a Web Audio analyser while push-to-talk is held (no transcription)
- `npm test` — unit tests over the state machine and reply rules

## Planned (NOT implemented yet)

- Hand-cut layered art (`assets/parts/`) so eyes, eyelids and mouth can animate
- Speech recognition and speech output
- Screen perception / vision and a pointing overlay
- Mouse and keyboard control, behind a permission gate
- A real model behind `askAnu` (see the seam in `src/services/askAnu.js`)
- Autostart and a packaged installer

None of the above exist yet — do not expect them from `npm start`.

## Getting started

Requirements: Windows, Node.js (v24 tested), npm.

```powershell
npm install   # installs Electron
npm start     # launches ANU
```

Press **F12** in the ANU window for devtools. Close it via its taskbar entry.

## Project structure

```text
ANU/
├── src/
│   ├── main/                 # Electron main process (Node)
│   │   ├── main.js           # lifecycle, hotkey, tray, archive store, IPC
│   │   ├── window.js         # the companion window + the archive window
│   │   ├── preload.js        # bridge for the companion window
│   │   └── archive-preload.js# bridge for the archive window
│   ├── renderer/             # page shell loaded in the window
│   │   ├── index.html        # stage markup, loads the scripts below
│   │   └── styles/main.css   # base styles (transparent body, palette vars)
│   ├── ui/                   # what the user sees
│   │   ├── app.js            # wires state, rig, pill, bubble, IPC
│   │   ├── ui.css            # stage layout: character, bubble, card, status light
│   │   ├── pill/             # input pill (tap-summoned)
│   │   ├── bubble/           # streaming reply bubble, card mode, receipts
│   │   └── archive/          # archive window page
│   ├── state/                # anuState.js — states, transitions, LOOK map
│   ├── rig/                  # rig.js — placeholder rig, layered rig interface
│   ├── services/             # askAnu.js — the one seam a real model plugs into
│   └── shared/               # constants + text rules used by both processes
├── assets/
│   ├── ref/                  # ANU_sheet.png — the design sheet, never modified
│   ├── states/               # placeholder expression/hero/front crops
│   ├── parts/                # hand-cut layers go here (empty)
│   └── icons/                # tray icon
├── config/anu.json           # runtime config (hotkey)
├── docs/                     # ART_TODO.md, NEXT.md, architecture research
├── scripts/                  # art slicer, screenshot harness (python/node)
├── tests/                    # node --test unit tests
├── package.json
└── README.md
```

`src/renderer/character/` and `src/renderer/input/` hold the previous CSS/Rive
prototype's modules. They are no longer loaded by `index.html`.

## Development principles

1. **Incremental.** One capability at a time, verified before moving on.
2. **Main vs. renderer separation.** Main-process code (window, OS, future
   system access) lives in `src/main/`; window/UI code lives in `src/renderer/`.
   They talk only through the preload bridge (`window.anu`).
3. **Modular character.** Eyes, mouth, and coordination are separate files so
   they can be replaced without touching the rest.
4. **No framework (yet).** Plain Electron + HTML/CSS/JS. React/Vite/TypeScript
   are deliberately not used at this stage.
5. **Minimal dependencies.** Only Electron is added, and only when a capability
   truly needs it.
6. **No secrets in the repo.** Keys and tokens belong in `.env` (git-ignored).

## Verification

After any change: `npm test` for the unit tests, then `npm start` and check the
things the tests cannot see — the character appears bottom-right and stays on top,
`Ctrl+Alt+Space` opens the pill, Enter produces a reply, Esc dismisses it, and the
tray menu still opens the archive. `docs/NEXT.md` lists what is placeholder.
