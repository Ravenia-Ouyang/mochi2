(function () {
'use strict';
const IDS = ['more-rps', 'more-snake', 'more-brick', 'more-fish', 'more-auction',
  'chat-rps-panel', 'chat-snake-panel', 'chat-brick-panel', 'chat-fish-panel', 'chat-auction-panel'];
function removeGames(root) {
  if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
  IDS.forEach(function (id) {
    const el = root.matches && root.matches('#' + id) ? root :
      (root.querySelector ? root.querySelector('#' + id) : null);
    if (el) el.remove();
  });
}
removeGames(document);
new MutationObserver(function (records) {
  records.forEach(function (record) {
    record.addedNodes.forEach(function (node) { if (node.nodeType === 1) removeGames(node); });
  });
}).observe(document.body, { childList: true, subtree: true });
if (window.__mochiLoaded) window.__mochiLoaded.push('removed-games.js');
})();
