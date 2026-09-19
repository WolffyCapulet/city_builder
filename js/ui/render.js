// render.js + events.js 合併為 UI 模組（先求功能完整，之後可再拆分美化）

const UI = (function () {

  // 採集建築的視覺生產週期長度（秒）。跟 GameLoop 的自動生產結算週期一致，
  // 讓進度條跑滿的瞬間，就是實際資源到手的瞬間。
  const GATHER_CYCLE_SECONDS = 10;

  function formatAmount(n) {
    return Math.floor(n).toLocaleString('zh-Hant');
  }

  // 計算目前這一輪自動生產的進度（0~100），所有採集建築共用同一個節奏
  function getGatherProgress() {
    return GameLoop.getProductionProgress();
  }

  // 產出資源的圖示列（給進度條旁邊看的）
  function getBuildingProduceIcons(buildingId) {
    const production = BUILDING_PRODUCTION[buildingId];
    if (!production) return '';
    return Object.keys(production)
      .map(resId => (RESOURCES[resId] ? RESOURCES[resId].icon : ''))
      .join(' ');
  }

  function renderResources() {
    const state = GameState.get();
    const container = document.getElementById('resource-list');
    if (!container) return;

    const owned = Object.entries(state.resources)
      .filter(([, amt]) => amt >= 1) // 未滿 1 個先不顯示，避免小數殘值造成一堆「0」的雜訊
      .sort((a, b) => b[1] - a[1]);

    if (owned.length === 0) {
      container.innerHTML = '<p class="empty">尚未擁有任何資源，先試試「徒手採集」吧</p>';
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
          // 採集型建築：顯示生產週期進度條（跟其他採集建築共用同一個節奏）
          const progress = getGatherProgress();
          const produceIcons = getBuildingProduceIcons(b.id);
          return `
            <div class="building built gathering">
              <div class="building-row">✅ ${b.icon} ${b.name}<span class="produce-icons">${produceIcons}</span></div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width:${progress}%"></div>
              </div>
            </div>`;
        }

        // 尚未建造：顯示建造成本，資源不足時按鈕仍可點但會提示不足
        const costText = b.cost ? formatCost(b.cost) : '免費';
        const affordable = b.cost ? GameState.hasResources(b.cost) : true;
        return `
          <div class="building buildable">
            <div class="building-row">${b.icon} ${b.name}
              <button class="${affordable ? '' : 'disabled-look'}" onclick="UI.handleBuild('${spotId}', '${b.id}')">建造</button>
            </div>
            <div class="cost-text">需要：${costText}</div>
          </div>`;
      }).join('');

      const nextLevel = SPOT_LEVELS[spotState.level]; // 下一級資料（若存在）
      const upgradeHtml = nextLevel
        ? `<button onclick="UI.handleUpgradeSpot('${spotId}')">升級到 Lv.${nextLevel.level}（消耗：${formatCost(nextLevel.upgradeCost)}）</button>`
        : `<span class="max-level">已達最高等級</span>`;

      const cooldown = Gathering.getManualGatherCooldownRemaining(spotId);
      const manualBtnLabel = cooldown > 0 ? `冷卻中 (${cooldown}s)` : '✋ 徒手採集';
      const manualBtnDisabled = cooldown > 0 ? 'disabled' : '';

      return `
        <div class="spot-card">
          <h3>${spotDef.icon} ${spotDef.name}（Lv.${spotState.level}）</h3>
          <p class="spot-desc">${spotDef.description}</p>
          <p class="spot-bonus">產量倍率 x${levelData.quantityMultiplier}　稀有加成 +${levelData.rarityBonus}%</p>
          <div class="spot-btn-row">
            <button class="manual-gather-btn" ${manualBtnDisabled} onclick="UI.handleManualGather('${spotId}')">${manualBtnLabel}</button>
            <button class="probability-btn" onclick="UI.openProbabilityPanel('${spotId}')">📊 機率表</button>
          </div>
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
    const buildingDef = BUILDINGS[buildingId];
    if (buildingDef.cost && !GameState.spendResources(buildingDef.cost)) {
      alert(`資源不足，需要：${formatCost(buildingDef.cost)}`);
      return;
    }
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

  function handleManualGather(spotId) {
    const result = Gathering.manualGather(spotId);
    if (!result.success) {
      // 冷卻中，不特別跳警示框（太打擾），畫面上按鈕本身已經顯示冷卻秒數
      render();
      return;
    }
    const def = RESOURCES[result.resourceId];
    notifyManualGather(def);
    SaveLoad.save();
    render();
  }

  function notifyManualGather(resourceDef) {
    const container = document.getElementById('notifications');
    if (!container || !resourceDef) return;
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = `${resourceDef.icon} 獲得 ${resourceDef.name} +1`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 2000);
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

  function formatSlotTimestamp(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function renderSaveSlots() {
    const container = document.getElementById('save-slot-list');
    if (!container) return;

    const activeSlot = SaveLoad.getActiveSlot();

    let html = '';
    for (let i = 1; i <= SaveLoad.SLOT_COUNT; i++) {
      const meta = SaveLoad.getSlotMeta(i);
      const isActive = i === activeSlot;

      const infoText = meta.empty
        ? '空格'
        : `擁有資源總數：${meta.resourceCount}　最後存檔：${formatSlotTimestamp(meta.lastTimestamp)}`;

      html += `
        <div class="save-slot ${isActive ? 'active-slot' : ''}">
          <div class="save-slot-header">
            <span class="save-slot-title">存檔格 ${i} ${isActive ? '（目前遊玩中）' : ''}</span>
          </div>
          <div class="save-slot-info">${infoText}</div>
          <div class="save-slot-actions">
            <button onclick="UI.handleSaveToSlot(${i})">存檔到此格</button>
            <button onclick="UI.handleLoadSlot(${i})" ${isActive ? 'disabled' : ''}>讀取此格</button>
            <button class="danger-btn" onclick="UI.handleClearSlot(${i})" ${meta.empty ? 'disabled' : ''}>清空</button>
          </div>
        </div>`;
    }

    container.innerHTML = html;
  }

  function toggleSavePanel() {
    const overlay = document.getElementById('save-overlay');
    if (!overlay) return;
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
      renderSaveSlots();
    }
  }

  function closeSavePanelIfBackdrop(event) {
    if (event.target.id === 'save-overlay') {
      toggleSavePanel();
    }
  }

  function handleSaveToSlot(slotIndex) {
    const activeSlot = SaveLoad.getActiveSlot();
    const meta = SaveLoad.getSlotMeta(slotIndex);

    // 存到別的格子、而且那格已經有別的進度時，先確認避免誤蓋
    if (slotIndex !== activeSlot && !meta.empty) {
      const ok = confirm(`存檔格 ${slotIndex} 已經有其他進度，存檔會覆蓋掉它，確定要覆蓋嗎？`);
      if (!ok) return;
    }

    SaveLoad.save(slotIndex);
    renderSaveSlots();
    notifySimple(`已存檔到存檔格 ${slotIndex}`);
  }

  function handleLoadSlot(slotIndex) {
    const activeSlot = SaveLoad.getActiveSlot();
    if (slotIndex === activeSlot) return;

    // 切換前先把目前進度存回原本的格子，避免遺失
    SaveLoad.save(activeSlot);

    const report = SaveLoad.loadSlot(slotIndex);
    render();
    renderSaveSlots();
    toggleSavePanel();
    UI.showOfflineReport(report);
  }

  function handleClearSlot(slotIndex) {
    const ok = confirm(
      `確定要清空存檔格 ${slotIndex} 嗎？\n\n這個動作無法復原，這個格子裡的所有資料都會永久消失。`
    );
    if (!ok) return;

    SaveLoad.clearSlot(slotIndex);
    render();
    renderSaveSlots();
    notifySimple(`存檔格 ${slotIndex} 已清空`);
  }

  function notifySimple(text) {
    const container = document.getElementById('notifications');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = text;
    container.appendChild(div);
    setTimeout(() => div.remove(), 2500);
  }

  function renderProbabilityContent(spotId) {
    const spotDef = GATHERING_SPOTS[spotId];
    const state = GameState.get();
    const currentLevel = state.spots[spotId].level;
    const spotTables = DROP_TABLES[spotId] || {};
    const levels = Object.keys(spotTables).map(Number).sort((a, b) => a - b);

    const levelsHtml = levels.map(lv => {
      const table = spotTables[lv];
      const totalWeight = table.reduce((s, e) => s + e.weight, 0);
      const isCurrent = lv === currentLevel;
      const isLocked = lv > currentLevel;

      const rowsHtml = table
        .slice()
        .sort((a, b) => b.weight - a.weight)
        .map(entry => {
          const def = RESOURCES[entry.resource];
          const pct = ((entry.weight / totalWeight) * 100).toFixed(1);
          const isNew = entry.newAtLevel === lv;
          return `<div class="prob-row">
            <span class="prob-name">${def ? def.icon : ''} ${def ? def.name : entry.resource}${isNew ? ' <span class="new-tag">NEW</span>' : ''}</span>
            <span class="prob-pct">${pct}%</span>
          </div>`;
        }).join('');

      return `
        <div class="prob-level-block ${isCurrent ? 'current-level' : ''} ${isLocked ? 'locked-level' : ''}">
          <div class="prob-level-title">Lv.${lv} ${isCurrent ? '（目前等級）' : isLocked ? '（尚未達到）' : ''}</div>
          <div class="prob-rows">${rowsHtml}</div>
        </div>`;
    }).join('');

    return `
      <h2 class="section-title">${spotDef.icon} ${spotDef.name} — 徒手採集機率表</h2>
      <p class="prob-hint">等級越高，開放的物品種類越多；原本物品的單次機率會被稀釋，但採集點升級也會提高自動生產的產量倍率。</p>
      <div class="prob-level-list">${levelsHtml}</div>`;
  }

  function openProbabilityPanel(spotId) {
    const overlay = document.getElementById('probability-overlay');
    const content = document.getElementById('probability-panel-content');
    if (!overlay || !content) return;
    content.innerHTML = renderProbabilityContent(spotId);
    overlay.classList.remove('hidden');
  }

  function closeProbabilityPanel() {
    const overlay = document.getElementById('probability-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  function closeProbabilityPanelIfBackdrop(event) {
    if (event.target.id === 'probability-overlay') {
      closeProbabilityPanel();
    }
  }

  return {
    render, handleBuild, handleUpgradeSpot, handleCraft, handleManualGather,
    notifyCraftingCompleted, showOfflineReport,
    toggleSavePanel, closeSavePanelIfBackdrop,
    handleSaveToSlot, handleLoadSlot, handleClearSlot,
    openProbabilityPanel, closeProbabilityPanel, closeProbabilityPanelIfBackdrop
  };
})();
