// Renders every placeholder expression to docs/shots/<expr>.png at exactly 512x512.
// Uses the renderer's deterministic stage: index.html?shot=<expr> (body.shot, see src/ui/app.js).
const { _electron } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { LOOK } = require('../src/state/anuState.js');

const REPO = path.resolve(__dirname, '..');
const EXE = path.join(REPO, 'node_modules/electron/dist/electron.exe');
const OUT = path.join(REPO, 'docs/shots');
const SIZE = 512;
// Every expression the state machine can show, plus 'winking' which the rig has art for.
const EXPRESSIONS = [...new Set([...Object.values(LOOK).map((l) => l.expression), 'winking'])].sort();
const PAGE = `file:///${path.join(REPO, 'src/renderer/index.html').replace(/\\/g, '/')}`;

const pngSize = (buf) => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) });

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

let app;
let bad = 0;
(async () => {
  try {
    app = await _electron.launch({
      args: ['.', '--force-device-scale-factor=1'], // pin DPR to 1 so the 512 clip is a true pixel render
      cwd: REPO,
      executablePath: EXE,
      env: { ...env, ANU_TEST_HOOKS: '1' },
    });
    const win = await app.firstWindow();
    fs.mkdirSync(OUT, { recursive: true });

    for (const name of EXPRESSIONS) {
      await win.goto(`${PAGE}?shot=${name}`);
      await win.waitForFunction(() => document.body.classList.contains('shot'));
      // Gaze follows the real cursor (translate up to 7px + rotate), so pin it for repeatable framing.
      // CSSOM is allowed under style-src 'self'; the app only writes --gaze-* vars, so this inline wins.
      await win.evaluate(() => {
        document.querySelector('.rig').style.transform = 'none';
      });
      // Wait for the front rig layer to load, then for the 180ms crossfade to finish.
      await win.waitForFunction(() => {
        const img = document.querySelector('.rig-layer.is-front');
        return Boolean(img && img.complete && img.naturalWidth > 0);
      });
      await win.waitForTimeout(300);

      // Measured, not assumed: the stage sits inside a 520x640 window.
      const box = await win.evaluate(() => {
        const r = document.getElementById('stage').getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
      const buf = await win.screenshot({ clip: box, omitBackground: true, scale: 'css' });
      const size = pngSize(buf);
      const file = path.join(OUT, `${name}.png`);
      fs.writeFileSync(file, buf);

      const ok = size.width === SIZE && size.height === SIZE;
      if (!ok) bad += 1;
      console.log(
        `${ok ? 'ok  ' : 'BAD '} ${path.relative(REPO, file)}  ${buf.length} bytes  ` +
          `${size.width}x${size.height}`
      );
    }
  } finally {
    if (app) await app.close();
  }

  if (bad) {
    console.error(`\n${bad} capture(s) were not ${SIZE}x${SIZE} — check the stage clip.`);
    process.exitCode = 1;
  } else {
    console.log(`\n${EXPRESSIONS.length} captures at ${SIZE}x${SIZE} in ${path.relative(REPO, OUT)}`);
  }
})().catch((err) => {
  console.error('shoot-states failed:', err);
  process.exitCode = 1;
});
