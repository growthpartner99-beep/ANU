export const Emotion = {
  NEUTRAL: 0,
  HAPPY: 1,
  EXCITED: 2,
  SAD: 3,
  CONFUSED: 4,
  SURPRISED: 5,
  THINKING: 6,
  SLEEPY: 7,
  CONCERNED: 8,
  ERROR: 9,
  LISTENING: 10,
};

export class StateMachineController {
  constructor(riveCharacter) {
    this.rive = riveCharacter;
    this.currentState = 'idle';
    this.currentEmotion = Emotion.NEUTRAL;
  }

  setEmotion(emotion) {
    this.currentEmotion = emotion;
    this.rive.setNumber('emotion', emotion);
  }

  setState(state) {
    this.currentState = state;
    this.rive.fireTrigger(`state_${state}`);
  }

  setListening(value) {
    this.rive.setBoolean('isListening', !!value);
  }

  setThinking(value) {
    this.rive.setBoolean('isThinking', !!value);
  }

  setSpeaking(value) {
    this.rive.setBoolean('isSpeaking', !!value);
  }

  setEnergy(value) {
    this.rive.setNumber('energy', Math.max(0, Math.min(1, value)));
  }

  triggerBlink() {
    this.rive.fireTrigger('blink');
  }

  triggerDoubleBlink() {
    this.rive.fireTrigger('double_blink');
  }
}
