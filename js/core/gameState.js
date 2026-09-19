// gameState.js
// 管理整個遊戲的當前狀態：資源數量、每個採集點的等級與建築、加工佇列、
// 人物（等級/經驗值/體力）、時間戳
//
// 注意：「人物等級」跟「採集點等級」是分開的兩套系統：
//   - 採集點等級（spots[x].level）：花資源升級，解鎖新建築、提高自動生產倍率
//   - 人物等級（character.level）：花經驗值升級，提高徒手採集時拿到高階物品的機率加成

const GameState = (function () {
  let state = null;

  const BASE_MAX_STAMINA = 20;

  function createDefaultState() {
    const spots = {};
    Object.keys(GATHERING_SPOTS).forEach(spotId => {
      spots[spotId] = {
        level: 1,
        buildings: {} // { buildingId: { built: true, level: 1 } }
      };
    });

    return {
      resources: {},        // { resourceId: quantity }
      spots: spots,          // 各採集點等級與已蓋建築
      craftingQueue: [],     // [{ recipeId, startTime, endTime }]
      character: {
        level: 1,
        exp: 0,
        stamina: BASE_MAX_STAMINA,
        maxStamina: BASE_MAX_STAMINA
      },
      lastTimestamp: Date.now(),
      gold: 0
    };
  }

  function init() {
    state = createDefaultState();
    return state;
  }

  function get() {
    if (!state) init();
    // 相容舊存檔：如果讀到的存檔還沒有 character 欄位，補上預設值
    if (!state.character) {
      state.character = { level: 1, exp: 0, stamina: BASE_MAX_STAMINA, maxStamina: BASE_MAX_STAMINA };
    }
    return state;
  }

  function set(newState) {
    state = newState;
    get(); // 觸發相容性補值
  }

  function addResource(resourceId, amount) {
    if (!state.resources[resourceId]) state.resources[resourceId] = 0;
    state.resources[resourceId] += amount;
  }

  function removeResource(resourceId, amount) {
    if (!state.resources[resourceId] || state.resources[resourceId] < amount) {
      return false; // 資源不足
    }
    state.resources[resourceId] -= amount;
    return true;
  }

  function hasResources(costObj) {
    return Object.entries(costObj).every(
      ([resId, amt]) => (state.resources[resId] || 0) >= amt
    );
  }

  function spendResources(costObj) {
    if (!hasResources(costObj)) return false;
    Object.entries(costObj).forEach(([resId, amt]) => {
      state.resources[resId] -= amt;
    });
    return true;
  }

  function buildBuilding(spotId, buildingId) {
    const spot = state.spots[spotId];
    if (!spot) return false;
    spot.buildings[buildingId] = { built: true, level: 1, builtAt: Date.now() };
    return true;
  }

  function hasBuilding(spotId, buildingId) {
    const spot = state.spots[spotId];
    return !!(spot && spot.buildings[buildingId] && spot.buildings[buildingId].built);
  }

  function getBuildingLevel(spotId, buildingId) {
    const spot = state.spots[spotId];
    if (!spot || !spot.buildings[buildingId]) return 0;
    return spot.buildings[buildingId].level || 1;
  }

  // 建築物獨立升級（跟採集點本身的等級是分開的兩件事）
  function upgradeBuilding(spotId, buildingId) {
    const spot = state.spots[spotId];
    if (!spot || !spot.buildings[buildingId]) return false;
    spot.buildings[buildingId].level += 1;
    return true;
  }

  // ===== 人物：經驗值 / 等級 / 體力 =====

  function expNeededForLevel(level) {
    return level * 50; // 簡單線性公式：等級越高需要越多經驗值
  }

  // 增加經驗值，並自動處理連續升級（一次補很多經驗值時可能連升多級）
  function addExp(amount) {
    const c = get().character;
    c.exp += amount;
    while (c.exp >= expNeededForLevel(c.level)) {
      c.exp -= expNeededForLevel(c.level);
      c.level += 1;
    }
  }

  function spendStamina(amount) {
    const c = get().character;
    if (c.stamina < amount) return false;
    c.stamina -= amount;
    return true;
  }

  function addStamina(amount) {
    const c = get().character;
    c.stamina = Math.min(c.maxStamina, c.stamina + amount);
  }

  return {
    init, get, set,
    addResource, removeResource, hasResources, spendResources,
    buildBuilding, hasBuilding, getBuildingLevel, upgradeBuilding,
    expNeededForLevel, addExp, spendStamina, addStamina
  };
})();

if (typeof module !== 'undefined') {
  module.exports = { GameState };
}
