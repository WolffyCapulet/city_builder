// recipes.js
// 加工鏈：原料 -> 產物，需要指定建築與加工時間(秒)
// 加工方式跟採集一樣採「時間制」，可離線結算（用開始時間戳 + duration 計算是否完成）

const RECIPES = {
  // ===== 森林：製材廠 =====
  plank_from_wood: {
    id: 'plank_from_wood',
    building: 'sawmill',
    input: { wood: 5 },
    output: { plank: 2 },
    duration: 30 // 秒
  },
  // ===== 森林：製皮坊 =====
  leather_from_hide: {
    id: 'leather_from_hide',
    building: 'tannery',
    input: { hide: 3 },
    output: { leather: 1 },
    duration: 60
  },
  // ===== 森林：煉藥屋 =====
  potion_from_herb: {
    id: 'potion_from_herb',
    building: 'alchemy_hut',
    input: { herb: 4, bone_f: 1 },
    output: { potion: 1 },
    duration: 90
  },

  // ===== 礦山：熔爐（各種礦石 -> 錠）=====
  iron_ingot_from_ore: {
    id: 'iron_ingot_from_ore',
    building: 'furnace',
    input: { iron_ore: 3, coal: 1 },
    output: { iron_ingot: 1 },
    duration: 40
  },
  copper_ingot_from_ore: {
    id: 'copper_ingot_from_ore',
    building: 'furnace',
    input: { copper_ore: 3, coal: 1 },
    output: { copper_ingot: 1 },
    duration: 40
  },
  silver_ingot_from_ore: {
    id: 'silver_ingot_from_ore',
    building: 'furnace',
    input: { silver_ore: 3, coal: 2 },
    output: { silver_ingot: 1 },
    duration: 60
  },
  gold_ingot_from_ore: {
    id: 'gold_ingot_from_ore',
    building: 'furnace',
    input: { gold_ore: 3, coal: 3 },
    output: { gold_ingot: 1 },
    duration: 90
  },
  // ===== 礦山：選礦場（未鑑定礦石 -> 隨機礦石，交由 crafting.js 邏輯決定隨機結果）=====
  sort_unidentified_ore: {
    id: 'sort_unidentified_ore',
    building: 'ore_sorter',
    input: { unidentified_ore: 1 },
    output: null, // 特殊：由程式邏輯隨機決定，見 systems/crafting.js
    duration: 20
  },

  // ===== 海灘：玻璃工坊 =====
  glass_from_sand: {
    id: 'glass_from_sand',
    building: 'glass_workshop',
    input: { sand: 5 },
    output: { glass: 1 },
    duration: 30
  },
  // ===== 海灘：珠寶坊 =====
  jewelry_from_pearl: {
    id: 'jewelry_from_pearl',
    building: 'jewelry_shop',
    input: { pearl: 1, gold_ingot: 1 },
    output: { jewelry: 1 },
    duration: 120
  },

  // ===== 平原：磨坊 =====
  flour_from_wheat: {
    id: 'flour_from_wheat',
    building: 'mill',
    input: { wheat: 5 },
    output: { flour: 2 },
    duration: 25
  },
  feed_from_corn: {
    id: 'feed_from_corn',
    building: 'mill',
    input: { corn: 5 },
    output: { feed: 2 },
    duration: 25
  },
  // ===== 平原：裁縫坊 =====
  cloth_from_feather: {
    id: 'cloth_from_feather',
    building: 'tailor_shop',
    input: { feather: 4, fiber_p: 2 },
    output: { cloth: 1 },
    duration: 45
  },
  bedding_from_hide_feather: {
    id: 'bedding_from_hide_feather',
    building: 'tailor_shop',
    input: { feather: 3, leather: 1 },
    output: { bedding: 1 },
    duration: 60
  }
};

if (typeof module !== 'undefined') {
  module.exports = { RECIPES };
}
