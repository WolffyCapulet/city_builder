// gathering.js
// 計算已蓋建築在一段時間內的產出（online tick 跟 offline 結算都呼叫同一套邏輯）

const Gathering = (function () {

  const MAX_BUILDING_LEVEL = 5;

  // 計算單一採集點、單一建築在 elapsedSeconds 秒內的產出
  // 產量 = 基礎產出(整數) x 建築自己的等級(整數) x 經過幾輪生產週期
  // 「建築等級」跟「採集點等級」是分開的兩件事：
  //   - 建築等級：決定這個建築本身產多少（整數倍，不會有 1.3 個這種情況）
  //   - 採集點等級：只決定解鎖哪些新建築、以及徒手採集的機率表
  // 回傳 { resourceId: amount, ... }
  function calcBuildingProduction(spotId, buildingId, elapsedSeconds) {
    const production = BUILDING_PRODUCTION[buildingId];
    if (!production) return {};

    const buildingLevel = GameState.getBuildingLevel(spotId, buildingId) || 1;
    const cycles = elapsedSeconds / GameLoop.PRODUCTION_INTERVAL_SECONDS; // 允許小數（離線結算用）

    const result = {};
    Object.entries(production).forEach(([resId, baseAmountPerCycle]) => {
      result[resId] = baseAmountPerCycle * buildingLevel * cycles;
    });

    // 稀有掉落判定：機率隨建築等級提高（期望值計算，允許小數，這是機率的概念不是實體個數）
    const rareTable = RARE_DROP_TABLE[buildingId];
    if (rareTable) {
      rareTable.forEach(entry => {
        const expectedAmount = entry.chance * buildingLevel * cycles;
        result[entry.resource] = (result[entry.resource] || 0) + expectedAmount;
      });
    }

    return result;
  }

  // 建築升級所需資源：以建築原本的建造成本為基準，乘上「目前等級」
  // （例如原本建造要 branch x15，從 Lv.1 升到 Lv.2 就要 branch x15，Lv.2 升到 Lv.3 要 branch x30...）
  function getBuildingUpgradeCost(buildingId, currentLevel) {
    const buildingDef = BUILDINGS[buildingId];
    if (!buildingDef || !buildingDef.cost) return {};
    const cost = {};
    Object.entries(buildingDef.cost).forEach(([resId, amt]) => {
      cost[resId] = amt * currentLevel;
    });
    return cost;
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
  // 有冷卻時間避免瘋狂連點洗資源，同時會消耗體力、獲得經驗值
  const MANUAL_GATHER_COOLDOWN_MS = 3000;
  const MANUAL_GATHER_AMOUNT = 1;
  const MANUAL_GATHER_STAMINA_COST = 1;
  const MANUAL_GATHER_EXP_GAIN = 3;

  // 人物等級加成：等級每高 1 級，「該等級才解鎖」的進階物品權重提高 5%
  // （原本 Lv.1 就有的基礎物品不受影響），讓練等之後徒手採集比較容易拿到好東西
  const CHARACTER_BONUS_PER_LEVEL = 0.05;

  function getCharacterRarityMultiplier() {
    const level = GameState.get().character.level;
    return 1 + (level - 1) * CHARACTER_BONUS_PER_LEVEL;
  }

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

  // 套用人物等級加成後的「有效權重表」：newAtLevel > 1 的進階物品權重會被放大
  // 回傳 [{ resource, effectiveWeight, baseWeight, newAtLevel }]，供實際抽取跟畫面顯示共用
  function getEffectiveDropTable(spotId, level) {
    const table = getDropTable(spotId, level);
    const bonusMultiplier = getCharacterRarityMultiplier();

    return table.map(entry => {
      const isAdvanced = !!entry.newAtLevel && entry.newAtLevel > 1;
      const effectiveWeight = isAdvanced ? entry.weight * bonusMultiplier : entry.weight;
      return {
        resource: entry.resource,
        baseWeight: entry.weight,
        effectiveWeight,
        newAtLevel: entry.newAtLevel
      };
    });
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

    if (!GameState.spendStamina(MANUAL_GATHER_STAMINA_COST)) {
      return { success: false, reason: '體力不足，等待恢復或吃東西補充體力吧' };
    }

    const table = getEffectiveDropTable(spotId, spotState.level);
    if (table.length === 0) return { success: false, reason: '這個採集點目前沒有可採集的物品' };

    const totalWeight = table.reduce((sum, e) => sum + e.effectiveWeight, 0);
    let roll = Math.random() * totalWeight;
    let resourceId = table[table.length - 1].resource; // fallback
    for (const entry of table) {
      if (roll < entry.effectiveWeight) {
        resourceId = entry.resource;
        break;
      }
      roll -= entry.effectiveWeight;
    }

    GameState.addResource(resourceId, MANUAL_GATHER_AMOUNT);
    GameState.addExp(MANUAL_GATHER_EXP_GAIN);
    spotState.lastManualGatherAt = now;

    return { success: true, resourceId, amount: MANUAL_GATHER_AMOUNT, expGained: MANUAL_GATHER_EXP_GAIN };
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
    getEffectiveDropTable, getCharacterRarityMultiplier,
    getBuildingUpgradeCost, MAX_BUILDING_LEVEL,
    MANUAL_GATHER_COOLDOWN_MS, MANUAL_GATHER_STAMINA_COST
  };
})();

if (typeof module !== 'undefined') {
  module.exports = { Gathering };
}
