// shop.js (system)
// 商店買賣邏輯：需要先建造「市集」才能使用

const Shop = (function () {

  function isUnlocked() {
    return GameState.hasBuilding('plains', 'market');
  }

  function getSellPrice(resourceId) {
    const def = RESOURCES[resourceId];
    if (!def) return 0;
    return SELL_PRICE_BY_RARITY[def.rarity] || 1;
  }

  function getBuyPrice(resourceId) {
    return getSellPrice(resourceId) * 3;
  }

  // 賣出 amount 個 resourceId，換成金幣
  function sell(resourceId, amount) {
    if (!isUnlocked()) return { success: false, reason: '尚未建造市集，無法使用商店功能' };

    const state = GameState.get();
    const owned = Math.floor(state.resources[resourceId] || 0);
    if (owned < amount) return { success: false, reason: '沒有足夠的數量可以賣' };

    const price = getSellPrice(resourceId);
    const totalGold = price * amount;

    GameState.removeResource(resourceId, amount);
    state.gold = (state.gold || 0) + totalGold;

    return { success: true, goldGained: totalGold };
  }

  // 用金幣買 amount 個 resourceId（只限 BUYABLE_RESOURCES 清單內的基礎建材）
  function buy(resourceId, amount) {
    if (!isUnlocked()) return { success: false, reason: '尚未建造市集，無法使用商店功能' };
    if (BUYABLE_RESOURCES.indexOf(resourceId) === -1) {
      return { success: false, reason: '市集不販售這個物品' };
    }

    const state = GameState.get();
    const price = getBuyPrice(resourceId);
    const totalCost = price * amount;

    if ((state.gold || 0) < totalCost) {
      return { success: false, reason: '金幣不足' };
    }

    state.gold -= totalCost;
    GameState.addResource(resourceId, amount);

    return { success: true, goldSpent: totalCost };
  }

  return { isUnlocked, getSellPrice, getBuyPrice, sell, buy };
})();

if (typeof module !== 'undefined') {
  module.exports = { Shop };
}
