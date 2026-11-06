# ANU

ANU is a **Windows desktop AI companion**: a small cartoon character that
floats in the bottom-right corner of your screen and, over time, will be able
to talk with you, understand what is happening on your computer, and help
accomplish tasks.

ANU is **not a website**. It is a local Electron desktop application.

> **Stage: architecture + visual prototype.**
> The project is being built incrementally — every capability is implemented
> and tested before the next one starts. Right now only the floating window
> and the character prototype exist.

## Implemented

- Transparent, frameless Electron window (150×160) with no title bar
- Always-on-top, anchored to the bottom-right of the screen (above the taskbar)
- CSS cartoon character prototype (head, torso, eyes, mouth)
- Idle bobbing animation
- Automatic blinking
- Pupils follow the mouse cursor (cursor position is pushed from the main
  process, so it works across the whole screen)
- Talking-mouth animation with a startup demo, plus `startTalking()` /
  `stopTalking()` hooks callable from devtools
- F12 toggles devtools (frameless window has no menu)

## Planned (NOT implemented yet)

- Typed text input
- Speech input (listening)
- Speech output (speaking back)
- Screen perception / vision
- Mouse and keyboard control
- AI reasoning system that works toward goals
- Background operation with a global keyboard shortcut
- Tray icon, autostart, packaged installer

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
│   │   ├── main.js           # entry point: app lifecycle
│   │   ├── window.js         # creates the floating window, pushes cursor
│   │   └── preload.js        # safe bridge between main and renderer
│   ├── renderer/             # code that runs in the window (browser side)
│   │   ├── index.html        # page shell
│   │   ├── styles/main.css   # all styles (kept out of JS)
│   │   ├── character/        # character modules
│   │   │   ├── character.js  # coordinator / startup behavior
│   │   │   ├── eyes.js       # pupil tracking + blinking
│   │   │   └── mouth.js      # talking animation hooks
│   │   └── input/
│   │       └── mouse.js      # receives cursor position from main
│   └── shared/
│       └── constants.js      # values used by both processes
├── assets/                   # character/audio/icon files (reserved)
├── config/                   # future runtime configuration (reserved)
├── scripts/                  # future build/release scripts (reserved)
├── tests/                    # future automated tests (reserved)
├── package.json
├── .gitignore
├── README.md
├── AGENTS.md / CLAUDE.md       # coding-agent instructions
├── PLAN.md                     # product & development plan (living document)
└── CLOUD.md                    # cloud AI workflow notes
```

Each reserved folder contains a short README explaining its purpose.

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

After any refactor: run `npm start` and confirm the transparent character
still appears bottom-right, stays always-on-top, blinks, and its pupils follow
the cursor with no console errors.
