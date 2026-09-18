// saveLoad.js
// 負責把 GameState 存進 localStorage，以及讀取時計算離線期間的生產與加工結算

const SaveLoad = (function () {
  const SAVE_KEY = 'city_builder_save_v1';

  function save() {
    const state = GameState.get();
    state.lastTimestamp = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  }

  // 讀取存檔，並計算離線期間的資源生產 + 加工完成
  // 回傳 { offlineSeconds, gathered, craftingCompleted }供 UI 顯示「離線收穫」畫面
  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      GameState.init();
      return { offlineSeconds: 0, gathered: {}, craftingCompleted: [] };
    }

    const savedState = JSON.parse(raw);
    GameState.set(savedState);

    const now = Date.now();
    const elapsedMs = now - (savedState.lastTimestamp || now);
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));

    // 離線上限：預設最多累積 8 小時（28800 秒），避免無限累積
    const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
    const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);

    // 1. 補算離線期間的採集產出
    const gathered = Gathering.calcAllProduction(cappedSeconds);
    Gathering.applyProduction(gathered);

    // 2. 補算離線期間應該完成的加工工作
    const craftingCompleted = Crafting.processQueue(now);

    // 更新時間戳並存檔
    GameState.get().lastTimestamp = now;
    save();

    return { offlineSeconds: elapsedSeconds, gathered, craftingCompleted };
  }

  return { save, load, hasSave };
})();

if (typeof module !== 'undefined') {
  module.exports = { SaveLoad };
}
