export class GazeController {
  constructor(riveCharacter, options = {}) {
    this.rive = riveCharacter;
    this.smoothing = options.smoothing || 0.15;
    this.maxAngle = options.maxAngle || 25;
    this.deadzone = options.deadzone || 0.05;
    this.acceleration = options.acceleration || 0.8;
    this.deceleration = options.deceleration || 0.9;

    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.velocityX = 0;
    this.velocityY = 0;

    this.enabled = true;
    this.eyeCenterX = 0;
    this.eyeCenterY = 0;
    this.eyeWidth = 100;
    this.eyeHeight = 100;
  }

  setEyeBounds(centerX, centerY, width, height) {
    this.eyeCenterX = centerX;
    this.eyeCenterY = centerY;
    this.eyeWidth = width;
    this.eyeHeight = height;
  }

  lookAt(screenX, screenY, windowBounds) {
    if (!this.enabled) return;

    const cx = windowBounds.x + windowBounds.width / 2;
    const cy = windowBounds.y + windowBounds.height / 2;

    const dx = screenX - cx;
    const dy = screenY - cy;

    const normX = dx / (windowBounds.width / 2);
    const normY = dy / (windowBounds.height / 2);

    this.targetX = this._clamp(normX, -1, 1);
    this.targetY = this._clamp(normY, -1, 1);
  }

  update(deltaTime) {
    if (!this.enabled) return;

    const dt = Math.min(deltaTime, 1 / 30);

    let dx = this.targetX - this.currentX;
    let dy = this.targetY - this.currentY;

    if (Math.abs(dx) < this.deadzone) dx = 0;
    if (Math.abs(dy) < this.deadzone) dy = 0;

    this.velocityX = dx * this.acceleration + this.velocityX * this.deceleration;
    this.velocityY = dy * this.acceleration + this.velocityY * this.deceleration;

    this.currentX += this.velocityX * dt * 10;
    this.currentY += this.velocityY * dt * 10;

    this.currentX = this._clamp(this.currentX, -1, 1);
    this.currentY = this._clamp(this.currentY, -1, 1);

    this.rive.setNumber('gazeX', this.currentX);
    this.rive.setNumber('gazeY', this.currentY);
  }

  center() {
    this.targetX = 0;
    this.targetY = 0;
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; this.center(); this.update(0); }

  _clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
}
