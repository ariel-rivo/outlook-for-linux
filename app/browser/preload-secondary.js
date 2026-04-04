'use strict';

const { ipcRenderer } = require('electron');

function isInsideInteractiveListItem(el) {
  let node = el;
  for (let i = 0; i < 10 && node; i++) {
    const role = node.getAttribute?.('role');
    if (role === 'option' || role === 'treeitem') return true;
    node = node.parentElement;
  }
  return false;
}

let _lastContextTarget = null;

window.addEventListener('contextmenu', (e) => {
  const t = e.target;
  if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.stopImmediatePropagation();
  } else if (!t.closest('a[href]') && !isInsideInteractiveListItem(t)) {
    _lastContextTarget = t;
    e.stopImmediatePropagation();
    e.preventDefault();
    ipcRenderer.send('show-selection-context-menu', window.getSelection()?.toString() ?? '');
  }
}, true);

ipcRenderer.on('select-all-in-context', () => {
  const target = _lastContextTarget;
  let container = document.body;
  if (target) {
    let node = target;
    while (node && node !== document.body) {
      if (node.hasAttribute?.('data-app-section')) { container = node; break; }
      const role = node.getAttribute?.('role');
      if (role === 'region' || role === 'article' || role === 'main') { container = node; break; }
      const style = window.getComputedStyle(node);
      if (
        (style.overflow === 'auto' || style.overflow === 'scroll' ||
         style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        node.scrollHeight > window.innerHeight * 0.3
      ) { container = node; break; }
      node = node.parentElement;
    }
  }
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(container);
  sel.addRange(range);
});
