// buildings.js
// 每個採集點可蓋的建築：分成「初階(採集強化)」與「進階(加工)」兩類
// type: 'gathering' = 強化採集點本身產出
//       'processing' = 加工建築，對應 recipes.js 裡的配方

const BUILDINGS = {
  // ===== 森林 =====
  lumber_camp:   { id: 'lumber_camp',   name: '伐木場',   spot: 'forest', type: 'gathering',  icon: '🪓', unlockLevel: 1 },
  hunting_lodge: { id: 'hunting_lodge', name: '狩獵小屋', spot: 'forest', type: 'gathering',  icon: '🏹', unlockLevel: 1 },
  herb_garden:   { id: 'herb_garden',   name: '草藥園',   spot: 'forest', type: 'gathering',  icon: '🌿', unlockLevel: 2 },
  sawmill:       { id: 'sawmill',       name: '製材廠',   spot: 'forest', type: 'processing', icon: '🏭', unlockLevel: 2 },
  tannery:       { id: 'tannery',       name: '製皮坊',   spot: 'forest', type: 'processing', icon: '🧵', unlockLevel: 3 },
  alchemy_hut:   { id: 'alchemy_hut',   name: '煉藥屋',   spot: 'forest', type: 'processing', icon: '⚗️', unlockLevel: 3 },

  // ===== 海灘 =====
  fishing_port:  { id: 'fishing_port',  name: '漁港',     spot: 'beach', type: 'gathering',  icon: '🎣', unlockLevel: 1 },
  salt_farm:     { id: 'salt_farm',     name: '鹽田',     spot: 'beach', type: 'gathering',  icon: '🧂', unlockLevel: 1 },
  pearl_farm:    { id: 'pearl_farm',    name: '珍珠養殖場', spot: 'beach', type: 'gathering', icon: '💠', unlockLevel: 3 },
  shipyard:      { id: 'shipyard',      name: '造船廠',   spot: 'beach', type: 'gathering',  icon: '⛵', unlockLevel: 4 },
  glass_workshop:{ id: 'glass_workshop',name: '玻璃工坊', spot: 'beach', type: 'processing', icon: '🧊', unlockLevel: 2 },
  jewelry_shop:  { id: 'jewelry_shop',  name: '珠寶坊',   spot: 'beach', type: 'processing', icon: '💍', unlockLevel: 4 },

  // ===== 礦山 =====
  mine_shaft:    { id: 'mine_shaft',    name: '礦坑',     spot: 'mine', type: 'gathering',  icon: '⛏️', unlockLevel: 1 },
  ore_sorter:    { id: 'ore_sorter',    name: '選礦場',   spot: 'mine', type: 'processing', icon: '🔍', unlockLevel: 2 },
  furnace:       { id: 'furnace',       name: '熔爐',     spot: 'mine', type: 'processing', icon: '🔥', unlockLevel: 2 },
  gem_workshop:  { id: 'gem_workshop',  name: '寶石加工坊', spot: 'mine', type: 'processing', icon: '💎', unlockLevel: 4 },

  // ===== 平原 =====
  farmland:      { id: 'farmland',      name: '農田',     spot: 'plains', type: 'gathering',  icon: '🌾', unlockLevel: 1 },
  chicken_coop:  { id: 'chicken_coop',  name: '雞舍',     spot: 'plains', type: 'gathering',  icon: '🐔', unlockLevel: 1 },
  irrigation:    { id: 'irrigation',    name: '灌溉系統', spot: 'plains', type: 'gathering',  icon: '💧', unlockLevel: 3 },
  granary:       { id: 'granary',       name: '穀倉',     spot: 'plains', type: 'gathering',  icon: '🏚️', unlockLevel: 2 },
  mill:          { id: 'mill',          name: '磨坊',     spot: 'plains', type: 'processing', icon: '🌀', unlockLevel: 2 },
  tailor_shop:   { id: 'tailor_shop',   name: '裁縫坊',   spot: 'plains', type: 'processing', icon: '🧵', unlockLevel: 3 }
};

if (typeof module !== 'undefined') {
  module.exports = { BUILDINGS };
}
