ANU — Cloud AI and Local/Cloud Boundary
Purpose: Define how ANU may use cloud AI services while keeping desktop control, permissions, and sensitive data under local application control.

Status: Architecture guidance only. No cloud provider, model, API, or paid service is selected by this document.

1. Core principle
ANU should use a hybrid architecture:
- The ANU application, character, permission checks, desktop integrations, and local memory run on the user's Windows computer.
- A cloud model may provide language reasoning, planning assistance, or visual interpretation when the user has enabled and authorized that use.
- The cloud model does not receive direct operating-system privileges and cannot execute actions by itself.
- The local ANU runtime validates every proposed tool call and decides whether it is permitted.
The cloud model is an advisor and reasoning service. The local application remains the authority for access and action.
2. Responsibility split
Local responsibilities
Keep these capabilities local by default:
- desktop window and character rendering;
- global shortcut registration;
- cursor position sampling for character gaze;
- local keyboard/mouse integration;
- Windows UI Automation and screen-capture coordination;
- browser and filesystem tool execution;
- permission checks and confirmation dialogs;
- local configuration and memory;
- task cancellation and execution logs;
- credentials and secrets management.
Cloud responsibilities
Cloud services may be used for:
- interpreting natural-language requests;
- generating plans and deciding which approved tool to request;
- summarizing user-approved webpage or document content;
- reasoning about a user-approved screenshot when visual interpretation is needed;
- speech recognition or speech synthesis if the user selects a cloud voice service;
- other clearly disclosed model capabilities approved for the task.
Cloud services should not:
- directly control the operating system;
- receive unrestricted filesystem or shell access;
- decide their own permission level;
- store passwords, one-time codes, session cookies, or API secrets;
- silently capture or continuously stream the desktop;
- bypass local confirmation requirements.
3. Request and response flow
Use a controlled flow similar to this:
User request
    |
    v
Local ANU runtime
    |
    +--> Identify task and sensitivity
    |
    +--> Gather minimum necessary context
    |
    +--> Apply local privacy and permission rules
    |
    v
Cloud model adapter (only when enabled/needed)
    |
    +--> Send user request plus scoped context
    |
    +--> Receive text, structured plan, or proposed tool call
    |
    v
Local validation layer
    |
    +--> Validate schema and tool arguments
    +--> Check permissions and confirmation requirements
    +--> Reject unsupported or unsafe requests
    |
    v
Local tool execution
    |
    +--> Observe result
    +--> Verify outcome
    |
    v
Local ANU runtime summarizes result to user
The model's output is untrusted input. Never execute a model-generated command, code snippet, path, URL, or tool request without validation and policy checks.
4. Data minimization
Before making a cloud request, decide what information is actually necessary.
Potentially shareable, when relevant and authorized
- the user's current text instruction;
- a short, relevant excerpt from a webpage;
- selected non-sensitive document text;
- accessibility metadata for a relevant window or control;
- a specific screenshot or cropped region when visual reasoning is required and the user has enabled/approved that use;
- non-sensitive task status and tool results.
Do not send by default
- the entire desktop or continuous screen frames;
- unrelated open windows or tabs;
- passwords, one-time authentication codes, recovery codes, private keys, cookies, session tokens, or API keys;
- password fields or authentication screens;
- private documents unrelated to the current task;
- personal information that is not required to complete the request;
- raw application logs that may contain secrets.
If sensitive information appears in a screenshot or page, avoid sending the image or content. Prefer a redacted or cropped representation, or ask the user to handle the step themselves.
5. Screen and visual data
ANU may eventually use Windows Graphics Capture and vision-capable models. This must be implemented as an explicit, scoped capability.

Requirements:
1. No continuous cloud screen streaming by default.
2. Capture only the display, window, or region needed for the current task.
3. Make capture state visible to the user.
4. Ask for permission before sending a screenshot to a cloud provider unless the user has explicitly enabled a clearly described task-level or session-level setting.
5. Avoid capturing password managers, authentication flows, payment screens, private messages, or unrelated personal content.
6. Crop and redact unnecessary information locally where practical.
7. Do not retain screenshots after their task purpose has ended unless the user explicitly saves them.
8. Do not use screenshots as a replacement for accessible UI metadata when semantic inspection is sufficient.
The local cursor-following animation is a separate feature. High-frequency cursor coordinates used only to animate ANU's eyes should stay local and should never be sent to a model provider.
6. Model-provider abstraction
Do not couple the application to one provider's SDK or message format.

