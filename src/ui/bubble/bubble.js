// Short-lived reply bubble attached to the character, plus the long-form card.
// A bubble streams its words, then fades. Clicking it pins it. Anything that
// needsCard() becomes a card that stays until closed.
const { needsCard, bubbleLifetimeMs } = window.AnuText;

export class Bubble {
  constructor({ root, text, receipt, card, cardBody, cardReceipt, cardClose, onDismiss }) {
    this.root = root;
    this.textEl = text;
    this.receiptEl = receipt;
    this.cardEl = card;
    this.cardBody = cardBody;
    this.cardReceipt = cardReceipt;
    this.onDismiss = onDismiss || (() => {});

    this.stream = null;
    this.timer = null;
    this.pinned = false;

    root.addEventListener('click', () => this.pin());
    cardClose.addEventListener('click', () => {
      this.hideCard();
      this.onDismiss();
    });
  }

  get isOpen() {
    return this.root.dataset.visible === 'true' || !this.cardEl.hidden;
  }

  show(text, { receipt = '' } = {}) {
    this._clearTimers();
    this.pinned = false;
    this.root.dataset.pinned = 'false';
    this.root.dataset.visible = 'true';
    this.textEl.textContent = '';
    this.receiptEl.textContent = receipt;
    this.receiptEl.hidden = !receipt;

    const words = String(text || '').split(/\s+/).filter(Boolean);
    let index = 0;
    this.stream = setInterval(() => {
      this.textEl.textContent += (index ? ' ' : '') + words[index++];
      if (index < words.length) return;
      clearInterval(this.stream);
      this.stream = null;
      this._scheduleFade(text);
    }, 38);
  }

  _scheduleFade(text) {
    this._clearTimers();
    this.timer = setTimeout(() => {
      if (this.pinned) return;
      this.hide();
      this.onDismiss();
    }, bubbleLifetimeMs(text));
  }

  pin() {
    if (this.pinned) return;
    this.pinned = true;
    this.root.dataset.pinned = 'true';
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  hide() {
    this._clearTimers();
    this.root.dataset.visible = 'false';
  }

  showCard(text, { receipt = '' } = {}) {
    this.hide();
    this._renderCard(text);
    this.cardReceipt.textContent = receipt;
    this.cardReceipt.hidden = !receipt;
    this.cardEl.hidden = false;
    this.cardEl.scrollTop = 0;
  }

  _renderCard(text) {
    this.cardBody.textContent = '';
    const parts = String(text || '').split('```');
    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = part.replace(/^[a-z]+\n/i, '').trimEnd();
        pre.appendChild(code);
        this.cardBody.appendChild(pre);
        return;
      }
      if (part.trim()) {
        const paragraph = document.createElement('p');
        paragraph.textContent = part.trim();
        this.cardBody.appendChild(paragraph);
      }
    });
  }

  hideCard() {
    this.cardEl.hidden = true;
    this.cardBody.textContent = '';
  }

  _clearTimers() {
    if (this.stream) clearInterval(this.stream);
    if (this.timer) clearTimeout(this.timer);
    this.stream = null;
    this.timer = null;
  }

  destroy() {
    this._clearTimers();
  }
}

export { needsCard };
