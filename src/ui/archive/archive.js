const log = document.getElementById('archive-log');
const empty = document.getElementById('archive-empty');
const count = document.getElementById('archive-count');
let entries = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function render(entry) {
  const item = element('article', 'entry');
  item.dataset.kind = entry.kind || 'bubble';

  const meta = element('div', 'entry-meta');
  const when = entry.at ? new Date(entry.at) : new Date();
  meta.textContent = `${when.toLocaleTimeString()} · ${entry.kind || 'bubble'}`;
  item.appendChild(meta);

  item.appendChild(element('p', 'entry-user', entry.user));
  item.appendChild(element('p', 'entry-anu', entry.anu));
  if (entry.receipt) item.appendChild(element('p', 'entry-receipt', entry.receipt));

  log.appendChild(item);
}

function refreshChrome() {
  const total = entries.length;
  count.textContent = total === 1 ? '1 exchange' : `${total} exchanges`;
  empty.hidden = total > 0;
}

async function boot() {
  if (!window.archiveApi) {
    empty.textContent = 'Archive bridge unavailable.';
    return;
  }
  entries = (await window.archiveApi.list()) || [];
  entries.forEach(render);
  refreshChrome();
  window.archiveApi.onEntry((entry) => {
    entries.push(entry);
    render(entry);
    refreshChrome();
    window.scrollTo(0, document.body.scrollHeight);
  });
}

boot();
