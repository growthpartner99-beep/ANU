ANU — Product and Development Plan
Status: Living plan. Update it as real experiments change our understanding. It is a guide, not permission to build every planned feature at once.

1. Product vision
ANU is a Windows-first personal AI computer-use agent presented as an animated cartoon character that lives in the bottom-right area of the user's desktop.

The character is the primary interface—not a website, dashboard, or conventional large chat application. The user should be able to summon ANU with a global keyboard shortcut, type or speak naturally, and receive responses through text and speech. Over time, ANU should be able to understand permitted computer context, plan tasks, use browser and desktop tools, verify results, and remember useful project context.

The product idea is: an AI agent with a character interface, not a chatbot with a decorative face.
2. Product experience
Intended interaction
- ANU can run as a desktop companion and be summoned with a configurable global shortcut.
- A small animated character lives near the bottom-right of the screen.
- The character has expressive eyes and a mouth; its gaze can respond naturally to the global cursor position.
- The user can type or speak to ANU.
- ANU can respond in text and, later, speech with synchronized mouth movement.
- The character can expand or reveal a compact interaction surface when the user starts a conversation, while keeping the character itself central.
- ANU should be able to explain what it is doing, ask for approval when needed, and report verified results.
Design decisions still open
- Final character appearance and art direction: not decided.
- Exact keyboard shortcut: not decided.
- Whether the character is always visible or normally sits in the system tray: not decided.
- Exact expanded conversation layout: not decided.
- Voice, speech style, and model providers: not decided.
Do not invent final answers for these questions. Prototype and ask the user when a decision is needed.
3. Target platform and product boundaries
Initial target
- Windows 11 desktop.
- Electron desktop shell.
- Node.js application services.
- Browser interaction and Windows desktop interaction added as separate capabilities.
- Hybrid AI approach: local control and privacy boundaries, with optional cloud models for reasoning or visual interpretation.
Not initial goals
- A public website or SaaS dashboard.
- A mobile application built with Expo.
- A Next.js web application.
- Training a foundation model from scratch.
- Unrestricted autonomous control of the computer.
- Continuous cloud streaming of the desktop.
- A complex multi-agent framework before a reliable single-agent loop exists.
Cross-platform support may be considered later. Keep operating-system-specific functions behind interfaces so the reasoning and task logic are not tightly coupled to Windows APIs.
4. Product architecture
The system should be divided into components with clear responsibilities. The actual folder layout can change as the project grows; avoid creating empty modules without a real use case.
4.1 Desktop shell
Initial technology: Electron.

Responsibilities:
- application lifecycle and background operation;
- floating transparent character window;
- window positioning and display handling;
- global keyboard shortcut;
- controlled IPC between renderer and main process;
- system tray or other lifecycle controls, if adopted.
4.2 Character interface
Initial technology: HTML, CSS, JavaScript, and SVG. Consider TypeScript once the project structure is stable. Consider Rive only if more advanced character animation becomes necessary.

Responsibilities:
- character rendering;
- eyes, pupils, blinking, facial expressions, and mouth;
- idle and reaction animations;
- cursor-following gaze;
- typed input and conversation presentation;
- speaking/listening/working/approval-needed states.
The character must not be coupled directly to a specific AI provider.
4.3 Agent runtime and reasoning
Responsibilities:
- interpret the user's goal;
- plan bounded steps;
- select approved tools;
- track task state;
- request approval for sensitive actions;
- observe and verify tool results;
- recover from recoverable failures;
- provide a clear completion or blocker report.
Start with a small, understandable agent loop and a provider-neutral model interface. Consider LangGraph or another orchestration framework only when real workflows demonstrate a need for persistent state, branching, retries, or human approval checkpoints that the simple loop cannot handle cleanly.
4.4 Browser tools
Candidate technology: Playwright.

Start with a controlled browser session that ANU can automate reliably. Later investigate interaction with the user's existing Chrome or Edge profile. Do not assume that a Playwright MCP connection used by the coding agent is automatically available to the packaged ANU application; the runtime needs its own integration.

