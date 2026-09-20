// shop.js
// 商店（市集建築解鎖）的買賣價格設定：純資料，邏輯在 js/systems/shop.js

const SELL_PRICE_BY_RARITY = {
  common: 1,
  uncommon: 3,
  rare: 8,
  legendary: 20
};

// 可以「買入」的資源清單（只開放基礎建材，避免玩家用金幣繞過整個採集/生產系統）
const BUYABLE_RESOURCES = [
  'wood', 'branch', 'stone_f', 'fiber_f', 'sand', 'fiber_p'
];

if (typeof module !== 'undefined') {
  module.exports = { SELL_PRICE_BY_RARITY, BUYABLE_RESOURCES };
}
