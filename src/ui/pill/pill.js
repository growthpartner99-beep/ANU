// The summonable one-line input attached to the character.
export class Pill {
  constructor({ root, input, caption, onSubmit, onDismiss, onValueChange }) {
    this.root = root;
    this.input = input;
    this.captionEl = caption;
    this.onSubmit = onSubmit || (() => {});
    this.onDismiss = onDismiss || (() => {});
    this.onValueChange = onValueChange || (() => {});

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        input.value = '';
        this.close();
        this.onSubmit(value);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
        this.onDismiss();
      }
    });

    input.addEventListener('input', () => this.onValueChange(input.value));
  }

  get isOpen() {
    return this.root.dataset.open === 'true';
  }

  open() {
    this.root.dataset.open = 'true';
    this.input.value = '';
    this.input.focus();
  }

  close() {
    this.root.dataset.open = 'false';
    this.input.blur();
  }

  setCaption(text) {
    this.captionEl.textContent = text || '';
    this.captionEl.hidden = !text;
  }
}
