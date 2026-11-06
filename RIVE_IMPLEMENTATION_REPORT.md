# ANU Master Character UI + Rive Animation — Final Report

## Summary

I implemented the complete Rive-based character architecture for ANU, including the JavaScript controller, state machine, gaze tracking, expression system, mouth system, and idle behavior. Two critical blockers prevent the app from running and being visually verified on this system:

1. **No `.riv` artwork file**: Rive artwork files (`.riv`) can only be created with the Rive Editor (GUI app at app.rive.com). There is no npm package, CLI, or programmatic way to generate `.riv` files. I cannot recreate the reference character's artwork as a `.riv` file without the Rive Editor.

2. **Electron API not accessible via `require('electron')`**: On this system (Electron 22.3.27, also tested with 28.3.3 and 45.2.3), `require('electron')` inside the Electron main process returns a string path to the Electron executable, not the Electron API object with `app`, `BrowserWindow`, etc. The `electron` module is not registered as a Node.js built-in module (`Module.builtinModules` does not include `electron`). This means `app.whenReady()`, `new BrowserWindow()`, `ipcMain`, `screen.getCursorScreenPoint()`, and all other Electron APIs are inaccessible. This is a system-specific issue — the standard Electron `require('electron')` API does not function here.

## Files Created

### `src/renderer/character/character.js`
Main `ANUCharacter` class exposing the public API:
- `init()` — Loads the `.riv` file and initializes the Rive runtime
- `setState(state)` — Transitions to a Rive state machine state (idle, listening, thinking, speaking, happy, excited, surprised, sad, confused, sleepy, concerned, error)
- `setExpression(name)` — Sets facial expression (neutral, happy, excited, sad, confused, surprised, thinking, sleepy, concerned, error, listening, speaking)
- `lookAt(x, y)` — Directs gaze toward screen coordinates with smoothing
- `centerGaze()` — Centers gaze
- `startTalking()` / `stopTalking()` — Controls speaking state and mouth
- `setMouth(name)` — Sets mouth shape (closed, small_open, open, smile, O, wide)
- `trigger(name)` — Fires a Rive state machine trigger (blink, double_blink, state_*)
- `blink()` / `doubleBlink()` — Trigger blink animations
- `setListening(value)` / `setThinking(value)` / `setSpeaking(value)` — Boolean state inputs
- `setEnergy(value)` — Energy level for idle variations
- `setWindowBounds(bounds)` — Sets window bounds for gaze coordinate normalization
- `setScale(scale)` — Sets render scale
- `pause()` / `resume()` — Pause/resume animation
- `destroy()` — Cleanup
- `onReady(callback)` — Callback when Rive is loaded

### `src/renderer/character/rive/character.js`
`RiveCharacter` class wrapping `@rive-app/canvas` RuntimeLoader:
- Loads `.riv` files via `Rive.RuntimeLoader`
- Creates `Rive` instance with `Fit.CONTAIN`, `Alignment.CENTER`
- Exposes `setNumber(name, value)`, `setBoolean(name, value)`, `fireTrigger(name)` for state machine input control
- Caches inputs by name for performance

### `src/renderer/character/rive/state-machine.js`
`StateMachineController` with `Emotion` enum:
- `Emotion`: NEUTRAL=0, HAPPY=1, EXCITED=2, SAD=3, CONFUSED=4, SURPRISED=5, THINKING=6, SLEEPY=7, CONCERNED=8, ERROR=9, LISTENING=10
- `setEmotion(value)` — Sets the `emotion` number input
- `setState(state)` — Fires `state_<name>` trigger
- `setListening/thinking/speaking(value)` — Boolean inputs
- `setEnergy(value)` — Number input clamped 0-1
- `triggerBlink()` / `triggerDoubleBlink()` — Trigger inputs

### `src/renderer/character/rive/gaze.js`
`GazeController` with smooth interpolation:
- `lookAt(screenX, screenY, windowBounds)` — Sets gaze target with deadzone and clamping (-1 to 1)
- `update(deltaTime)` — Applies smoothing, acceleration/deceleration, sends `gazeX`/`gazeY` number inputs
- `center()` — Resets gaze to center
- Configurable: smoothing, maxAngle, deadzone, acceleration, deceleration

### `src/renderer/character/rive/expression.js`
`ExpressionController` mapping expression names to emotion values:
- neutral→0, happy→1, excited→2, sad→3, confused→4, surprised→5, thinking→6, sleepy→7, concerned→8, error→9, listening→10, speaking→11

