// gameLoop.js
// 每秒執行一次：在線期間持續生產資源、檢查加工佇列、更新畫面、定期自動存檔

const GameLoop = (function () {
  let tickInterval = null;
  let saveCounter = 0;
  const SAVE_EVERY_N_TICKS = 10; // 每 10 秒自動存檔一次

  function tick() {
    // 1 秒鐘的線上產出
    const produced = Gathering.calcAllProduction(1);
    Gathering.applyProduction(produced);

    // 檢查是否有加工完成
    const completed = Crafting.processQueue(Date.now());
    if (completed.length > 0 && typeof UI !== 'undefined') {
      UI.notifyCraftingCompleted(completed);
    }

    if (typeof UI !== 'undefined') {
      UI.render();
    }

    saveCounter++;
    if (saveCounter >= SAVE_EVERY_N_TICKS) {
      SaveLoad.save();
      saveCounter = 0;
    }
  }

  function start() {
    if (tickInterval) return; // 避免重複啟動
    tickInterval = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  return { start, stop };
})();

if (typeof module !== 'undefined') {
  module.exports = { GameLoop };
}
