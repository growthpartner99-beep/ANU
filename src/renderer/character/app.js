import { ANUCharacter } from './character/character.js';

(() => {
  const canvas = document.getElementById('rive-canvas');
  const characterDiv = document.getElementById('character');

  const WINDOW_SIZE = { width: 300, height: 320 };

  canvas.width = WINDOW_SIZE.width;
  canvas.height = WINDOW_SIZE.height;

  const anu = window.anuCharacter = new ANUCharacter({
    canvas: canvas,
    rivFile: '../assets/character/anu.riv',
    scale: 1,
  });

  anu.setWindowBounds({
    x: 0,
    y: 0,
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
  });

  anu.onReady(() => {
    console.log('[ANU] Character ready');
    anu.setExpression('neutral');
  });

  anu.init().catch((err) => {
    console.error('[ANU] Failed to initialize character:', err);
  });

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
  };
})();