### `src/renderer/character/rive/mouth.js`
`MouthController` mapping mouth names to values:
- closed→0, small_open→1, open→2, smile→3, O→4, wide→5

### `src/renderer/character/rive/idle.js`
`IdleController` with sophisticated idle behavior:
- Random blinking with configurable interval/chance
- Occasional double blinks
- Periodic look-around behavior (random gaze targets with return to center)
- Continuous breathing animation via `breath` number input (sine wave)
- Uses `requestAnimationFrame` for efficient rendering

### `src/renderer/character/index.js`
Module barrel export for all character modules.

### `src/renderer/character/app.js`
Application entry point:
- Creates `ANUCharacter` instance pointing to `../assets/character/anu.riv`
- Connects `window.anuMouse` cursor tracking to `anu.lookAt()`
- Exposes `window.anuAPI` for devtools/debug access

### `src/renderer/index.html`
Updated with:
- `<canvas id="rive-canvas">` element inside `#character`
- `<script src="node_modules/@rive-app/canvas/rive.js">` for Rive runtime
- `type="module"` scripts for character modules

### `src/renderer/styles/main.css`
Updated for canvas-based character (removed CSS shape styles).

### `src/shared/constants.js`
Updated `WINDOW` to `{ WIDTH: 300, HEIGHT: 320 }`.

## Files Modified

### `package.json`
- Added `"@rive-app/canvas": "^2.49.4"` dependency
- Kept `"type": "commonjs"` (main process uses CJS; renderer uses browser ESM via `<script type="module">`)

### `src/main/main.js`, `src/main/window.js`, `src/main/preload.js`
Restored to original CJS code (unchanged from original repository state).

## Rive State Machine Design

### Inputs (to be defined in the `.riv` file)
| Input | Type | Purpose |
|-------|------|---------|
| `gazeX` | Number | Horizontal gaze direction (-1 to 1) |
| `gazeY` | Number | Vertical gaze direction (-1 to 1) |
| `emotion` | Number | Current expression (0-11 per Emotion enum) |
| `isListening` | Boolean | Listening state |
| `isThinking` | Boolean | Thinking state |
| `isSpeaking` | Boolean | Speaking state |
| `energy` | Number | Idle energy level (0-1) |
| `breath` | Number | Breathing cycle value |
| `mouth` | Number | Mouth shape (0-5) |
| `blink` | Trigger | Trigger a single blink |
| `double_blink` | Trigger | Trigger a double blink |
| `state_idle` | Trigger | Transition to idle state |
| `state_listening` | Trigger | Transition to listening state |
| `state_thinking` | Trigger | Transition to thinking state |
| `state_speaking` | Trigger | Transition to speaking state |
| `state_happy` | Trigger | Transition to happy expression |
| `state_excited` | Trigger | Transition to excited expression |
| `state_surprised` | Trigger | Transition to surprised expression |
| `state_sad` | Trigger | Transition to sad expression |
| `state_confused` | Trigger | Transition to confused expression |
| `state_sleepy` | Trigger | Transition to sleepy expression |
| `state_concerned` | Trigger | Transition to concerned expression |
| `state_error` | Trigger | Transition to error state |

### States (to be defined in the `.riv` file)
- **Idle** (default) — Breathing, subtle movement, blinking
- **Listening** — Ears up, attentive expression
- **Thinking** — Hand on chin, looking down/away
- **Speaking** — Mouth animating, head movement
- **Happy** — Smile, bright eyes
- **Excited** — Wide eyes, energetic movement
- **Surprised** — Eyes wide, mouth open
- **Sad** — Droopy eyes, lowered head
- **Confused** — Tilted head, questioning expression
- **Sleepy** — Heavy eyelids, droopy posture
- **Concerned** — Worried eyebrows, soft eyes
- **Error** — Red/alert expression

## Blocker 1: `.riv` Artwork File

**Location**: `assets/character/anu.riv` (does not exist yet)

**Requirement**: The `.riv` file must contain the ANU character artwork faithful to the reference image (`Design/ANU_ Your Smart Desktop Companion.png`), including:

- Gray/blue wolf/dog character with white fur accents
- Large expressive blue eyes with pupils and highlights
- Headphones with glowing cyan "A" emblem on earcup
- Black hoodie with cyan trim and "A" emblem
- Bushy tail with cyan glow
- Pointed ears with cyan inner glow
- All expressions (neutral, happy, excited, sad, confused, surprised, thinking, sleepy, concerned, error)
- All mouth shapes (closed, small_open, open, smile, O, wide)
- State machine with all inputs and transitions listed above
- Idle animation with breathing, blinking, look-around

