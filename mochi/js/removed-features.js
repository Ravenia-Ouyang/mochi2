(function () {
'use strict';

// 已下线的桌面功能。统一在最终加载阶段清除入口，兼容旧版桌面布局和动态注入的图标。
const APPS = new Set([
  'divination', 'music', 'garden', 'tongpin', 'shenshou', 'accounting',
  'room', 'water', 'piggy', 'memo', 'giftbox'
]);
const PAGES = [
  'page-divine', 'page-music', 'page-garden', 'page-tongpin', 'page-shenshou',
  'page-accounting', 'page-room', 'page-water', 'page-piggy', 'page-memo', 'page-giftbox'
];

function restoreDesktopIfNeeded() {
  const activeRemovedPage = PAGES.some(function (id) {
    const page = document.getElementById(id);
    return page && !page.hidden;
  });
  if (!activeRemovedPage) return;
  PAGES.forEach(function (id) {
    const page = document.getElementById(id);
    if (page) page.hidden = true;
  });
  const desktop = document.getElementById('page-phone');
  if (desktop) desktop.hidden = false;
}

function prune(root) {
  if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
  const apps = root.matches && root.matches('.app[data-app]') ? [root] :
    Array.from(root.querySelectorAll ? root.querySelectorAll('.app[data-app]') : []);
  apps.forEach(function (app) {
    if (APPS.has(app.getAttribute('data-app'))) app.remove();
  });

  const musicWidget = root.matches && root.matches('#music-widget') ? root :
    (root.querySelector ? root.querySelector('#music-widget') : null);
  if (musicWidget) musicWidget.remove();

  const divinationRow = root.matches && root.matches('#row-open-divination') ? root :
    (root.querySelector ? root.querySelector('#row-open-divination') : null);
  if (divinationRow) divinationRow.remove();

  PAGES.forEach(function (id) {
    const page = root.matches && root.matches('#' + id) ? root :
      (root.querySelector ? root.querySelector('#' + id) : null);
    if (page) page.hidden = true;
  });
}

function repackDesktop() {
  try { if (window.applyDeskLayout) window.applyDeskLayout(); } catch (e) {}
  try { if (window.deskRebuild) window.deskRebuild(); } catch (e) {}
}

const style = document.createElement('style');
style.id = 'removed-features-style';
style.textContent = '#page-divine,#page-music,#page-garden,#page-tongpin,#page-shenshou,' +
  '#page-accounting,#page-room,#page-water,#page-piggy,#page-memo,#page-giftbox,' +
  '#row-open-divination,#music-widget{display:none!important}';
document.head.appendChild(style);

prune(document);
restoreDesktopIfNeeded();
repackDesktop();

const observer = new MutationObserver(function (records) {
  let changed = false;
  records.forEach(function (record) {
    record.addedNodes.forEach(function (node) {
      if (node.nodeType !== 1) return;
      const before = document.querySelectorAll('.app[data-app]').length;
      prune(node);
      if (document.querySelectorAll('.app[data-app]').length !== before ||
          (node.matches && (node.matches('#music-widget') || node.matches('#row-open-divination')))) changed = true;
    });
  });
  if (changed) repackDesktop();
});
observer.observe(document.body, { childList: true, subtree: true });

window.mochiRemovedFeatures = { apps: Array.from(APPS), pages: PAGES.slice() };
if (window.__mochiLoaded) window.__mochiLoaded.push('removed-features.js');
})();