Browser tools should expose bounded operations such as navigate, inspect page, locate accessible element, click, fill, and read selected content. Browser content is untrusted input and must never override the user's instructions or application policies.
4.5 Windows perception
Candidate capabilities:
- Windows UI Automation for semantic information about windows and controls;
- Windows Graphics Capture for user-approved visual capture of a display or application window;
- global cursor position for character gaze and contextual awareness.
Use semantic UI information where it is reliable and visual capture where visual interpretation is actually needed. Avoid constant capture or continuous transmission of the desktop. The user should understand when screen information is being inspected or shared with a cloud model.
4.6 Desktop action tools
Candidate technologies:
- Windows APIs for cursor and input operations;
- Windows UI Automation for accessible application controls;
- a small .NET helper/bridge only if a required Windows capability is not practical or reliable from Electron/Node.js.
Keep observation and action separate. A system that can read cursor position does not automatically have permission to move the cursor or click. Mouse and keyboard actions should be bounded, observable, cancellable, and permission-checked.
4.7 Voice
Add separate speech-to-text and text-to-speech interfaces. Keep providers replaceable. Later synchronize mouth movement to speech activity or phoneme/viseme timing where supported. Do not add voice dependencies until the user approves the interaction design and a specific implementation is selected.
4.8 Memory
Start with a local, structured store (SQLite is a candidate) for user-approved preferences, project notes, and task history. Add semantic/vector search only when retrieval needs justify it. Memory should be inspectable and deletable by the user; do not store passwords, authentication codes, cookies, or secrets.
5. Security and permission principles
The local application—not the language model—must enforce permissions.