Create a small provider interface when model integration begins. The exact TypeScript names can be selected during implementation, but the interface should cover:
- send a user request and scoped context;
- optionally provide tool definitions;
- receive a text response or structured tool proposal;
- support cancellation and timeouts;
- expose provider/model metadata for diagnostics;
- return normalized errors;
- support usage information where the provider exposes it.
Keep provider-specific code inside adapters. The agent runtime should depend on the normalized interface, not on provider-specific SDK classes.

Do not build a complex provider registry before at least one provider is actually integrated and tested.
7. Tool calling and execution boundary
A cloud model may propose a tool call, but only the local runtime may execute it.

Required sequence:
1. Receive the proposed tool name and arguments.
2. Confirm that the tool exists in the local allowlist.
3. Validate arguments against a strict schema.
4. Check the task scope and current permission grant.
5. Ask the user for confirmation when required.
6. Execute the tool locally with bounded inputs and timeouts.
7. Observe and verify the result.
8. Return only the necessary result to the model.
Never expose generic tools such as unrestricted runShell(command), readAnyFile(path), clickAtAnyCoordinate(x,y), or arbitrary code execution to the model. Prefer narrow tools such as getActiveWindowSummary, readSelectedFile, navigateControlledBrowser, or clickAccessibleElement with explicit scope and validation.
8. Credentials and configuration
- Never hard-code API keys in source code.
- Never commit .env, tokens, certificates, or local credential files.
- Add secret-containing files to .gitignore.
- Prefer Windows Credential Manager or an appropriate operating-system secure storage mechanism for persisted provider credentials.
- For temporary development, local environment variables may be used, but must remain outside version control and must not be printed in logs.
- Do not send one provider's API key to another provider or to the model as conversational context.
- Do not ask the user to paste passwords or authentication codes into ANU's chat.
A future settings screen should explain which provider is configured and how to remove its credentials.
9. Cost and performance controls
Cloud reasoning can incur cost and latency. Implement controls before enabling routine use:
- show or document which provider/model is configured;
- allow the user to choose or change providers;
- set request timeouts and bounded retries;
- support cancellation;
- avoid repeatedly sending unchanged context;
- summarize long histories locally where appropriate;
- cap context size and image dimensions;
- do not send every cursor update or animation frame;
- avoid autonomous loops that make unlimited model calls;
- provide a clear limit for tool steps or task duration;
- disclose when a task is likely to use substantial model or image-processing resources.
Do not assume that a model or service is free. Verify current pricing, retention terms, and API availability when a provider is selected.
10. Reliability and offline behavior
ANU should remain useful when cloud access is unavailable:
- the character should render and animate locally;
- the desktop shell and shortcut should still work;
- local tools should remain available when their dependencies allow;
- the user should see a clear offline/provider error;
- failed model requests should not trigger repeated uncontrolled retries;
- incomplete cloud reasoning must not be represented as a completed task.
Provide a clear way to cancel a request and return the interface to an idle state.
11. Logging and retention
Logs should help diagnose failures without becoming a second copy of the user's private activity.
- Log timestamps, task IDs, tool names, durations, and sanitized error categories where useful.
- Do not log passwords, tokens, cookies, full private prompts, or unrestricted screenshot contents.
- Keep detailed task history local and subject to user controls.
- Define retention and deletion behavior before shipping persistent history.
- If a cloud provider retains request data under its own terms, disclose that clearly and link to the provider's current policy in the product settings or documentation.
12. Provider-selection checklist
Before choosing a cloud model provider, compare:
- API availability and regional access;
- current pricing and free-tier limits;
- supported model capabilities, including tool calling and vision if required;
- data usage, training, and retention terms;
- latency and reliability;
- context limits;
- structured output support;
- cancellation and rate limits;
- credential-storage requirements;
- whether the provider's terms are suitable for the intended user and use case.
Do not select a provider based only on benchmark rankings or marketing claims. Test it against ANU's actual tasks and safety requirements.
13. Current decisions
Topic	Current decision
Overall approach	Hybrid local + cloud
Desktop runtime	Local Windows/Electron application
Computer actions	Executed locally, behind permission checks
Cloud model access	Optional and provider-neutral
Screen sharing	Scoped and permission-aware; never continuous by default
Cursor gaze data	Local only
API provider	Not selected
Voice provider	Not selected
Local model	Not required for the first version
Cloud storage of memory	Not planned; memory should begin locally


14. Implementation gate
Do not implement cloud model access until the local application has:
- a stable main/preload/renderer boundary;
- Electron security protections enabled;
- a clear permission system;
- a normalized tool schema;
- task cancellation and error handling;
- a decision about which user context may be sent externally.
When cloud integration begins, start with one provider and one harmless, narrow task. Verify the full request/response flow before adding more tools or autonomy.