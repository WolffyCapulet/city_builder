// gatheringSpots.js
// 四個採集點的基本設定與等級表
// 等級越高：產出數量倍率越高、稀有物品出現機率越高

const GATHERING_SPOTS = {
  forest: {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    description: '盛產木材、藥草與野生動物資源的採集地。',
    resourcePool: [
      'wood', 'branch', 'herb', 'mushroom', 'meat',
      'hide', 'blood_f', 'bone_f', 'stone_f', 'fiber_f', 'bird_egg'
    ]
  },
  beach: {
    id: 'beach',
    name: '海灘',
    icon: '🏖️',
    description: '海產與礦石交界的沙岸地帶。',
    resourcePool: [
      'fish', 'salt', 'sand', 'seaweed', 'stone_b', 'coral',
      'ore_raw_b', 'bone_b', 'shrimp', 'crab', 'oyster',
      'octopus', 'sea_urchin', 'lobster', 'pearl'
    ]
  },
  mine: {
    id: 'mine',
    name: '礦山',
    icon: '⛰️',
    description: '蘊藏各種礦石與寶石的地下礦脈。',
    resourcePool: [
      'coal', 'iron_ore', 'copper_ore', 'silver_ore', 'tin_ore',
      'sulfur', 'gold_ore', 'crystal', 'agate', 'mithril',
      'magic_stone', 'diamond', 'unidentified_ore'
    ]
  },
  plains: {
    id: 'plains',
    name: '平原',
    icon: '🌾',
    description: '適合放牧與種植的開闊草原。',
    resourcePool: [
      'chicken', 'feather', 'bone_p', 'fiber_p', 'unknown_seed',
      'blood_p', 'wheat', 'corn', 'tomato', 'pumpkin',
      'wild_berry', 'four_leaf_clover'
    ]
  }
};

// 通用等級表：每個採集點共用同一套等級成長曲線（可依需求各自覆寫）
// quantityMultiplier：產出數量倍率
// rarityBonus：稀有物品出現機率加成（百分比）
// upgradeCost：升級到「下一級」所需資源（示意，可自行調整資源種類）
const SPOT_LEVELS = [
  { level: 1, quantityMultiplier: 1.0, rarityBonus: 0,  upgradeCost: { wood: 20, stone_f: 10 } },
  { level: 2, quantityMultiplier: 1.3, rarityBonus: 5,  upgradeCost: { wood: 50, stone_f: 30 } },
  { level: 3, quantityMultiplier: 1.6, rarityBonus: 10, upgradeCost: { wood: 100, stone_f: 60 } },
  { level: 4, quantityMultiplier: 2.0, rarityBonus: 15, upgradeCost: { wood: 200, stone_f: 120 } },
  { level: 5, quantityMultiplier: 2.5, rarityBonus: 20, upgradeCost: { wood: 400, stone_f: 240 } }
  // 之後可以繼續往下擴充等級
];

if (typeof module !== 'undefined') {
  module.exports = { GATHERING_SPOTS, SPOT_LEVELS };
}