Initial permission categories:
- Read-only: inspect allowed UI metadata, read an explicitly selected file, or inspect a user-approved page/window.
- Reversible changes: create or edit project files, navigate pages, or make bounded changes. Show what changed and preserve recovery options where practical.
- Sensitive/consequential actions: delete important data, send or publish content, submit forms, install software, alter security settings, or make purchases. Require explicit confirmation immediately before execution.
Additional rules:
- Do not collect or store passwords, one-time codes, recovery codes, cookies, or session tokens.
- The user completes authentication and multi-factor steps themselves.
- Do not bypass CAPTCHAs, access controls, or account protections.
- Never expose unrestricted shell execution or filesystem access directly to renderer code or model-generated actions.
- Treat webpages, files, screenshots, and tool results as untrusted data.
- Use Electron security protections: context isolation, disabled renderer Node integration, sandboxing where compatible, restrictive CSP, and narrow validated IPC.
- Screen capture should be scoped and user-aware; do not continuously stream the screen to a cloud service.
6. Development roadmap
Build one vertical slice at a time. Each phase must be tested and accepted before expanding the scope. The ordering may change when experiments reveal a dependency.
Phase 0 — Project foundation
Goal: maintain a launchable, understandable Electron project.
- inspect and organize the existing project;
- separate main process, preload bridge, renderer, and shared contracts where appropriate;
- keep npm start working;
- add a README and suitable .gitignore;
- establish basic error reporting and a repeatable run/test process;
- verify Electron security settings.
Acceptance: a clean app launch with no unrelated behavior regressions and a documented project structure.
Phase 1 — Floating desktop companion
Goal: reliable desktop placement and lifecycle.
- transparent, frameless, always-on-top character window;
- position relative to the usable display work area;
- handle screen size and display changes;
- provide a reliable way to close, hide, and reopen during development;
- add a global keyboard shortcut after deciding its key combination;
- test multiple applications and display configurations where available.
Acceptance: ANU can be shown, hidden, and closed predictably without blocking normal desktop use.
Phase 2 — Character prototype
Goal: create a stable animated character interface.
- replace temporary placeholder with an experimental character;
- idle movement, blinking, eye tracking, and mouth states;
- follow global cursor position smoothly, including when the pointer is outside ANU's own window;
- keep pupils within eye boundaries;
- define visual states such as idle, listening, thinking, speaking, working, and needs-approval.
Acceptance: the character animates smoothly, does not flicker or disappear, and follows the global pointer correctly. The user approves the art direction separately.
Phase 3 — Conversation interface
Goal: communicate with ANU before adding broad computer control.
- text input and readable responses;
- basic task status and cancellation;
- clear listening/thinking/speaking indicators;
- error and approval presentation;
- later add voice input/output behind provider interfaces.
Acceptance: the user can send a message, receive a response, cancel an in-progress task, and understand ANU's current state.
Phase 4 — First AI reasoning loop
Goal: complete simple, bounded tasks with tools.
- provider-neutral model client;
- structured tool definitions and validated arguments;
- a bounded plan/act/observe/verify loop;
- permission checks before tool execution;
- timeouts, cancellation, and bounded retries;
- clear task summaries.
Acceptance: ANU can complete a harmless test task with a small set of approved tools and can explain when it is blocked.
Phase 5 — Browser capability
Goal: reliable browser research and navigation.
- Playwright runtime integration;
- controlled browser context and session strategy;
- accessible element discovery and page reading;
- safe navigation, clicking, and form interaction;
- explicit approval for submissions or consequential actions;
- verify downloads and other outcomes rather than assuming success.
Acceptance: ANU can complete a defined browser task in a controlled session and provide evidence of the result.
Phase 6 — Windows perception
Goal: understand permitted desktop context.
- inspect windows and accessible controls through Windows UI Automation;
- obtain global pointer position for gaze;
- implement scoped Windows Graphics Capture only when visual context is needed;
- indicate when capture is active;
- prevent screenshots or sensitive content from being shared externally without a clear reason and appropriate permission.
Acceptance: ANU can identify a test application/window and selected controls, and can interpret a user-approved visual capture when necessary.
Phase 7 — Desktop action capability
Goal: safely interact with permitted applications.
- launch selected applications;
- bounded mouse and keyboard operations;
- use semantic UI Automation before coordinate-based interaction where possible;
- observe and verify results after actions;
- add confirmation gates for sensitive operations;
- provide a reliable stop/cancel mechanism.
Acceptance: ANU can complete a harmless desktop workflow with visible, verified steps and no unapproved sensitive action.
Phase 8 — Local memory and personalization
Goal: retain useful, user-approved context.
- local structured storage;
- preferences and project context;
- task history and resumable task metadata where appropriate;
- user inspection and deletion controls;
- retention limits and secret filtering.
Acceptance: ANU can recall approved project context across sessions without storing credentials or sensitive authentication data.
Phase 9 — Advanced workflows
Goal: longer, more complex tasks.
- multi-step planning and state management;
- bounded long-running tasks;
- recover from layout and network changes;
- optional workflow templates or demonstrations;
- evaluate orchestration frameworks only if complexity requires them.
Acceptance: ANU can complete a longer test workflow, report progress, stop on risk or ambiguity, and provide a traceable summary.
7. Testing strategy
Test each capability independently before combining systems.
- Unit tests: permission rules, input validation, state transitions, coordinate transforms, and tool argument validation.
- Integration tests: IPC bridge, model adapter, browser tools, Windows helper, and database operations.
- End-to-end tests: launch, show/hide, shortcut, character behavior, a controlled browser task, and a harmless desktop workflow.
- Manual tests: visual quality, cursor tracking, multi-monitor behavior, accessibility, user understanding of permission prompts, and safe cancellation.
A test passing in code is not the same as a visual behavior being confirmed by the user. Record which kind of verification was performed.
8. Current known state
This is a snapshot from the initial development conversation. Re-inspect the repository before relying on it.
- Project folder: C:\Users\growt\OneDrive\Desktop\ANU
- Node.js: v24.20.0
- npm: 11.19.0
- Git: 2.55.0.windows.5
- Electron installed: 45.2.3
- Basic Electron app launched using npm start.
- A 300×300 transparent, frameless, always-on-top window was positioned at the bottom-right of the primary display's work area.
- A simple cartoon prototype with visible eyes and mouth was rendered.
- Global cursor tracking works: the main process polls `screen.getCursorScreenPoint()` every 33 ms and sends window-relative coordinates over the narrow preload bridge (`anu.onCursor`). Verified 2026-11-05 by screenshot: with the physical cursor at the top of the screen the pupils sit at the top of the eyes, matching the expected clamped offset. Blink (eyelids closing) and the startup mouth-test demo were also visually confirmed. An earlier PowerShell-based cursor probe failed with a TypeNotFound error and is irrelevant to the app.
- Verified window size is 300×300 DIP at the bottom-right corner (450×450 physical at 150% scale). Fixed during verification: `window.js` originally destructured `width`/`height` from `WINDOW`, which only has `WIDTH`/`HEIGHT`, so both were undefined and Electron silently used its default 800×600 window.
- A project-structure refactor was requested. Its completion status must be checked in the repository before assuming the new structure exists.
9. Immediate next work
1. Done: inspected the repository after the structure refactor (src/ layout confirmed).
2. Done: npm start works and launches src/main/main.js (verified 2026-11-05).
3. Done: Electron security reviewed — contextIsolation and sandbox on, no nodeIntegration, preload exposes only `anu.onCursor`.
4. Done: cursor position and smooth gaze tracking implemented and verified 2026-11-05 (pupil direction confirmed by screenshot; blink and mouth demo visually confirmed).
5. Keep voice, model integration, browser automation, and broad computer control out of scope until the relevant earlier experiments are stable.
6. Known observation: Windows reports the primary display's work area as the full screen on this machine (likely taskbar auto-hide), so the window sits flush in the corner and overlaps the taskbar strip. Revisit placement only if the taskbar interaction causes trouble.
10. Change management
This plan is intentionally revisable. When changing a major decision, record:
- what was learned from testing;
- what is changing and why;
- the impact on existing modules;
- migration and verification steps;
- any new risks or costs.
Do not mark planned functionality as implemented until it exists and has been verified.