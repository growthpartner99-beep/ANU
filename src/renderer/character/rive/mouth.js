export class MouthController {
  constructor(riveCharacter) {
    this.rive = riveCharacter;
    this.currentMouth = 'closed';

    this.mouthMap = {
      closed: 0,
      small_open: 1,
      open: 2,
      smile: 3,
      O: 4,
      wide: 5,
    };
  }

  setMouth(name) {
    if (this.currentMouth === name) return;
    this.currentMouth = name;
    const value = this.mouthMap[name] !== undefined ? this.mouthMap[name] : 0;
    this.rive.setNumber('mouth', value);
  }

  getMouth() {
    return this.currentMouth;
  }

  open() { this.setMouth('open'); }
  close() { this.setMouth('closed'); }
  smile() { this.setMouth('smile'); }
}
