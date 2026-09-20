// dropTables.js
// 每個採集點在各等級下，「徒手採集」能拿到什麼、機率是多少（單位：百分比，同一等級加總 = 100）
// 設計原則：
//   - Lv.1 只開放少數「基礎建設材料」，機率集中，前期不會採到一堆用不到的雜項
//   - 每升一級，開放新的物品種類，原本物品的機率會下降（因為選項變多了）
//   - 但因為採集點等級同時提高「自動生產」的產量倍率（見 SPOT_LEVELS），
//     實際「拿到的數量」還是持續增加的，只是「拿到特定單一物品的機率」被稀釋
//   - 每個等級的物件會標明它是第幾級「新解鎖」的，方便畫面顯示

const DROP_TABLES = {
  forest: {
    1: [
      { resource: 'branch',  weight: 35 },
      { resource: 'stone_f', weight: 30 },
      { resource: 'fiber_f', weight: 20 },
      { resource: 'wood',    weight: 15 }
    ],
    2: [
      { resource: 'branch',  weight: 25 },
      { resource: 'stone_f', weight: 20 },
      { resource: 'fiber_f', weight: 15 },
      { resource: 'wood',    weight: 15 },
      { resource: 'herb',    weight: 15, newAtLevel: 2 },
      { resource: 'mushroom',weight: 10, newAtLevel: 2 }
    ],
    3: [
      { resource: 'branch',  weight: 18 },
      { resource: 'stone_f', weight: 15 },
      { resource: 'fiber_f', weight: 12 },
      { resource: 'wood',    weight: 13 },
      { resource: 'herb',    weight: 11 },
      { resource: 'mushroom',weight: 8 },
      { resource: 'hide',    weight: 13, newAtLevel: 3 },
      { resource: 'bone_f',  weight: 10, newAtLevel: 3 }
    ],
    4: [
      { resource: 'branch',  weight: 14 },
      { resource: 'stone_f', weight: 12 },
      { resource: 'fiber_f', weight: 9 },
      { resource: 'wood',    weight: 11 },
      { resource: 'herb',    weight: 9 },
      { resource: 'mushroom',weight: 6 },
      { resource: 'hide',    weight: 10 },
      { resource: 'bone_f',  weight: 8 },
      { resource: 'meat',    weight: 12, newAtLevel: 4 },
      { resource: 'blood_f', weight: 9, newAtLevel: 4 }
    ],
    5: [
      { resource: 'branch',  weight: 15 },
      { resource: 'stone_f', weight: 12 },
      { resource: 'fiber_f', weight: 10 },
      { resource: 'wood',    weight: 12 },
      { resource: 'herb',    weight: 9 },
      { resource: 'mushroom',weight: 6 },
      { resource: 'hide',    weight: 10 },
      { resource: 'bone_f',  weight: 8 },
      { resource: 'meat',    weight: 9 },
      { resource: 'blood_f', weight: 6 },
      { resource: 'bird_egg',weight: 3, newAtLevel: 5 }
    ]
  },

  beach: {
    1: [
      { resource: 'sand',    weight: 35 },
      { resource: 'salt',    weight: 25 },
      { resource: 'fish',    weight: 25 },
      { resource: 'stone_f', weight: 15 }
    ],
    2: [
      { resource: 'sand',    weight: 25 },
      { resource: 'salt',    weight: 18 },
      { resource: 'fish',    weight: 18 },
      { resource: 'stone_f', weight: 12 },
      { resource: 'seaweed', weight: 15, newAtLevel: 2 },
      { resource: 'bone_b',  weight: 12, newAtLevel: 2 }
    ],
    3: [
      { resource: 'sand',    weight: 18 },
      { resource: 'salt',    weight: 13 },
      { resource: 'fish',    weight: 13 },
      { resource: 'stone_f', weight: 9 },
      { resource: 'seaweed', weight: 11 },
      { resource: 'bone_b',  weight: 9 },
      { resource: 'coral',   weight: 12, newAtLevel: 3 },
      { resource: 'shrimp',  weight: 9, newAtLevel: 3 },
      { resource: 'crab',    weight: 6, newAtLevel: 3 }
    ],
    4: [
      { resource: 'sand',      weight: 14 },
      { resource: 'salt',      weight: 10 },
      { resource: 'fish',      weight: 10 },
      { resource: 'stone_f',   weight: 7 },
      { resource: 'seaweed',   weight: 9 },
      { resource: 'bone_b',    weight: 7 },
      { resource: 'coral',     weight: 11 },
      { resource: 'shrimp',    weight: 8 },
      { resource: 'crab',      weight: 5 },
      { resource: 'oyster',    weight: 10, newAtLevel: 4 },
      { resource: 'octopus',   weight: 9, newAtLevel: 4 }
    ],
    5: [
      { resource: 'sand',       weight: 16 },
      { resource: 'salt',       weight: 8 },
      { resource: 'fish',       weight: 8 },
      { resource: 'stone_f',    weight: 6 },
      { resource: 'seaweed',    weight: 7 },
      { resource: 'bone_b',     weight: 6 },
      { resource: 'coral',      weight: 9 },
      { resource: 'shrimp',     weight: 6 },
      { resource: 'crab',       weight: 4 },
      { resource: 'oyster',     weight: 8 },
      { resource: 'octopus',    weight: 7 },
      { resource: 'sea_urchin', weight: 6, newAtLevel: 5 },
      { resource: 'lobster',    weight: 5, newAtLevel: 5 },
      { resource: 'pearl',      weight: 4, newAtLevel: 5 }
    ]
  },

  mine: {
    1: [
      { resource: 'coal',       weight: 40 },
      { resource: 'iron_ore',   weight: 32 },
      { resource: 'copper_ore', weight: 28 }
    ],
    2: [
      { resource: 'coal',             weight: 28 },
      { resource: 'iron_ore',         weight: 22 },
      { resource: 'copper_ore',       weight: 20 },
      { resource: 'silver_ore',       weight: 12, newAtLevel: 2 },
      { resource: 'tin_ore',          weight: 10, newAtLevel: 2 },
      { resource: 'unidentified_ore', weight: 8, newAtLevel: 2 }
    ],
    3: [
      { resource: 'coal',             weight: 20 },
      { resource: 'iron_ore',         weight: 17 },
      { resource: 'copper_ore',       weight: 15 },
      { resource: 'silver_ore',       weight: 11 },
      { resource: 'tin_ore',          weight: 9 },
      { resource: 'unidentified_ore', weight: 8 },
      { resource: 'sulfur',           weight: 12, newAtLevel: 3 },
      { resource: 'agate',            weight: 8, newAtLevel: 3 }
    ],
    4: [
      { resource: 'coal',             weight: 15 },
      { resource: 'iron_ore',         weight: 13 },
      { resource: 'copper_ore',       weight: 12 },
      { resource: 'silver_ore',       weight: 9 },
      { resource: 'tin_ore',          weight: 8 },
      { resource: 'unidentified_ore', weight: 7 },
      { resource: 'sulfur',           weight: 10 },
      { resource: 'agate',            weight: 7 },
      { resource: 'gold_ore',         weight: 11, newAtLevel: 4 },
      { resource: 'crystal',          weight: 8, newAtLevel: 4 }
    ],
    5: [
      { resource: 'coal',             weight: 17 },
      { resource: 'iron_ore',         weight: 10 },
      { resource: 'copper_ore',       weight: 9 },
      { resource: 'silver_ore',       weight: 7 },
      { resource: 'tin_ore',          weight: 6 },
      { resource: 'unidentified_ore', weight: 6 },
      { resource: 'sulfur',           weight: 8 },
      { resource: 'agate',            weight: 6 },
      { resource: 'gold_ore',         weight: 9 },
      { resource: 'crystal',          weight: 7 },
      { resource: 'mithril',          weight: 6, newAtLevel: 5 },
      { resource: 'magic_stone',      weight: 5, newAtLevel: 5 },
      { resource: 'diamond',          weight: 4, newAtLevel: 5 }
    ]
  },

  plains: {
    1: [
      { resource: 'fiber_p', weight: 30 },
      { resource: 'feather', weight: 28 },
      { resource: 'wheat',   weight: 24 },
      { resource: 'chicken', weight: 18 }
    ],
    2: [
      { resource: 'fiber_p', weight: 22 },
      { resource: 'feather', weight: 20 },
      { resource: 'wheat',   weight: 18 },
      { resource: 'chicken', weight: 14 },
      { resource: 'corn',    weight: 15, newAtLevel: 2 },
      { resource: 'bone_p',  weight: 11, newAtLevel: 2 }
    ],
    3: [
      { resource: 'fiber_p',      weight: 16 },
      { resource: 'feather',      weight: 15 },
      { resource: 'wheat',        weight: 14 },
      { resource: 'chicken',      weight: 10 },
      { resource: 'corn',         weight: 12 },
      { resource: 'bone_p',       weight: 9 },
      { resource: 'tomato',       weight: 14, newAtLevel: 3 },
      { resource: 'unknown_seed', weight: 10, newAtLevel: 3 }
    ],
    4: [
      { resource: 'fiber_p',      weight: 13 },
      { resource: 'feather',      weight: 12 },
      { resource: 'wheat',        weight: 11 },
      { resource: 'chicken',      weight: 8 },
      { resource: 'corn',         weight: 10 },
      { resource: 'bone_p',       weight: 7 },
      { resource: 'tomato',       weight: 11 },
      { resource: 'unknown_seed', weight: 8 },
      { resource: 'pumpkin',      weight: 12, newAtLevel: 4 },
      { resource: 'blood_p',      weight: 8, newAtLevel: 4 }
    ],
    5: [
      { resource: 'fiber_p',          weight: 11 },
      { resource: 'feather',          weight: 10 },
      { resource: 'wheat',            weight: 9 },
      { resource: 'chicken',          weight: 7 },
      { resource: 'corn',             weight: 8 },
      { resource: 'bone_p',           weight: 6 },
      { resource: 'tomato',           weight: 9 },
      { resource: 'unknown_seed',     weight: 7 },
      { resource: 'pumpkin',          weight: 10 },
      { resource: 'blood_p',          weight: 7 },
      { resource: 'wild_berry',       weight: 11, newAtLevel: 5 },
      { resource: 'four_leaf_clover', weight: 5, newAtLevel: 5 }
    ]
  }
};

if (typeof module !== 'undefined') {
  module.exports = { DROP_TABLES };
}
