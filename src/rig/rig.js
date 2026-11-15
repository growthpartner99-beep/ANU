// Rig interface. Two interchangeable implementations:
//   PlaceholderRig - swaps whole cropped sheet images per expression (today).
//   LayeredRig     - driven by assets/rig.json + hand-cut parts (not built yet).
// The UI only talks to this API, so replacing the rig does not touch the UI.
//
// Rig API (both modes):
//   mode                -> 'placeholder' | 'layered'
//   setExpression(name, pose?) -> show an expression (pose is a full-body override)
//   setGaze(nx, ny)     -> normalized -1..1 cursor direction
//   setMicLevel(0..1)   -> live microphone level (listening)
//   setTailStatus(kind) -> 'dim' | 'idle' | 'mic' | 'think' | 'bright' | 'steady' | 'error'
//   blink()             -> one automatic blink
//   destroy()

// Placeholder art: crops from assets/ref/ANU_sheet.png (see docs/ART_TODO.md).
const ART = {
  happy: 'happy.png',
  winking: 'winking.png',
  excited: 'excited.png',
  thinking: 'thinking.png',
  sleepy: 'sleepy.png',
  surprised: 'surprised.png',
  hero: 'hero.png',
  front: 'front.png',
};

export class PlaceholderRig {
  constructor({ container, baseUrl = '../../assets/states/', fadeMs = 180 } = {}) {
    if (!container) throw new Error('PlaceholderRig needs a container element');
    this.mode = 'placeholder';
    this.baseUrl = baseUrl;
    this.fadeMs = fadeMs;

    this.root = document.createElement('div');
    this.root.className = 'rig rig-placeholder';
    this.root.dataset.tail = 'dim';
    this.root.style.setProperty('--fade', `${fadeMs}ms`);

    this.layers = [this._makeLayer(), this._makeLayer()];
    this.layers.forEach((layer) => this.root.appendChild(layer));

    this.status = document.createElement('div');
    this.status.className = 'status-light';
    this.root.appendChild(this.status);

    container.appendChild(this.root);

    this.front = 0;
    this.token = 0;
    this.current = null;
    this.base = { name: 'happy', pose: null };
    this.blinkTimer = null;

    // Warm the cache so crossfades never flash an empty frame.
    Object.values(ART).forEach((file) => {
      const img = new Image();
      img.src = this.baseUrl + file;
    });
  }

  _makeLayer() {
    const img = document.createElement('img');
    img.className = 'rig-layer';
    img.alt = '';
    img.draggable = false;
    return img;
  }

  _apply(key) {
    if (key === this.current) return;
    this.current = key;
    const token = ++this.token;
    const next = 1 - this.front;
    const layer = this.layers[next];
    layer.classList.remove('is-front');
    layer.src = this.baseUrl + ART[key];
    const flip = () => {
      if (token !== this.token) return;
      layer.classList.add('is-front');
      this.layers[this.front].classList.remove('is-front');
      this.front = next;
    };
    if (layer.complete) flip();
    else layer.onload = flip;
  }

  setExpression(name, pose) {
    const base = { name: ART[name] ? name : 'happy', pose: pose && ART[pose] ? pose : null };
    this.base = base;
    this._apply(base.pose || base.name);
  }

  setGaze(nx = 0, ny = 0) {
    const x = Math.max(-1, Math.min(1, nx));
    const y = Math.max(-1, Math.min(1, ny));
    this.root.style.setProperty('--gaze-x', `${(x * 7).toFixed(1)}px`);
    this.root.style.setProperty('--gaze-y', `${(y * 5).toFixed(1)}px`);
    this.root.style.setProperty('--gaze-r', `${(x * 1.6).toFixed(2)}deg`);
  }

  setMicLevel(level = 0) {
    this.root.style.setProperty('--mic', String(Math.max(0, Math.min(1, level))));
  }

  setTailStatus(kind = 'dim') {
    this.root.dataset.tail = kind;
  }

  // Placeholder blink: the sheet only has wholes, so a fast crossfade to the
  // sleepy crop is the closest honest thing until eyelids exist as a layer.
  blink() {
    if (this.blinkTimer || this.current === 'sleepy') return;
    this._apply('sleepy');
    this.blinkTimer = setTimeout(() => {
      this.blinkTimer = null;
      this._apply(this.base.pose || this.base.name);
    }, 110);
  }

  destroy() {
    if (this.blinkTimer) clearTimeout(this.blinkTimer);
    this.root.remove();
  }
}

export class LayeredRig {
  constructor() {
    throw new Error(
      'Layered rig is not built yet: cut assets/parts/*.png and describe them in ' +
        'assets/rig.json (layer list in docs/ART_TODO.md). The placeholder rig is used until then.'
    );
  }
}

export function createRig(options = {}) {
  if (options.mode === 'layered') return new LayeredRig(options);
  return new PlaceholderRig(options);
}
