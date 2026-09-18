// crafting.js
// 加工佇列管理：開始加工、檢查完成、離線/在線都用同一套「時間戳比對」邏輯

const Crafting = (function () {

  // 開始一個加工工作：檢查材料是否足夠、建築是否已蓋，扣除材料、加入佇列
  function startCrafting(spotId, recipeId) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return { success: false, reason: '找不到配方' };

    if (!GameState.hasBuilding(spotId, recipe.building)) {
      return { success: false, reason: '尚未建造對應建築' };
    }

    if (!GameState.hasResources(recipe.input)) {
      return { success: false, reason: '材料不足' };
    }

    GameState.spendResources(recipe.input);

    const now = Date.now();
    const job = {
      recipeId,
      spotId,
      startTime: now,
      endTime: now + recipe.duration * 1000
    };

    GameState.get().craftingQueue.push(job);
    return { success: true, job };
  }

  // 特殊配方：output 為 null 時（例如未鑑定礦石），由這裡決定隨機結果
  function resolveSpecialOutput(recipeId) {
    if (recipeId === 'sort_unidentified_ore') {
      const pool = [
        { resource: 'iron_ore', weight: 40 },
        { resource: 'copper_ore', weight: 30 },
        { resource: 'silver_ore', weight: 15 },
        { resource: 'gold_ore', weight: 8 },
        { resource: 'crystal', weight: 4 },
        { resource: 'mithril', weight: 2 },
        { resource: 'diamond', weight: 1 }
      ];
      const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      let roll = Math.random() * totalWeight;
      for (const p of pool) {
        if (roll < p.weight) return { [p.resource]: 1 };
        roll -= p.weight;
      }
      return { iron_ore: 1 }; // fallback
    }
    return {};
  }

  // 檢查佇列，把已到時間的工作完成並發放產物；回傳完成了哪些工作（供 UI 顯示通知）
  function processQueue(now) {
    now = now || Date.now();
    const state = GameState.get();
    const completed = [];
    const stillPending = [];

    state.craftingQueue.forEach(job => {
      if (job.endTime <= now) {
        const recipe = RECIPES[job.recipeId];
        const output = recipe.output || resolveSpecialOutput(job.recipeId);
        Object.entries(output).forEach(([resId, amt]) => {
          GameState.addResource(resId, amt);
        });
        completed.push(job);
      } else {
        stillPending.push(job);
      }
    });

    state.craftingQueue = stillPending;
    return completed;
  }

  return { startCrafting, processQueue };
})();

if (typeof module !== 'undefined') {
  module.exports = { Crafting };
}
