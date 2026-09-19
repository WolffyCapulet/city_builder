// buildings.js
// 每個採集點可蓋的建築：分成「初階(採集強化)」與「進階(加工)」兩類
// type: 'gathering' = 強化採集點本身產出
//       'processing' = 加工建築，對應 recipes.js 裡的配方
// cost: 建造所需的資源（一次性消耗）。初階建築的成本刻意設計成
//       可以透過「徒手採集」湊到，讓玩家一開始沒有任何建築也能慢慢起步。

const BUILDINGS = {
  // ===== 森林 =====
  lumber_camp:   { id: 'lumber_camp',   name: '伐木場',   spot: 'forest', type: 'gathering',  icon: '🪓', unlockLevel: 1, cost: { branch: 15, stone_f: 5 } },
  hunting_lodge: { id: 'hunting_lodge', name: '狩獵小屋', spot: 'forest', type: 'gathering',  icon: '🏹', unlockLevel: 1, cost: { branch: 12, fiber_f: 8 } },
  herb_garden:   { id: 'herb_garden',   name: '草藥園',   spot: 'forest', type: 'gathering',  icon: '🌿', unlockLevel: 2, cost: { wood: 15, fiber_f: 10 } },
  sawmill:       { id: 'sawmill',       name: '製材廠',   spot: 'forest', type: 'processing', icon: '🏭', unlockLevel: 2, cost: { wood: 30, stone_f: 15 } },
  tannery:       { id: 'tannery',       name: '製皮坊',   spot: 'forest', type: 'processing', icon: '🧵', unlockLevel: 3, cost: { wood: 25, hide: 5 } },
  alchemy_hut:   { id: 'alchemy_hut',   name: '煉藥屋',   spot: 'forest', type: 'processing', icon: '⚗️', unlockLevel: 3, cost: { wood: 25, herb: 5 } },

  // ===== 海灘 =====
  fishing_port:  { id: 'fishing_port',  name: '漁港',     spot: 'beach', type: 'gathering',  icon: '🎣', unlockLevel: 1, cost: { wood: 15, sand: 10 } },
  salt_farm:     { id: 'salt_farm',     name: '鹽田',     spot: 'beach', type: 'gathering',  icon: '🧂', unlockLevel: 1, cost: { wood: 10, sand: 15 } },
  pearl_farm:    { id: 'pearl_farm',    name: '珍珠養殖場', spot: 'beach', type: 'gathering', icon: '💠', unlockLevel: 3, cost: { wood: 40, coral: 10 } },
  shipyard:      { id: 'shipyard',      name: '造船廠',   spot: 'beach', type: 'gathering',  icon: '⛵', unlockLevel: 4, cost: { wood: 60, plank: 20 } },
  glass_workshop:{ id: 'glass_workshop',name: '玻璃工坊', spot: 'beach', type: 'processing', icon: '🧊', unlockLevel: 2, cost: { wood: 25, sand: 15 } },
  jewelry_shop:  { id: 'jewelry_shop',  name: '珠寶坊',   spot: 'beach', type: 'processing', icon: '💍', unlockLevel: 4, cost: { wood: 50, gold_ingot: 5 } },

  // ===== 礦山 =====
  mine_shaft:    { id: 'mine_shaft',    name: '礦坑',     spot: 'mine', type: 'gathering',  icon: '⛏️', unlockLevel: 1, cost: { wood: 20, stone_f: 15 } },
  ore_sorter:    { id: 'ore_sorter',    name: '選礦場',   spot: 'mine', type: 'processing', icon: '🔍', unlockLevel: 2, cost: { wood: 30, iron_ore: 10 } },
  furnace:       { id: 'furnace',       name: '熔爐',     spot: 'mine', type: 'processing', icon: '🔥', unlockLevel: 2, cost: { wood: 35, stone_f: 20 } },
  gem_workshop:  { id: 'gem_workshop',  name: '寶石加工坊', spot: 'mine', type: 'processing', icon: '💎', unlockLevel: 4, cost: { wood: 60, crystal: 5 } },

  // ===== 平原 =====
  farmland:      { id: 'farmland',      name: '農田',     spot: 'plains', type: 'gathering',  icon: '🌾', unlockLevel: 1, cost: { wood: 15, fiber_p: 10 } },
  chicken_coop:  { id: 'chicken_coop',  name: '雞舍',     spot: 'plains', type: 'gathering',  icon: '🐔', unlockLevel: 1, cost: { wood: 15, feather: 10 } },
  irrigation:    { id: 'irrigation',    name: '灌溉系統', spot: 'plains', type: 'gathering',  icon: '💧', unlockLevel: 3, cost: { wood: 40, stone_f: 20 } },
  granary:       { id: 'granary',       name: '穀倉',     spot: 'plains', type: 'gathering',  icon: '🏚️', unlockLevel: 2, cost: { wood: 30, plank: 10 } },
  mill:          { id: 'mill',          name: '磨坊',     spot: 'plains', type: 'processing', icon: '🌀', unlockLevel: 2, cost: { wood: 25, stone_f: 15 } },
  tailor_shop:   { id: 'tailor_shop',   name: '裁縫坊',   spot: 'plains', type: 'processing', icon: '🧵', unlockLevel: 3, cost: { wood: 30, leather: 5 } }
};

if (typeof module !== 'undefined') {
  module.exports = { BUILDINGS };
}
