class RiveCharacter {
  constructor(options = {}) {
    this.canvas = options.canvas;
    this.rivFile = options.rivFile;
    this.artboardName = options.artboardName || 'Artboard 1';
    this.stateMachineName = options.stateMachineName || 'State Machine 1';
    this.scale = options.scale || 1;

    this.rive = null;
    this.riveFileInstance = null;
    this.artboard = null;
    this.stateMachine = null;
    this.inputs = new Map();
    this.isLoaded = false;
    this.onLoad = options.onLoad || (() => {});
    this.onError = options.onError || (() => {});
  }

  async load() {
    return new Promise((resolve, reject) => {
      const loader = new window.rive.RuntimeLoader({
        src: this.rivFile,
        autoplay: true,
        onLoad: (riveFile) => {
          this.riveFileInstance = riveFile;
          this.artboard = this.riveFileInstance.artboardByName(this.artboardName);
          if (!this.artboard) {
            const err = new Error(`Artboard "${this.artboardName}" not found`);
            this.onError(err);
            reject(err);
            return;
          }

          this.rive = new window.rive.Rive({
            canvas: this.canvas,
            artboard: this.artboard,
            autoplay: true,
            fit: window.rive.Fit.CONTAIN,
            alignment: window.rive.Alignment.CENTER,
          });

          this.stateMachine = this.rive.stateMachineByName(this.stateMachineName);
          if (this.stateMachine) {
            this.stateMachine.addChangeListener((change) => {
              this._onStateMachineChange(change);
            });
          }

          this.isLoaded = true;
          this.onLoad(this);
          resolve(this);
        },
        onError: (err) => {
          this.onError(err);
          reject(err);
        },
      });
      loader.load();
    });
  }

  _onStateMachineChange(change) {}

  input(name) {
    if (!this.stateMachine) return null;
    if (this.inputs.has(name)) return this.inputs.get(name);

    const input = this.stateMachine.input(name);
    if (input) {
      this.inputs.set(name, input);
    }
    return input;
  }

  setNumber(name, value) {
    const input = this.input(name);
    if (!input) return;
    try { input.value = value; } catch (e) { console.warn(`[RiveCharacter] Failed to set number input "${name}":`, e.message); }
  }

  setBoolean(name, value) {
    const input = this.input(name);
    if (!input) return;
    try { input.value = value; } catch (e) { console.warn(`[RiveCharacter] Failed to set boolean input "${name}":`, e.message); }
  }

  fireTrigger(name) {
    const input = this.input(name);
    if (!input) return;
    try { input.fire(); } catch (e) { console.warn(`[RiveCharacter] Failed to fire trigger "${name}":`, e.message); }
  }

  setScale(scale) {
    this.scale = scale;
    if (this.rive) {
      this.rive.resize(this.canvas.width * scale, this.canvas.height * scale);
    }
  }

  pause() {
    if (this.rive) this.rive.pause();
  }

  resume() {
    if (this.rive) this.rive.resume();
  }

  destroy() {
    if (this.rive) {
      this.rive.destroy();
      this.rive = null;
    }
    this.inputs.clear();
    this.isLoaded = false;
  }
}

export { RiveCharacter };
