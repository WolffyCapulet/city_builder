// gameState.js
// 管理整個遊戲的當前狀態：資源數量、每個採集點的等級與建築、加工佇列、時間戳

const GameState = (function () {
  let state = null;

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
    return state;
  }

  function set(newState) {
    state = newState;
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
    spot.buildings[buildingId] = { built: true, level: 1 };
    return true;
  }

  function hasBuilding(spotId, buildingId) {
    const spot = state.spots[spotId];
    return !!(spot && spot.buildings[buildingId] && spot.buildings[buildingId].built);
  }

  return {
    init, get, set,
    addResource, removeResource, hasResources, spendResources,
    buildBuilding, hasBuilding
  };
})();

if (typeof module !== 'undefined') {
  module.exports = { GameState };
}
