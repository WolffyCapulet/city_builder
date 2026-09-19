// main.js
// 遊戲啟動流程：讀檔（含離線結算）→ 顯示離線報告 → 開始主迴圈

window.addEventListener('DOMContentLoaded', () => {
  const report = SaveLoad.init();
  UI.render();
  UI.showOfflineReport(report);
  GameLoop.start();

  // 離開頁面前存檔，避免關閉分頁時漏存最新狀態
  window.addEventListener('beforeunload', () => {
    SaveLoad.save();
  });
});
