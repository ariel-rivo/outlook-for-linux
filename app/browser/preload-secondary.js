'use strict';

// Intercept contextmenu on editable targets before Outlook's capture-phase handler
// so Chromium sends ShowContextMenu (enabling cut/copy/paste/spell-check via Electron's
// context-menu event). Non-editable, non-link elements with a text selection are also
// intercepted so the user can copy selected text from read-only areas.
// Links are left alone so Outlook's custom link menus continue to work.
window.addEventListener('contextmenu', (e) => {
  const t = e.target;
  if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.stopImmediatePropagation();
  } else {
    const selectionText = window.getSelection()?.toString();
    if (selectionText && !t.closest('a[href]')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      // ipcRenderer is available via require() in secondary preload context
      require('electron').ipcRenderer.send('show-selection-context-menu', selectionText);
    }
  }
}, true);