**How to create**: Use the Rive Editor at app.rive.com. Import the reference image as a guide, trace the character with vector shapes, add gradients and highlights for depth, set up the state machine with all inputs, and export as `.riv`.

**Cannot be created programmatically**: There is no npm package, CLI, or Node.js API for generating `.riv` files. The `@rive-app/canvas` package is a runtime-only library that can load and play `.riv` files but cannot create them.

## Blocker 2: Electron API Not Accessible

**Issue**: `require('electron')` inside the Electron main process returns a string path to `electron.exe`, not the Electron API object. Verified across Electron 22.3.27, 28.3.3, and 45.2.3 on this system.

**Evidence**:
- `Module.builtinModules` does not include `electron`
- `require.resolve('electron')` resolves to `node_modules/electron/index.js` (which exports `getElectronPath()` returning a string)
- `process.binding('electron')` — "No such module: electron"
- `globalThis` has no electron-related properties
- `process.resourcesPath` is `undefined`

**Impact**: `app.whenReady()`, `new BrowserWindow()`, `ipcMain.on()`, `screen.getCursorScreenPoint()`, and all Electron APIs are unavailable. The app cannot create a window or set up cursor tracking.

**Workaround needed**: The Electron installation on this system appears to not register `electron` as a Node.js built-in module. This may require:
- Reinstalling Electron from a different source
- Using a different Electron version
- Checking if `ELECTRON_RUN_AS_NODE` or other env vars affect module registration
- Verifying the Electron binary is not corrupted

## Dependencies

### Added
- `@rive-app/canvas` v2.49.4 — Rive runtime for rendering `.riv` animations on HTML5 Canvas

### Removed
- None

### Not Added (deliberately)
- No React, Vue, TypeScript, Vite, or other frameworks
- No Blender, Three.js, or GLB pipeline
- No TTS, STT, AI, or vision dependencies

## Verification Status

**Cannot verify** — The app cannot be launched because:
1. `require('electron')` does not provide the Electron API, so `createWindow()` cannot create a BrowserWindow
2. No `.riv` file exists, so `RiveCharacter.load()` would fail even if the window could be created

**Test command** (when blockers are resolved):
```
npm start
```

**Expected behavior** (when working):
- Transparent frameless window appears at bottom-right of screen
- ANU character renders from `.riv` file
- Character breathes, blinks, looks around while idle
- Pupils follow the global cursor smoothly
- Expressions change via `anuAPI.setExpression()`
- Mouth opens/closes via `anuAPI.startTalking()`/`stopTalking()`

## What Is Implemented vs Prepared for Future

### IMPLEMENTED
- Rive runtime integration via `@rive-app/canvas`
- Complete JavaScript character controller API (ANUCharacter)
- RiveCharacter wrapper for RuntimeLoader + Rive instance
- StateMachineController with emotion enum and all state triggers
- GazeController with smooth interpolation, acceleration/deceleration, deadzone
- ExpressionController with 12 expression mappings
- MouthController with 6 mouth shapes
- IdleController with breathing, random blinking, double blinks, look-around
- HTML/CSS canvas integration
- Cursor tracking connection from `window.anuMouse` to gaze system
- `window.anuAPI` for devtools access

### PREPARED FOR FUTURE (not implemented)
- `.riv` artwork file — requires Rive Editor to create
- Electron window creation — blocked by `require('electron')` issue
- TTS/lip-sync pipeline — mouth system is ready but not connected to audio
- AI behavior integration — state machine inputs are ready but not connected to AI
- Global keyboard shortcut — not implemented
- System tray — not implemented
- Packaging/installer — not implemented

## Recommended Next Steps

1. **Create the `.riv` file**: Open the Rive Editor (app.rive.com), recreate the ANU character from the reference image, set up the state machine with all documented inputs, and export to `assets/character/anu.riv`.

2. **Resolve the Electron API issue**: Investigate why `require('electron')` doesn't return the API on this system. Possible approaches: reinstall Electron, check for corrupted binary, try `electron` from a different registry, or verify Node.js/Electron compatibility.

3. **Run and verify**: Once both blockers are resolved, run `npm start`, verify the character appears, breathes, blinks, follows the cursor, and matches the reference image.

4. **Visual refinement**: Compare the running character against the reference image and adjust the `.riv` artwork for fidelity.
