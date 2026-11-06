import { RiveCharacter } from './rive/character.js';
import { StateMachineController, Emotion } from './rive/state-machine.js';
import { GazeController } from './rive/gaze.js';
import { ExpressionController } from './rive/expression.js';
import { MouthController } from './rive/mouth.js';
import { IdleController } from './rive/idle.js';

export class ANUCharacter {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.rivFile = options.rivFile;

    this.rive = new RiveCharacter({
      canvas: this.canvas,
      rivFile: this.rivFile,
      artboardName: options.artboardName || 'Artboard 1',
      stateMachineName: options.stateMachineName || 'State Machine 1',
      scale: options.scale || 1,
      onLoad: () => this._onRiveLoaded(),
      onError: (err) => console.error('[ANUCharacter] Rive load error:', err),
    });

    this.sm = null;
    this.gaze = null;
    this.expression = null;
    this.mouth = null;
    this.idle = null;

    this.isReady = false;
    this.readyCallbacks = [];
    this.windowBounds = { x: 0, y: 0, width: 300, height: 320 };
  }

  async init() {
    await this.rive.load();
  }

  _onRiveLoaded() {
    this.sm = new StateMachineController(this.rive);
    this.gaze = new GazeController(this.rive);
    this.expression = new ExpressionController(this.rive, this.sm);
    this.mouth = new MouthController(this.rive);
    this.idle = new IdleController(this.rive, this.sm, this.gaze);

    this.isReady = true;
    this.readyCallbacks.forEach((cb) => cb());
    this.readyCallbacks = [];

    this.setExpression('neutral');
    this.idle.start();
  }

  onReady(callback) {
    if (this.isReady) callback();
    else this.readyCallbacks.push(callback);
  }

  setState(state) {
    this.sm.setState(state);
  }

  setExpression(name) {
    this.expression.setExpression(name);
  }

  lookAt(x, y) {
    this.gaze.lookAt(x, y, this.windowBounds);
  }

  centerGaze() {
    this.gaze.center();
  }

  startTalking() {
    this.sm.setSpeaking(true);
    this.mouth.setMouth('open');
  }

  stopTalking() {
    this.sm.setSpeaking(false);
    this.mouth.setMouth('closed');
  }

  setMouth(name) {
    this.mouth.setMouth(name);
  }

  trigger(name) {
    this.rive.fireTrigger(name);
  }

  blink() {
    this.sm.triggerBlink();
  }

  doubleBlink() {
    this.sm.triggerDoubleBlink();
  }

  setListening(value) {
    this.sm.setListening(value);
  }

  setThinking(value) {
    this.sm.setThinking(value);
  }

  setEnergy(value) {
    this.sm.setEnergy(value);
  }

  setWindowBounds(bounds) {
    this.windowBounds = bounds;
  }

  setScale(scale) {
    this.rive.setScale(scale);
  }

  pause() {
    this.rive.pause();
    if (this.idle) this.idle.stop();
  }

  resume() {
    this.rive.resume();
    if (this.idle) this.idle.start();
  }

  destroy() {
    if (this.idle) this.idle.stop();
    if (this.rive) this.rive.destroy();
    this.isReady = false;
  }
}

export { Emotion };
