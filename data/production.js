// production.js
// 每個「採集型」建築每一輪（PRODUCTION_INTERVAL_SECONDS，目前是10秒）的基礎產出量。
// 這裡的數字都是「建築等級 Lv.1」時、每輪產出的整數個數。
// 建築升級後，實際產出 = 基礎產出 x 建築等級（一樣是整數，不會出現 1.3 個這種情況）。
// 例如 lumber_camp 的 wood:2，Lv.1 每輪 2 個，Lv.2 每輪 4 個，Lv.3 每輪 6 個...

const BUILDING_PRODUCTION = {
  // ===== 森林 =====
  lumber_camp:   { wood: 2, branch: 1 },
  hunting_lodge: { meat: 1, hide: 1 },
  herb_garden:   { herb: 1, mushroom: 1 },

  // ===== 海灘 =====
  fishing_port:  { fish: 2, bone_b: 1 },
  salt_farm:     { salt: 2, sand: 1 },
  pearl_farm:    { coral: 1, oyster: 1 },
  shipyard:      { seaweed: 1 },

  // ===== 礦山 =====
  mine_shaft:    { coal: 2, iron_ore: 1, copper_ore: 1 },

  // ===== 平原 =====
  farmland:      { wheat: 2, corn: 1 },
  chicken_coop:  { chicken: 1, feather: 1 }
};

// 進階採集建築的「稀有資源」加成：每輪有 chance（機率）額外掉落，
// 機率會隨建築等級提高（chance x 建築等級），期望值計算方式跟基礎產出邏輯一致
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
