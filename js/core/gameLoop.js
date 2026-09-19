// gameLoop.js
// 每秒執行一次畫面更新與加工檢查；自動採集（建築生產）改為每 10 秒才結算一次一批，
// 讓「自動生產」跟「手動採集」都有清楚的節奏感，而不是連續不間斷的小數累加

const GameLoop = (function () {
  let tickInterval = null;
  let productionCounter = 0;
  let saveCounter = 0;

  const PRODUCTION_INTERVAL_SECONDS = 10; // 自動採集：每 10 秒結算一次
  const SAVE_EVERY_N_TICKS = 10;          // 每 10 秒自動存檔一次

  function tick() {
    productionCounter++;

    // 每 10 秒才結算一次自動生產（累積這 10 秒份的產出，一次發放）
    if (productionCounter >= PRODUCTION_INTERVAL_SECONDS) {
      const produced = Gathering.calcAllProduction(PRODUCTION_INTERVAL_SECONDS);
      Gathering.applyProduction(produced);
      productionCounter = 0;
    }

    // 加工佇列每秒都要檢查（時間到就要完成，不能跟生產一樣延遲）
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

  function getProductionProgress() {
    return Math.floor((productionCounter / PRODUCTION_INTERVAL_SECONDS) * 100);
  }

  function start() {
    if (tickInterval) return; // 避免重複啟動
    tickInterval = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(tickInterval);
    tickInterval = null;
  }

  return { start, stop, getProductionProgress, PRODUCTION_INTERVAL_SECONDS };
})();

if (typeof module !== 'undefined') {
  module.exports = { GameLoop };
}
