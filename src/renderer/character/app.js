import { ANUCharacter } from './character.js';

const RIV_FILE = '../../assets/character/anu.riv';
const FALLBACK_IMAGE = '../../Design/ANU_ Your Smart Desktop Companion.png';

(() => {
  const canvas = document.getElementById('rive-canvas');

  const WINDOW_SIZE = { width: 600, height: 650 };

  canvas.width = WINDOW_SIZE.width;
  canvas.height = WINDOW_SIZE.height;

  const ctx = canvas.getContext('2d');

  let riveReady = false;
  let fallbackImage = null;
  let fallbackReady = false;

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function drawFallback() {
    if (!fallbackReady || !fallbackImage) return;
    clearCanvas();
    const scale = Math.min(
      canvas.width / fallbackImage.width,
      canvas.height / fallbackImage.height
    );
    const w = fallbackImage.width * scale;
    const h = fallbackImage.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(fallbackImage, x, y, w, h);
    console.log('[ANU] Reference preview fallback drawn', Math.round(w), 'x', Math.round(h));
  }

  const anu = window.anuCharacter = new ANUCharacter({
    canvas: canvas,
    rivFile: RIV_FILE,
    scale: 1,
  });

  anu.setWindowBounds({
    x: 0,
    y: 0,
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
  });

  anu.init()
    .then(() => {
      riveReady = true;
      console.log('[ANU] Rive character loaded successfully');
      clearCanvas();
      anu.onReady(() => {
        console.log('[ANU] Character ready (Rive)');
        anu.setExpression('neutral');
      });
    })
    .catch((err) => {
      console.error(
        '[ANU] Rive artwork unavailable, using reference preview fallback:',
        err && err.message ? err.message : err
      );
    });

  const fbImg = new Image();
  // Resolve the fallback image to an absolute file:// URL so the renderer can
  // load it from the local filesystem regardless of the document's location.
  fbImg.src = new URL(FALLBACK_IMAGE, window.location.href).href;
  fbImg.onload = () => {
    fallbackImage = fbImg;
    fallbackReady = true;
    if (!riveReady) drawFallback();
  };
  fbImg.onerror = (err) => {
    console.error('[ANU] Failed to load reference fallback image:', err);
  };

  anu.onReady(() => {
    if (window.anuMouse) {
      let rafId = null;
      let lastPoint = null;

      function updateGaze() {
        const point = window.anuMouse.getPoint();
        if (point && (!lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y)) {
          lastPoint = point;
          anu.lookAt(point.x, point.y, anu.windowBounds);
        }
        rafId = requestAnimationFrame(updateGaze);
      }
      updateGaze();
    }
  });

  window.anuAPI = {
    setState: (s) => anu.setState(s),
    setExpression: (e) => anu.setExpression(e),
    lookAt: (x, y) => anu.lookAt(x, y, anu.windowBounds),
    startTalking: () => anu.startTalking(),
    stopTalking: () => anu.stopTalking(),
    blink: () => anu.blink(),
    setListening: (v) => anu.setListening(v),
    setThinking: (v) => anu.setThinking(v),
    destroy: () => anu.destroy(),
    isFallback: () => !riveReady,
  };
})();
