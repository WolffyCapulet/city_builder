// render.js + events.js 合併為 UI 模組（先求功能完整，之後可再拆分美化）

const UI = (function () {

  function formatAmount(n) {
    return Math.floor(n).toLocaleString('zh-Hant');
  }

  function renderResources() {
    const state = GameState.get();
    const container = document.getElementById('resource-list');
    if (!container) return;

    const owned = Object.entries(state.resources)
      .filter(([, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1]);

    if (owned.length === 0) {
      container.innerHTML = '<p class="empty">尚未擁有任何資源</p>';
      return;
    }

    container.innerHTML = owned.map(([resId, amt]) => {
      const def = RESOURCES[resId];
      if (!def) return '';
      return `<span class="resource-chip">${def.icon} ${def.name} ${formatAmount(amt)}</span>`;
    }).join('');
  }

  function renderSpots() {
    const state = GameState.get();
    const container = document.getElementById('spot-list');
    if (!container) return;

    container.innerHTML = Object.keys(GATHERING_SPOTS).map(spotId => {
      const spotDef = GATHERING_SPOTS[spotId];
      const spotState = state.spots[spotId];
      const levelData = SPOT_LEVELS[Math.min(spotState.level - 1, SPOT_LEVELS.length - 1)];

      const availableBuildings = Object.values(BUILDINGS).filter(b => b.spot === spotId);

      const buildingsHtml = availableBuildings.map(b => {
        const built = GameState.hasBuilding(spotId, b.id);
        const locked = spotState.level < b.unlockLevel;

        if (locked) {
          return `<div class="building locked">🔒 ${b.icon} ${b.name}（需採集點等級 ${b.unlockLevel}）</div>`;
        }
        if (built) {
          if (b.type === 'processing') {
            const recipes = Object.values(RECIPES).filter(r => r.building === b.id);
            const recipeButtons = recipes.map(r =>
              `<button onclick="UI.handleCraft('${spotId}', '${r.id}')">製作 ${formatRecipeLabel(r)}</button>`
            ).join(' ');
            return `<div class="building built">✅ ${b.icon} ${b.name} ${recipeButtons}</div>`;
          }
          return `<div class="building built">✅ ${b.icon} ${b.name}（生產中）</div>`;
        }
        return `<div class="building buildable">${b.icon} ${b.name}
          <button onclick="UI.handleBuild('${spotId}', '${b.id}')">建造</button></div>`;
      }).join('');

      const nextLevel = SPOT_LEVELS[spotState.level]; // 下一級資料（若存在）
      const upgradeHtml = nextLevel
        ? `<button onclick="UI.handleUpgradeSpot('${spotId}')">升級到 Lv.${nextLevel.level}（消耗：${formatCost(nextLevel.upgradeCost)}）</button>`
        : `<span class="max-level">已達最高等級</span>`;

      return `
        <div class="spot-card">
          <h3>${spotDef.icon} ${spotDef.name}（Lv.${spotState.level}）</h3>
          <p class="spot-desc">${spotDef.description}</p>
          <p class="spot-bonus">產量倍率 x${levelData.quantityMultiplier}　稀有加成 +${levelData.rarityBonus}%</p>
          <div class="buildings">${buildingsHtml}</div>
          <div class="upgrade">${upgradeHtml}</div>
        </div>
      `;
    }).join('');
  }

  function formatRecipeLabel(recipe) {
    const outputText = recipe.output
      ? Object.keys(recipe.output).map(id => RESOURCES[id].name).join('/')
      : '???（隨機）';
    return `${outputText}（${recipe.duration}秒）`;
  }

  function formatCost(costObj) {
    return Object.entries(costObj).map(([resId, amt]) => {
      const def = RESOURCES[resId];
      return `${def ? def.name : resId} x${amt}`;
    }).join('、');
  }

  function renderCraftingQueue() {
    const state = GameState.get();
    const container = document.getElementById('crafting-queue');
    if (!container) return;

    if (state.craftingQueue.length === 0) {
      container.innerHTML = '<p class="empty">目前沒有進行中的加工</p>';
      return;
    }

    const now = Date.now();
    container.innerHTML = state.craftingQueue.map(job => {
      const recipe = RECIPES[job.recipeId];
      const remaining = Math.max(0, Math.ceil((job.endTime - now) / 1000));
      return `<div class="queue-item">${formatRecipeLabel(recipe)} 剩餘 ${remaining} 秒</div>`;
    }).join('');
  }

  function render() {
    renderResources();
    renderSpots();
    renderCraftingQueue();
  }

  function handleBuild(spotId, buildingId) {
    GameState.buildBuilding(spotId, buildingId);
    SaveLoad.save();
    render();
  }

  function handleUpgradeSpot(spotId) {
    const state = GameState.get();
    const spotState = state.spots[spotId];
    const nextLevel = SPOT_LEVELS[spotState.level]; // 目前 level 是 1-based, 陣列是 0-based，剛好對應下一級
    if (!nextLevel) return;

    if (!GameState.spendResources(nextLevel.upgradeCost)) {
      alert('資源不足，無法升級');
      return;
    }
    spotState.level = nextLevel.level;
    SaveLoad.save();
    render();
  }

  function handleCraft(spotId, recipeId) {
    const result = Crafting.startCrafting(spotId, recipeId);
    if (!result.success) {
      alert(result.reason);
      return;
    }
    SaveLoad.save();
    render();
  }

  function notifyCraftingCompleted(completedJobs) {
    const container = document.getElementById('notifications');
    if (!container) return;
    completedJobs.forEach(job => {
      const recipe = RECIPES[job.recipeId];
      const div = document.createElement('div');
      div.className = 'notification';
      div.textContent = `✅ 加工完成：${formatRecipeLabel(recipe)}`;
      container.appendChild(div);
      setTimeout(() => div.remove(), 4000);
    });
  }

  function showOfflineReport(report) {
    if (report.offlineSeconds < 5) return; // 太短就不用顯示

    const gatheredText = Object.entries(report.gathered)
      .filter(([, amt]) => amt >= 1)
      .map(([resId, amt]) => `${RESOURCES[resId] ? RESOURCES[resId].name : resId} +${Math.floor(amt)}`)
      .join('、') || '（無明顯產出）';

    const craftedText = report.craftingCompleted.length > 0
      ? report.craftingCompleted.map(j => formatRecipeLabel(RECIPES[j.recipeId])).join('、')
      : '（無完成的加工工作）';

    const hours = Math.floor(report.offlineSeconds / 3600);
    const minutes = Math.floor((report.offlineSeconds % 3600) / 60);

    alert(
      `離線 ${hours} 小時 ${minutes} 分鐘\n\n` +
      `採集產出：${gatheredText}\n` +
      `加工完成：${craftedText}`
    );
  }

  return {
    render, handleBuild, handleUpgradeSpot, handleCraft,
    notifyCraftingCompleted, showOfflineReport
  };
})();
