// food.js
// 可以「食用」來恢復體力的物品清單（原始食材與加工食品都算）
// staminaRestore：吃一個可以恢復多少體力

const FOOD_ITEMS = {
  // 原始食材（可以直接生食，恢復量較低）
  fish:       { staminaRestore: 3 },
  meat:       { staminaRestore: 4 },
  chicken:    { staminaRestore: 3 },
  mushroom:   { staminaRestore: 2 },
  tomato:     { staminaRestore: 2 },
  corn:       { staminaRestore: 2 },
  wild_berry: { staminaRestore: 2 },
  bird_egg:   { staminaRestore: 3 },
  shrimp:     { staminaRestore: 2 },
  crab:       { staminaRestore: 3 },
  oyster:     { staminaRestore: 3 },
  octopus:    { staminaRestore: 4 },
  lobster:    { staminaRestore: 5 },

  // 加工食品（經過處理，恢復量較高）
  flour:      { staminaRestore: 5 },
  feed:       { staminaRestore: 3 },

  // 烹飪料理（用廚房煮出來的，恢復量最高）
  grilled_meat:   { staminaRestore: 10 },
  grilled_fish:   { staminaRestore: 9 },
  vegetable_stew: { staminaRestore: 12 },
  bread:          { staminaRestore: 7 },
  seafood_soup:   { staminaRestore: 15 }
};

if (typeof module !== 'undefined') {
  module.exports = { FOOD_ITEMS };
}
