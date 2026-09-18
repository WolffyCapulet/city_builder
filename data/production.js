// production.js
// 每個「採集型」建築的基礎生產速率（單位：每秒產出多少個資源，未套用等級倍率）
// 加工型建築不在這裡定義，加工邏輯走 recipes.js + crafting 系統

const BUILDING_PRODUCTION = {
  // ===== 森林 =====
  lumber_camp:   { wood: 0.1, branch: 0.03 },
  hunting_lodge: { meat: 0.05, hide: 0.04, bone_f: 0.03, blood_f: 0.02 },
  herb_garden:   { herb: 0.06, mushroom: 0.05, bird_egg: 0.02 },

  // ===== 海灘 =====
  fishing_port:  { fish: 0.1, bone_b: 0.02, shrimp: 0.04, crab: 0.02 },
  salt_farm:     { salt: 0.08, sand: 0.05 },
  pearl_farm:    { pearl: 0.005, oyster: 0.03, coral: 0.02 },
  shipyard:      { seaweed: 0.05, sea_urchin: 0.01, lobster: 0.005 },

  // ===== 礦山 =====
  mine_shaft:    { coal: 0.06, iron_ore: 0.05, copper_ore: 0.05, stone_f: 0.04 },

  // ===== 平原 =====
  farmland:      { wheat: 0.08, corn: 0.06, tomato: 0.05, pumpkin: 0.02, wild_berry: 0.02 },
  chicken_coop:  { chicken: 0.04, feather: 0.06, bone_p: 0.02 }
};

// 進階採集建築的「稀有資源」加成（解鎖後才會額外掉落，機率型，交由 gathering.js 判斷）
const RARE_DROP_TABLE = {
  mine_shaft: [
    { resource: 'silver_ore', chance: 0.05 },
    { resource: 'tin_ore', chance: 0.05 },
    { resource: 'sulfur', chance: 0.03 },
    { resource: 'gold_ore', chance: 0.01 },
    { resource: 'crystal', chance: 0.005 },
    { resource: 'unidentified_ore', chance: 0.02 }
  ],
  pearl_farm: [
    { resource: 'pearl', chance: 0.02 }
  ],
  farmland: [
    { resource: 'four_leaf_clover', chance: 0.005 },
    { resource: 'unknown_seed', chance: 0.02 }
  ]
};

if (typeof module !== 'undefined') {
  module.exports = { BUILDING_PRODUCTION, RARE_DROP_TABLE };
}
