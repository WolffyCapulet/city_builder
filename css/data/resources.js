// resources.js
// 所有遊戲資源的定義：id、名稱、稀有度、來源採集點、圖示(可自行替換為圖片路徑或emoji)

const RARITY = {
  COMMON: 'common',       // 普通
  UNCOMMON: 'uncommon',   // 少見
  RARE: 'rare',           // 稀有
  LEGENDARY: 'legendary'  // 傳說
};

const RESOURCES = {
  // ===== 森林 (forest) =====
  wood:        { id: 'wood',        name: '原木',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🪵' },
  branch:      { id: 'branch',      name: '樹枝',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🌿' },
  herb:        { id: 'herb',        name: '草藥',   rarity: RARITY.UNCOMMON, spot: 'forest', icon: '🌱' },
  mushroom:    { id: 'mushroom',    name: '蘑菇',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🍄' },
  meat:        { id: 'meat',        name: '獸肉',   rarity: RARITY.UNCOMMON, spot: 'forest', icon: '🍖' },
  hide:        { id: 'hide',        name: '獸皮',   rarity: RARITY.UNCOMMON, spot: 'forest', icon: '🦌' },
  blood_f:     { id: 'blood_f',     name: '血液',   rarity: RARITY.UNCOMMON, spot: 'forest', icon: '🩸' },
  bone_f:      { id: 'bone_f',      name: '骨頭',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🦴' },
  stone_f:     { id: 'stone_f',     name: '石頭',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🪨' },
  fiber_f:     { id: 'fiber_f',     name: '纖維',   rarity: RARITY.COMMON,   spot: 'forest', icon: '🧵' },
  bird_egg:    { id: 'bird_egg',    name: '鳥蛋',   rarity: RARITY.UNCOMMON, spot: 'forest', icon: '🥚' },

  // ===== 海灘 (beach) =====
  fish:        { id: 'fish',        name: '魚',     rarity: RARITY.COMMON,   spot: 'beach', icon: '🐟' },
  salt:        { id: 'salt',        name: '鹽',     rarity: RARITY.COMMON,   spot: 'beach', icon: '🧂' },
  sand:        { id: 'sand',        name: '沙子',   rarity: RARITY.COMMON,   spot: 'beach', icon: '⏳' },
  seaweed:     { id: 'seaweed',     name: '海帶',   rarity: RARITY.COMMON,   spot: 'beach', icon: '🌿' },
  stone_b:     { id: 'stone_b',     name: '石頭',   rarity: RARITY.COMMON,   spot: 'beach', icon: '🪨' },
  coral:       { id: 'coral',       name: '珊瑚',   rarity: RARITY.UNCOMMON, spot: 'beach', icon: '🪸' },
  ore_raw_b:   { id: 'ore_raw_b',   name: '礦石',   rarity: RARITY.UNCOMMON, spot: 'beach', icon: '⛏️' },
  bone_b:      { id: 'bone_b',      name: '骨頭',   rarity: RARITY.COMMON,   spot: 'beach', icon: '🦴' },
  shrimp:      { id: 'shrimp',      name: '蝦',     rarity: RARITY.COMMON,   spot: 'beach', icon: '🦐' },
  crab:        { id: 'crab',        name: '蟹',     rarity: RARITY.UNCOMMON, spot: 'beach', icon: '🦀' },
  oyster:      { id: 'oyster',      name: '牡蠣',   rarity: RARITY.UNCOMMON, spot: 'beach', icon: '🦪' },
  octopus:     { id: 'octopus',     name: '章魚',   rarity: RARITY.UNCOMMON, spot: 'beach', icon: '🐙' },
  sea_urchin:  { id: 'sea_urchin',  name: '海膽',   rarity: RARITY.RARE,     spot: 'beach', icon: '🌊' },
  lobster:     { id: 'lobster',     name: '龍蝦',   rarity: RARITY.RARE,     spot: 'beach', icon: '🦞' },
  pearl:       { id: 'pearl',       name: '珍珠',   rarity: RARITY.LEGENDARY,spot: 'beach', icon: '💠' },

  // ===== 礦山 (mine) =====
  coal:        { id: 'coal',        name: '煤炭',   rarity: RARITY.COMMON,   spot: 'mine', icon: '⚫' },
  iron_ore:    { id: 'iron_ore',    name: '鐵礦',   rarity: RARITY.COMMON,   spot: 'mine', icon: '⛏️' },
  copper_ore:  { id: 'copper_ore',  name: '銅礦',   rarity: RARITY.COMMON,   spot: 'mine', icon: '🟠' },
  silver_ore:  { id: 'silver_ore',  name: '銀礦',   rarity: RARITY.UNCOMMON, spot: 'mine', icon: '⚪' },
  tin_ore:     { id: 'tin_ore',     name: '錫礦',   rarity: RARITY.UNCOMMON, spot: 'mine', icon: '🔘' },
  sulfur:      { id: 'sulfur',      name: '硫磺',   rarity: RARITY.UNCOMMON, spot: 'mine', icon: '🟡' },
  gold_ore:    { id: 'gold_ore',    name: '金礦',   rarity: RARITY.RARE,     spot: 'mine', icon: '🟨' },
  crystal:     { id: 'crystal',     name: '水晶',   rarity: RARITY.RARE,     spot: 'mine', icon: '💎' },
  agate:       { id: 'agate',       name: '瑪瑙',   rarity: RARITY.RARE,     spot: 'mine', icon: '🔴' },
  mithril:     { id: 'mithril',     name: '秘銀',   rarity: RARITY.LEGENDARY,spot: 'mine', icon: '✨' },
  magic_stone: { id: 'magic_stone', name: '魔法石', rarity: RARITY.LEGENDARY,spot: 'mine', icon: '🔮' },
  diamond:     { id: 'diamond',     name: '鑽石',   rarity: RARITY.LEGENDARY,spot: 'mine', icon: '💎' },
  unidentified_ore: { id: 'unidentified_ore', name: '未鑑定礦石', rarity: RARITY.UNCOMMON, spot: 'mine', icon: '❓' },

  // ===== 平原 (plains) =====
  chicken:     { id: 'chicken',     name: '雞',     rarity: RARITY.COMMON,   spot: 'plains', icon: '🐔' },
  feather:     { id: 'feather',     name: '羽毛',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🪶' },
  bone_p:      { id: 'bone_p',      name: '骨頭',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🦴' },
  fiber_p:     { id: 'fiber_p',     name: '纖維',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🧵' },
  unknown_seed:{ id: 'unknown_seed',name: '未知種子',rarity: RARITY.UNCOMMON,spot: 'plains', icon: '🌰' },
  blood_p:     { id: 'blood_p',     name: '血液',   rarity: RARITY.UNCOMMON, spot: 'plains', icon: '🩸' },
  wheat:       { id: 'wheat',       name: '小麥',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🌾' },
  corn:        { id: 'corn',        name: '玉米',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🌽' },
  tomato:      { id: 'tomato',      name: '番茄',   rarity: RARITY.COMMON,   spot: 'plains', icon: '🍅' },
  pumpkin:     { id: 'pumpkin',     name: '南瓜',   rarity: RARITY.UNCOMMON, spot: 'plains', icon: '🎃' },
  wild_berry:  { id: 'wild_berry',  name: '野莓',   rarity: RARITY.UNCOMMON, spot: 'plains', icon: '🍓' },
  four_leaf_clover: { id: 'four_leaf_clover', name: '四葉草', rarity: RARITY.RARE, spot: 'plains', icon: '🍀' },

  // ===== 加工品 (crafted) =====
  plank:       { id: 'plank',       name: '木板',   rarity: RARITY.COMMON,   spot: 'crafted', icon: '📏' },
  leather:     { id: 'leather',     name: '皮革',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '🟤' },
  potion:      { id: 'potion',      name: '藥水',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '🧪' },
  iron_ingot:  { id: 'iron_ingot',  name: '鐵錠',   rarity: RARITY.COMMON,   spot: 'crafted', icon: '🔩' },
  copper_ingot:{ id: 'copper_ingot',name: '銅錠',   rarity: RARITY.COMMON,   spot: 'crafted', icon: '🔶' },
  silver_ingot:{ id: 'silver_ingot',name: '銀錠',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '⬜' },
  gold_ingot:  { id: 'gold_ingot',  name: '金錠',   rarity: RARITY.RARE,     spot: 'crafted', icon: '🟨' },
  glass:       { id: 'glass',       name: '玻璃',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '🧊' },
  jewelry:     { id: 'jewelry',     name: '珠寶',   rarity: RARITY.LEGENDARY,spot: 'crafted', icon: '💍' },
  flour:       { id: 'flour',       name: '麵粉',   rarity: RARITY.COMMON,   spot: 'crafted', icon: '🌾' },
  feed:        { id: 'feed',        name: '飼料',   rarity: RARITY.COMMON,   spot: 'crafted', icon: '🥣' },
  cloth:       { id: 'cloth',       name: '衣物',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '👕' },
  bedding:     { id: 'bedding',     name: '寢具',   rarity: RARITY.UNCOMMON, spot: 'crafted', icon: '🛏️' }
};

// 給其他檔案使用（若採用 <script> 直接載入，這些變數會是全域變數）
if (typeof module !== 'undefined') {
  module.exports = { RARITY, RESOURCES };
}
