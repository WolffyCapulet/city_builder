// gatheringSpots.js
// 四個採集點的基本設定與等級表
//
// 重要：採集點等級「只」決定兩件事——
//   1. 解鎖哪些新建築（buildings.js 裡的 unlockLevel）
//   2. 徒手採集的機率表用哪一級（dropTables.js）
// 採集點等級完全不影響「已建成建築」的自動產量——那是建築自己的等級決定的
// （整數倍，見 production.js 與 gathering.js），所以這裡不再放
// quantityMultiplier / rarityBonus 這種模糊倍率欄位。

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
    description: '海產資源豐富的沙岸地帶。',
    resourcePool: [
      'fish', 'salt', 'sand', 'seaweed', 'stone_f', 'coral',
      'bone_b', 'shrimp', 'crab', 'oyster',
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
    description: '適合種植與畜牧的開闊草原，分成「種植」與「畜牧」兩個系統。',
    resourcePool: [
      'chicken', 'feather', 'bone_p', 'fiber_p', 'unknown_seed',
      'blood_p', 'wheat', 'corn', 'tomato', 'pumpkin',
      'wild_berry', 'four_leaf_clover'
    ]
  }
};

// 採集點升級表：只花資源升級，用來解鎖新建築與提高徒手採集機率表等級
const SPOT_LEVELS = [
  { level: 1, upgradeCost: { wood: 20, stone_f: 10 } },
  { level: 2, upgradeCost: { wood: 50, stone_f: 30 } },
  { level: 3, upgradeCost: { wood: 100, stone_f: 60 } },
  { level: 4, upgradeCost: { wood: 200, stone_f: 120 } },
  { level: 5, upgradeCost: { wood: 400, stone_f: 240 } }
  // 之後可以繼續往下擴充等級
];

if (typeof module !== 'undefined') {
  module.exports = { GATHERING_SPOTS, SPOT_LEVELS };
}
