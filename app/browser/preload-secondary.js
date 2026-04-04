'use strict';

function isInsideInteractiveListItem(el) {
  let node = el;
  for (let i = 0; i < 10 && node; i++) {
    const role = node.getAttribute?.('role');
    if (role === 'option' || role === 'treeitem') return true;
    node = node.parentElement;
  }
  return false;
}

// Block Outlook's capture-phase contextmenu handler so it can't call preventDefault().
// We do NOT call preventDefault() ourselves — this lets Electron's context-menu event
// fire in the main process, where assignContextMenuHandler handles the menu.
window.addEventListener('contextmenu', (e) => {
  const t = e.target;
  if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.stopImmediatePropagation(); // let Electron handle editable areas natively
  } else if (!t.closest('a[href]') && !isInsideInteractiveListItem(t)) {
    e.stopImmediatePropagation(); // block Outlook; no preventDefault so context-menu fires
  }
}, true);
