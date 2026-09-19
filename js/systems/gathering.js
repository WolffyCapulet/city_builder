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

  // 把計算出來的產出實際加進玩家資源。
  // 資源內部保留浮點數精確累加（顯示時才用 formatAmount 做 floor），
  // 這樣即使單次產量小於 1（例如每秒 0.1），累加多次後還是會正確增加，
  // 不會像先前每次都 floor 導致資源永遠停在 0。
  function applyProduction(totals) {
    Object.entries(totals).forEach(([resId, amt]) => {
      GameState.addResource(resId, amt);
    });
  }

  // 玩家手動點擊採集（不需要建築）：依照採集點目前等級，從對應的機率表加權隨機挑一種
  // 有冷卻時間避免瘋狂連點洗資源
  const MANUAL_GATHER_COOLDOWN_MS = 3000;
  const MANUAL_GATHER_AMOUNT = 1;

  // 取得某採集點在指定等級可用的機率表（找不到該等級時，使用小於等於該等級的最高可用等級）
  function getDropTable(spotId, level) {
    const spotTables = DROP_TABLES[spotId];
    if (!spotTables) return [];
    if (spotTables[level]) return spotTables[level];

    // 找不到剛好對應的等級時，往下找最接近的等級
    const availableLevels = Object.keys(spotTables).map(Number).sort((a, b) => a - b);
    let fallback = availableLevels[0];
    availableLevels.forEach(lv => {
      if (lv <= level) fallback = lv;
    });
    return spotTables[fallback] || [];
  }

  function manualGather(spotId) {
    const state = GameState.get();
    const spotState = state.spots[spotId];
    if (!spotState) return { success: false, reason: '找不到採集點' };

    const now = Date.now();
    if (spotState.lastManualGatherAt && now - spotState.lastManualGatherAt < MANUAL_GATHER_COOLDOWN_MS) {
      const remain = Math.ceil((MANUAL_GATHER_COOLDOWN_MS - (now - spotState.lastManualGatherAt)) / 1000);
      return { success: false, reason: `冷卻中，還要等 ${remain} 秒` };
    }

    const table = getDropTable(spotId, spotState.level);
    if (table.length === 0) return { success: false, reason: '這個採集點目前沒有可採集的物品' };

    const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let resourceId = table[table.length - 1].resource; // fallback
    for (const entry of table) {
      if (roll < entry.weight) {
        resourceId = entry.resource;
        break;
      }
      roll -= entry.weight;
    }

    GameState.addResource(resourceId, MANUAL_GATHER_AMOUNT);
    spotState.lastManualGatherAt = now;

    return { success: true, resourceId, amount: MANUAL_GATHER_AMOUNT };
  }

  function getManualGatherCooldownRemaining(spotId) {
    const state = GameState.get();
    const spotState = state.spots[spotId];
    if (!spotState || !spotState.lastManualGatherAt) return 0;
    const remainMs = MANUAL_GATHER_COOLDOWN_MS - (Date.now() - spotState.lastManualGatherAt);
    return Math.max(0, Math.ceil(remainMs / 1000));
  }

  return {
    calcBuildingProduction, calcAllProduction, applyProduction,
    manualGather, getManualGatherCooldownRemaining, getDropTable,
    MANUAL_GATHER_COOLDOWN_MS
  };
})();

if (typeof module !== 'undefined') {
  module.exports = { Gathering };
}
