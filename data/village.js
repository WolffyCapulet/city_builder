// village.js
// 村莊：所有「加工型」與「商店」建築統一蓋在這裡，不再綁在特定採集點。
// 概念上：伐木場、礦坑這種「採集型」建築合理蓋在對應的採集點（森林、礦山...），
// 但製皮坊、磨坊、市集這種「加工/交易」設施應該蓋在村莊裡，不管原料是從哪個採集點來的。

const VILLAGE = {
  id: 'village',
  name: '村莊',
  icon: '🏘️',
  description: '匯集各種加工坊與商店的村莊中心，處理各地採集回來的原料，不受任何單一採集點限制。'
};

if (typeof module !== 'undefined') {
  module.exports = { VILLAGE };
}
