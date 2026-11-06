export class IdleController {
  constructor(riveCharacter, stateMachine, gaze, options = {}) {
    this.rive = riveCharacter;
    this.sm = stateMachine;
    this.gaze = gaze;

    this.blinkInterval = options.blinkInterval || 3000;
    this.blinkChance = options.blinkChance || 0.7;
    this.doubleBlinkChance = options.doubleBlinkChance || 0.25;
    this.lookAroundChance = options.lookAroundChance || 0.15;
    this.breathingEnabled = options.breathingEnabled !== false;

    this.lastBlink = 0;
    this.lastLookAround = 0;
    this.breathingTime = 0;
    this.isBlinking = false;
    this.isRunning = false;
    this.animationFrame = null;
    this.lastTime = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this._tick();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  _tick() {
    if (!this.isRunning) return;

    const now = performance.now();
    const dt = now - this.lastTime;
    this.lastTime = now;

    this._updateBlinking(now);
    this._updateLookAround(now);
    this._updateBreathing(dt);

    this.gaze.update(dt / 1000);

    this.animationFrame = requestAnimationFrame(() => this._tick());
  }

  _updateBlinking(now) {
    if (this.isBlinking) return;
    if (now - this.lastBlink < this.blinkInterval) return;
    if (Math.random() > this.blinkChance) return;

    const isDouble = Math.random() < this.doubleBlinkChance;
    this.isBlinking = true;
    this.sm.triggerBlink();

    setTimeout(() => {
      this.isBlinking = false;
      this.lastBlink = now;
      if (isDouble) {
        setTimeout(() => {
          this.isBlinking = false;
          this.sm.triggerBlink();
        }, 120);
      }
    }, 150);
  }

  _updateLookAround(now) {
    if (now - this.lastLookAround < 5000) return;
    if (Math.random() > this.lookAroundChance) return;

    this.lastLookAround = now;
    const rx = (Math.random() * 2 - 1) * 0.8;
    const ry = (Math.random() * 2 - 1) * 0.5;

    this.gaze.targetX = rx;
    this.gaze.targetY = ry;

    setTimeout(() => {
      this.gaze.center();
    }, 2000 + Math.random() * 1500);
  }

  _updateBreathing(dt) {
    if (!this.breathingEnabled) return;
    this.breathingTime += dt / 1000;
    const breath = Math.sin(this.breathingTime * 2.5) * 0.05 + 0.95;
    this.rive.setNumber('breath', breath);
  }
}
