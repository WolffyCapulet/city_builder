// gathering.js
// 計算已蓋建築在一段時間內的產出（online tick 跟 offline 結算都呼叫同一套邏輯）

const Gathering = (function () {

  // 計算單一採集點、單一建築在 elapsedSeconds 秒內的產出
  // 回傳 { resourceId: amount, ... }
  function calcBuildingProduction(spotId, buildingId, elapsedSeconds) {
    const production = BUILDING_PRODUCTION[buildingId];
    if (!production) return {};

    const state = GameState.get();
    const spotLevel = state.spots[spotId].level;
    const levelData = SPOT_LEVELS[Math.min(spotLevel - 1, SPOT_LEVELS.length - 1)];
    const multiplier = levelData.quantityMultiplier;

    const result = {};
    Object.entries(production).forEach(([resId, ratePerSec]) => {
      const amount = ratePerSec * multiplier * elapsedSeconds;
      result[resId] = amount;
    });

    // 稀有掉落判定（以「期望值」方式線性套用在離線/在線結算上，避免逐秒隨機造成離線計算太慢）
    const rareTable = RARE_DROP_TABLE[buildingId];
    if (rareTable) {
      rareTable.forEach(entry => {
        const rarityBonusMultiplier = 1 + (levelData.rarityBonus / 100);
        const expectedAmount = entry.chance * rarityBonusMultiplier * elapsedSeconds;
        result[entry.resource] = (result[entry.resource] || 0) + expectedAmount;
      });
    }

    return result;
  }

  // 計算整個遊戲中「所有已建成的採集建築」在 elapsedSeconds 秒內的總產出
  // 回傳 { resourceId: amount }
  function calcAllProduction(elapsedSeconds) {
    const state = GameState.get();
    const totals = {};

    Object.keys(state.spots).forEach(spotId => {
      const spot = state.spots[spotId];
      Object.keys(spot.buildings).forEach(buildingId => {
        if (!spot.buildings[buildingId].built) return;
        const buildingDef = BUILDINGS[buildingId];
        if (!buildingDef || buildingDef.type !== 'gathering') return;

        const produced = calcBuildingProduction(spotId, buildingId, elapsedSeconds);
        Object.entries(produced).forEach(([resId, amt]) => {
          totals[resId] = (totals[resId] || 0) + amt;
        });
      });
    });

    return totals;
  }

  // 把計算出來的產出實際加進玩家資源（小數用 floor，避免資源出現小數點；
  // 若想要精準保留小數殘值可自行改為累加浮點數，這裡先採簡單版本）
  function applyProduction(totals) {
    Object.entries(totals).forEach(([resId, amt]) => {
      GameState.addResource(resId, Math.floor(amt));
    });
  }

  return { calcBuildingProduction, calcAllProduction, applyProduction };
})();

if (typeof module !== 'undefined') {
  module.exports = { Gathering };
}
