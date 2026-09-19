// saveLoad.js
// 負責把 GameState 存進 localStorage（支援 5 個存檔格），
// 以及讀取時計算離線期間的生產與加工結算

const SaveLoad = (function () {
  const SLOT_COUNT = 5;
  const SLOT_KEY_PREFIX = 'city_builder_save_slot_';
  const ACTIVE_SLOT_KEY = 'city_builder_active_slot';
  const OFFLINE_CAP_SECONDS = 8 * 60 * 60; // 離線上限 8 小時

  function slotKey(slotIndex) {
    return SLOT_KEY_PREFIX + slotIndex;
  }

  function getActiveSlot() {
    const stored = localStorage.getItem(ACTIVE_SLOT_KEY);
    return stored ? parseInt(stored, 10) : 1;
  }

  function setActiveSlot(slotIndex) {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(slotIndex));
  }

  function hasSlotData(slotIndex) {
    return !!localStorage.getItem(slotKey(slotIndex));
  }

  // 回傳給 UI 顯示用的存檔格資訊
  function getSlotMeta(slotIndex) {
    const raw = localStorage.getItem(slotKey(slotIndex));
    if (!raw) return { empty: true };

    try {
      const state = JSON.parse(raw);
      const resourceCount = Object.values(state.resources || {})
        .reduce((sum, v) => sum + Math.floor(v), 0);
      return {
        empty: false,
        lastTimestamp: state.lastTimestamp || null,
        resourceCount
      };
    } catch (e) {
      return { empty: true };
    }
  }

  // 把目前的 GameState 存進指定格子（預設存進目前使用中的格子）
  function save(slotIndex) {
    const target = slotIndex || getActiveSlot();
    const state = GameState.get();
    state.lastTimestamp = Date.now();
    localStorage.setItem(slotKey(target), JSON.stringify(state));
  }

  // 計算離線結算並套用到目前的 GameState（不管存檔，只算資源）
  function applyOfflineCalculation(savedState) {
    const now = Date.now();
    const elapsedMs = now - (savedState.lastTimestamp || now);
    const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const cappedSeconds = Math.min(elapsedSeconds, OFFLINE_CAP_SECONDS);

    const gathered = Gathering.calcAllProduction(cappedSeconds);
    Gathering.applyProduction(gathered);

    const craftingCompleted = Crafting.processQueue(now);

    GameState.get().lastTimestamp = now;

    return { offlineSeconds: elapsedSeconds, gathered, craftingCompleted };
  }

  // 讀取指定格子，計算離線收穫，並把它設為目前使用中的格子
  // 回傳 { offlineSeconds, gathered, craftingCompleted }
  function loadSlot(slotIndex) {
    const raw = localStorage.getItem(slotKey(slotIndex));

    if (!raw) {
      // 這個格子是空的：建立一個全新的遊戲狀態
      GameState.init();
      setActiveSlot(slotIndex);
      save(slotIndex);
      return { offlineSeconds: 0, gathered: {}, craftingCompleted: [] };
    }

    const savedState = JSON.parse(raw);
    GameState.set(savedState);
    const report = applyOfflineCalculation(savedState);

    setActiveSlot(slotIndex);
    save(slotIndex);

    return report;
  }

  // 啟動遊戲時呼叫：載入「目前使用中的格子」（預設格子1）
  function init() {
    const active = getActiveSlot();
    return loadSlot(active);
  }

  // 清空指定格子的存檔資料。如果清空的是目前使用中的格子，
  // 會立刻重置成一個全新的遊戲狀態（因為玩家目前正在玩這個格子）
  function clearSlot(slotIndex) {
    localStorage.removeItem(slotKey(slotIndex));
    if (getActiveSlot() === slotIndex) {
      GameState.init();
      save(slotIndex);
    }
  }

  return {
    SLOT_COUNT,
    save, init, loadSlot, clearSlot,
    getActiveSlot, setActiveSlot,
    hasSlotData, getSlotMeta
  };
})();

if (typeof module !== 'undefined') {
  module.exports = { SaveLoad };
}
