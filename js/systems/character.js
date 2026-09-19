// character.js
// 處理體力自動回復（每 5 秒 +1）與進食恢復體力

const Character = (function () {
  const STAMINA_REGEN_INTERVAL_SECONDS = 5;
  const STAMINA_REGEN_AMOUNT = 1;

  // 由 GameLoop 每秒呼叫一次，內部自己控制「每 5 秒才真的回復」的節奏
  let regenCounter = 0;
  function tickRegen() {
    regenCounter++;
    if (regenCounter >= STAMINA_REGEN_INTERVAL_SECONDS) {
      GameState.addStamina(STAMINA_REGEN_AMOUNT);
      regenCounter = 0;
    }
  }

  function getRegenProgress() {
    return Math.floor((regenCounter / STAMINA_REGEN_INTERVAL_SECONDS) * 100);
  }

  // 吃掉一個食物，恢復對應體力
  function eatFood(resourceId) {
    const foodDef = FOOD_ITEMS[resourceId];
    if (!foodDef) return { success: false, reason: '這個東西不能吃' };

    if (!GameState.spendResources({ [resourceId]: 1 })) {
      return { success: false, reason: '沒有這個食物了' };
    }

    GameState.addStamina(foodDef.staminaRestore);
    return { success: true, staminaRestored: foodDef.staminaRestore };
  }

  return { tickRegen, getRegenProgress, eatFood, STAMINA_REGEN_INTERVAL_SECONDS };
})();

if (typeof module !== 'undefined') {
  module.exports = { Character };
}
