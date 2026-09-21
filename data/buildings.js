// buildings.js
// type: 'gathering'  = 蓋在特定採集點，強化該採集點本身產出
//       'processing' = 加工建築，對應 recipes.js 裡的配方 —— 全部蓋在「村莊」，不綁特定採集點
//       'shop'       = 商店，也蓋在「村莊」
// spot: 'forest' / 'beach' / 'mine' / 'plains' 是四個採集點；'village' 是村莊（加工/商店專用）
// cost: 建造所需的資源（一次性消耗）。初階建築的成本刻意設計成
//       可以透過「徒手採集」湊到，讓玩家一開始沒有任何建築也能慢慢起步。
// category: 只用來在畫面上分組顯示（平原的種植/畜牧、村莊的加工/烹飪/商店）

const BUILDINGS = {
  // ===== 森林（採集型，蓋在森林）=====
  lumber_camp:   { id: 'lumber_camp',   name: '伐木場',   spot: 'forest', type: 'gathering',  icon: '🪓', unlockLevel: 1, cost: { branch: 15, stone_f: 5 } },
  hunting_lodge: { id: 'hunting_lodge', name: '狩獵小屋', spot: 'forest', type: 'gathering',  icon: '🏹', unlockLevel: 1, cost: { branch: 12, fiber_f: 8 } },
  herb_garden:   { id: 'herb_garden',   name: '草藥園',   spot: 'forest', type: 'gathering',  icon: '🌿', unlockLevel: 2, cost: { wood: 15, fiber_f: 10 } },

  // ===== 海灘（採集型，蓋在海灘）=====
  fishing_port:  { id: 'fishing_port',  name: '漁港',     spot: 'beach', type: 'gathering',  icon: '🎣', unlockLevel: 1, cost: { wood: 15, sand: 10 } },
  salt_farm:     { id: 'salt_farm',     name: '鹽田',     spot: 'beach', type: 'gathering',  icon: '🧂', unlockLevel: 1, cost: { wood: 10, sand: 15 } },
  pearl_farm:    { id: 'pearl_farm',    name: '珍珠養殖場', spot: 'beach', type: 'gathering', icon: '💠', unlockLevel: 3, cost: { wood: 40, coral: 10 } },
  shipyard:      { id: 'shipyard',      name: '造船廠',   spot: 'beach', type: 'gathering',  icon: '⛵', unlockLevel: 4, cost: { wood: 60, plank: 20 } },

  // ===== 礦山（採集型，蓋在礦山）=====
  mine_shaft:    { id: 'mine_shaft',    name: '礦坑',     spot: 'mine', type: 'gathering',  icon: '⛏️', unlockLevel: 1, cost: { wood: 20, stone_f: 15 } },

  // ===== 平原（採集型：種植/畜牧，蓋在平原）=====
  farmland:      { id: 'farmland',      name: '農田',     spot: 'plains', type: 'gathering',  icon: '🌾', unlockLevel: 1, cost: { wood: 15, fiber_p: 10 }, category: 'farming' },
  irrigation:    { id: 'irrigation',    name: '灌溉系統', spot: 'plains', type: 'gathering',  icon: '💧', unlockLevel: 3, cost: { wood: 40, stone_f: 20 }, category: 'farming' },
  granary:       { id: 'granary',       name: '穀倉',     spot: 'plains', type: 'gathering',  icon: '🏚️', unlockLevel: 2, cost: { wood: 30, plank: 10 }, category: 'farming' },
  chicken_coop:  { id: 'chicken_coop',  name: '雞舍',     spot: 'plains', type: 'gathering',  icon: '🐔', unlockLevel: 1, cost: { wood: 15, feather: 10 }, category: 'husbandry' },

  // ===== 村莊（加工型 + 商店，全部蓋在這裡，不綁特定採集點）=====
  // 加工建築：unlockLevel 統一設 1（村莊沒有等級系統，只要資源夠就能蓋）
  sawmill:        { id: 'sawmill',        name: '製材廠',   spot: 'village', type: 'processing', icon: '🏭', unlockLevel: 1, cost: { wood: 30, stone_f: 15 }, category: 'processing' },
  tannery:        { id: 'tannery',        name: '製皮坊',   spot: 'village', type: 'processing', icon: '🧵', unlockLevel: 1, cost: { wood: 25, hide: 5 }, category: 'processing' },
  alchemy_hut:    { id: 'alchemy_hut',    name: '煉藥屋',   spot: 'village', type: 'processing', icon: '⚗️', unlockLevel: 1, cost: { wood: 25, herb: 5 }, category: 'processing' },
  glass_workshop: { id: 'glass_workshop', name: '玻璃工坊', spot: 'village', type: 'processing', icon: '🧊', unlockLevel: 1, cost: { wood: 25, sand: 15 }, category: 'processing' },
  jewelry_shop:   { id: 'jewelry_shop',   name: '珠寶坊',   spot: 'village', type: 'processing', icon: '💍', unlockLevel: 1, cost: { wood: 50, gold_ingot: 5 }, category: 'processing' },
  ore_sorter:     { id: 'ore_sorter',     name: '選礦場',   spot: 'village', type: 'processing', icon: '🔍', unlockLevel: 1, cost: { wood: 30, iron_ore: 10 }, category: 'processing' },
  furnace:        { id: 'furnace',        name: '熔爐',     spot: 'village', type: 'processing', icon: '🔥', unlockLevel: 1, cost: { wood: 35, stone_f: 20 }, category: 'processing' },
  gem_workshop:   { id: 'gem_workshop',   name: '寶石加工坊', spot: 'village', type: 'processing', icon: '💎', unlockLevel: 1, cost: { wood: 60, crystal: 5 }, category: 'processing' },
  mill:           { id: 'mill',           name: '磨坊',     spot: 'village', type: 'processing', icon: '🌀', unlockLevel: 1, cost: { wood: 25, stone_f: 15 }, category: 'processing' },
  tailor_shop:    { id: 'tailor_shop',    name: '裁縫坊',   spot: 'village', type: 'processing', icon: '🧵', unlockLevel: 1, cost: { wood: 30, leather: 5 }, category: 'processing' },

  kitchen:        { id: 'kitchen',        name: '廚房',     spot: 'village', type: 'processing', icon: '🍳', unlockLevel: 1, cost: { wood: 25, stone_f: 15 }, category: 'cooking' },

  market:         { id: 'market',         name: '市集',     spot: 'village', type: 'shop',       icon: '🏪', unlockLevel: 1, cost: { wood: 40, stone_f: 20 }, category: 'shop' }
};

if (typeof module !== 'undefined') {
  module.exports = { BUILDINGS };
}
