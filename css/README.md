# 城主村莊 - City Builder（重製版）

離線放置型城市經營遊戲。玩家管理四個採集點（森林、海灘、礦山、平原），
建設採集/加工建築，離線也持續生產資源。

## 專案結構

```
city_builder/
├── index.html
├── css/
│   └── style.css
├── data/
│   ├── resources.js         # 所有資源定義
│   ├── gatheringSpots.js     # 採集點與等級表
│   ├── buildings.js          # 各採集點可蓋的建築
│   ├── recipes.js            # 加工鏈配方
│   └── production.js         # 各採集建築的基礎生產速率、稀有掉落表
├── js/
│   ├── core/
│   │   ├── gameState.js      # 遊戲狀態（資源/建築/等級/加工佇列）
│   │   ├── saveLoad.js       # 存讀檔 + 離線結算邏輯
│   │   └── gameLoop.js       # 主迴圈（每秒 tick）
│   ├── systems/
│   │   ├── gathering.js      # 採集產出計算
│   │   └── crafting.js       # 加工佇列與完成判定
│   ├── ui/
│   │   └── render.js         # 畫面渲染與按鈕互動
│   └── main.js                # 啟動流程
└── README.md
```

## 目前進度

- [x] 資源定義（森林/海灘/礦山/平原 + 加工品）
- [x] 採集點與等級表
- [x] 建築定義（採集型 + 加工型）
- [x] 加工配方（原料 -> 產物）
- [x] 遊戲狀態管理
- [x] 離線結算邏輯（含離線上限 8 小時，可調整）
- [x] 採集系統（含稀有掉落）
- [x] 加工系統（佇列、離線也會完成）
- [x] 基本畫面渲染與互動（建造、升級、加工按鈕）
- [ ] 美術／圖片資源（目前用 emoji 代替）
- [ ] 音效
- [ ] 更完整的建築升級（目前只有採集點等級，建築本身的 level 欄位已預留）
- [ ] 商店／交易系統

## 如何本機測試

直接用瀏覽器打開 `index.html` 即可（部分瀏覽器對本機檔案的 localStorage 有限制，
建議用 GitHub Pages 上線後測試，或用簡易 local server，例如：
`npx serve .` 或 VS Code 的 Live Server 擴充功能）。

## 核心機制說明

- **離線生產**：`saveLoad.js` 讀檔時會計算「現在時間 - 上次存檔時間」，
  依此結算離線期間的資源產出與加工完成，上限預設 8 小時（`OFFLINE_CAP_SECONDS`，
  可在 `js/core/saveLoad.js` 調整）。
- **採集點等級**：等級提升會提高產量倍率與稀有掉落機率加成，等級表在
  `data/gatheringSpots.js` 的 `SPOT_LEVELS`。
- **加工系統**：加工跟採集一樣是「時間制」，開始加工後會進入佇列，
  時間到（不論在線或離線）就會自動完成並發放產物。
