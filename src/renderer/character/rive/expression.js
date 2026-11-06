export class ExpressionController {
  constructor(riveCharacter, stateMachine) {
    this.rive = riveCharacter;
    this.sm = stateMachine;
    this.currentExpression = 'neutral';

    this.expressionMap = {
      neutral: 0,
      happy: 1,
      excited: 2,
      sad: 3,
      confused: 4,
      surprised: 5,
      thinking: 6,
      sleepy: 7,
      concerned: 8,
      error: 9,
      listening: 10,
      speaking: 11,
    };
  }

  setExpression(name) {
    if (this.currentExpression === name) return;
    this.currentExpression = name;
    const value = this.expressionMap[name] !== undefined ? this.expressionMap[name] : 0;
    this.sm.setEmotion(value);
  }

  getExpression() {
    return this.currentExpression;
  }
}
