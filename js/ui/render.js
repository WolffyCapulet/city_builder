// render.js
// UI 模組：分頁切換（人物資訊/生產/加工/建築）+ 各分頁內容渲染

const UI = (function () {

  let currentTab = 'warehouse';

  function formatAmount(n) {
    return Math.floor(n).toLocaleString('zh-Hant');
  }

  function formatCost(costObj) {
    return Object.entries(costObj).map(([resId, amt]) => {
      const def = RESOURCES[resId];
      return `${def ? def.name : resId} x${amt}`;
    }).join('、');
  }

  function formatRecipeLabel(recipe) {
    const outputText = recipe.output
      ? Object.keys(recipe.output).map(id => RESOURCES[id].name).join('/')
      : '???（隨機）';
    return `${outputText}（${recipe.duration}秒）`;
  }

  // ========== 分頁切換 ==========

  function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `tab-${tabName}`);
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
  }

  // ========== 上方資源列（所有分頁共用） ==========

  function renderResources() {
    const state = GameState.get();
    const container = document.getElementById('resource-list');
    if (!container) return;

    const owned = Object.entries(state.resources)
      .filter(([, amt]) => amt >= 1)
      .sort((a, b) => b[1] - a[1]);

    if (owned.length === 0) {
      container.innerHTML = '<p class="empty">尚未擁有任何資源，先到「生產」分頁徒手採集吧</p>';
      return;
    }

    container.innerHTML = owned.map(([resId, amt]) => {
      const def = RESOURCES[resId];
      if (!def) return '';
      return `<span class="resource-chip">${def.icon} ${def.name} ${formatAmount(amt)}</span>`;
    }).join('');
  }

  // ========== 人物資訊分頁 ==========

  function renderCharacterPanel() {
    const container = document.getElementById('character-panel');
    if (!container) return;

    const c = GameState.get().character;
    const expNeeded = GameState.expNeededForLevel(c.level);
    const expPct = Math.floor((c.exp / expNeeded) * 100);
    const staminaPct = Math.floor((c.stamina / c.maxStamina) * 100);
    const regenPct = Character.getRegenProgress();
    const rarityBonus = Math.round((Gathering.getCharacterRarityMultiplier() - 1) * 100);

    container.innerHTML = `
      <div class="char-stat-block">
        <div class="char-stat-label">等級 Lv.${c.level}　經驗值 ${c.exp} / ${expNeeded}</div>
        <div class="stat-bar-container">
          <div class="stat-bar-fill exp-fill" style="width:${expPct}%"></div>
        </div>
        <div class="char-stat-sub">進階物品採集機率加成：+${rarityBonus}%（徒手採集會增加經驗值）</div>
      </div>
      <div class="char-stat-block">
        <div class="char-stat-label">體力 ${Math.floor(c.stamina)} / ${c.maxStamina}</div>
        <div class="stat-bar-container">
          <div class="stat-bar-fill stamina-fill" style="width:${staminaPct}%"></div>
        </div>
        <div class="char-stat-sub">自動恢復進度（每 5 秒 +1）：${regenPct}%</div>
      </div>
    `;
  }

  function renderFoodList() {
    const container = document.getElementById('food-list');
    if (!container) return;

    const state = GameState.get();
    const owned = Object.keys(FOOD_ITEMS)
      .filter(resId => (state.resources[resId] || 0) >= 1);

    if (owned.length === 0) {
      container.innerHTML = '<p class="empty">目前沒有可以吃的食物</p>';
      return;
    }

    container.innerHTML = owned.map(resId => {
      const def = RESOURCES[resId];
      const foodDef = FOOD_ITEMS[resId];
      const amt = Math.floor(state.resources[resId]);
      return `
        <div class="food-item">
          <span>${def.icon} ${def.name} x${amt}（恢復體力 +${foodDef.staminaRestore}）</span>
          <button onclick="UI.handleEatFood('${resId}')">吃掉</button>
        </div>`;
    }).join('');
  }

  function handleEatFood(resourceId) {
    const result = Character.eatFood(resourceId);
    if (!result.success) {
      alert(result.reason);
      return;
    }
    notifySimple(`🍽️ 恢復了 ${result.staminaRestored} 點體力`);
    SaveLoad.save();
    render();
  }

  // ========== 生產分頁：採集點狀態 + 自動生產進度 + 徒手採集 + 機率表 ==========

  let expandedProbabilitySpot = null; // 目前展開機率表的採集點（同時只展開一個）

  function toggleProbabilityView(spotId) {
    expandedProbabilitySpot = (expandedProbabilitySpot === spotId) ? null : spotId;
    renderProductionTab();
  }

  function getBuildingProduceIcons(buildingId) {
    const production = BUILDING_PRODUCTION[buildingId];
    if (!production) return '';
    return Object.keys(production)
      .map(resId => (RESOURCES[resId] ? RESOURCES[resId].icon : ''))
      .join(' ');
  }

  // 顯示「這個建築在目前等級下，每一輪(10秒)確切會產出幾個」——都是整數，不會有 1.3 個這種情況
  function formatPerCycleOutput(buildingId, buildingLevel) {
    const production = BUILDING_PRODUCTION[buildingId];
    if (!production) return '';
    return Object.entries(production).map(([resId, baseAmount]) => {
      const def = RESOURCES[resId];
      const amount = baseAmount * buildingLevel;
      return `${def ? def.icon : ''}${def ? def.name : resId} +${amount}`;
    }).join('、');
  }

  function renderProbabilityBlock(spotId) {
    const state = GameState.get();
    const currentLevel = state.spots[spotId].level;
    const spotTables = DROP_TABLES[spotId] || {};
    const levels = Object.keys(spotTables).map(Number).sort((a, b) => a - b);

    const levelsHtml = levels.map(lv => {
      const effectiveTable = Gathering.getEffectiveDropTable(spotId, lv);
      const totalWeight = effectiveTable.reduce((s, e) => s + e.effectiveWeight, 0);
      const isCurrent = lv === currentLevel;
      const isLocked = lv > currentLevel;

      const rowsHtml = effectiveTable
        .slice()
        .sort((a, b) => b.effectiveWeight - a.effectiveWeight)
        .map(entry => {
          const def = RESOURCES[entry.resource];
          const pct = ((entry.effectiveWeight / totalWeight) * 100).toFixed(1);
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
      <div class="prob-panel">
        <p class="prob-hint">機率已套用人物等級加成（進階物品 +${Math.round((Gathering.getCharacterRarityMultiplier() - 1) * 100)}%）。採集點等級越高，開放的物品種類越多，原本物品機率會被稀釋；建築本身的產量請到「建築」分頁個別升級。</p>
        <div class="prob-level-list">${levelsHtml}</div>
      </div>`;
  }

  function renderProductionTab() {
    const state = GameState.get();
    const container = document.getElementById('production-list');
    if (!container) return;

    container.innerHTML = Object.keys(GATHERING_SPOTS).map(spotId => {
      const spotDef = GATHERING_SPOTS[spotId];
      const spotState = state.spots[spotId];

      const builtGathering = Object.values(BUILDINGS)
        .filter(b => b.spot === spotId && b.type === 'gathering' && GameState.hasBuilding(spotId, b.id));

      const buildingsHtml = builtGathering.length === 0
        ? '<p class="empty">這裡還沒有任何生產建築，先去「建築」分頁蓋一座吧</p>'
        : builtGathering.map(b => {
            const buildingLevel = GameState.getBuildingLevel(spotId, b.id);
            const progress = GameLoop.getProductionProgress();
            const outputText = formatPerCycleOutput(b.id, buildingLevel);
            return `
              <div class="building built gathering">
                <div class="building-row">✅ ${b.icon} ${b.name}（建築 Lv.${buildingLevel}）</div>
                <div class="produce-icons">每輪：${outputText}</div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width:${progress}%"></div>
                </div>
              </div>`;
          }).join('');

      const cooldown = Gathering.getManualGatherCooldownRemaining(spotId);
      const stamina = state.character.stamina;
      let manualBtnLabel = '✋ 徒手採集（消耗體力1）';
      let manualBtnDisabled = '';
      if (cooldown > 0) {
        manualBtnLabel = `冷卻中 (${cooldown}s)`;
        manualBtnDisabled = 'disabled';
      } else if (stamina < Gathering.MANUAL_GATHER_STAMINA_COST) {
        manualBtnLabel = '體力不足';
        manualBtnDisabled = 'disabled';
      }

      const isExpanded = expandedProbabilitySpot === spotId;
      const probBlock = isExpanded ? renderProbabilityBlock(spotId) : '';

      return `
        <div class="spot-card">
          <h3>${spotDef.icon} ${spotDef.name}（採集點 Lv.${spotState.level}）</h3>
          <p class="spot-desc">${spotDef.description}</p>
          <p class="spot-bonus">採集點等級只影響解鎖哪些新建築、以及徒手採集的機率表，不影響已建成建築的產量——建築產量請到「建築」分頁個別升級</p>
          <div class="spot-btn-row">
            <button class="manual-gather-btn" ${manualBtnDisabled} onclick="UI.handleManualGather('${spotId}')">${manualBtnLabel}</button>
            <button class="probability-btn" onclick="UI.toggleProbabilityView('${spotId}')">${isExpanded ? '收起機率表' : '📊 機率表'}</button>
          </div>
          ${probBlock}
          <div class="buildings">${buildingsHtml}</div>
        </div>
      `;
    }).join('');
  }

  function handleManualGather(spotId) {
    const result = Gathering.manualGather(spotId);
    if (!result.success) {
      if (result.reason && result.reason.indexOf('冷卻中') === -1) {
        // 冷卻中不特別跳警示（畫面上按鈕已經有秒數），其他原因（體力不足等）跳提示
        alert(result.reason);
      }
      render();
      return;
    }
    const def = RESOURCES[result.resourceId];
    notifySimple(`${def.icon} 獲得 ${def.name} +1　(經驗 +${result.expGained})`);
    SaveLoad.save();
    render();
  }

  // ========== 加工分頁 ==========

  function renderCraftingTab() {
    const state = GameState.get();
    const container = document.getElementById('crafting-buildings-list');
    if (!container) return;

    const spotsWithProcessing = Object.keys(GATHERING_SPOTS).map(spotId => {
      const spotDef = GATHERING_SPOTS[spotId];
      const builtProcessing = Object.values(BUILDINGS)
        .filter(b => b.spot === spotId && b.type === 'processing' && GameState.hasBuilding(spotId, b.id));

      if (builtProcessing.length === 0) return '';

      const buildingsHtml = builtProcessing.map(b => {
        const recipes = Object.values(RECIPES).filter(r => r.building === b.id);
        const recipeButtons = recipes.map(r =>
          `<button onclick="UI.handleCraft('${spotId}', '${r.id}')">製作 ${formatRecipeLabel(r)}</button>`
        ).join(' ');
        return `<div class="building built">${b.icon} ${b.name}　${recipeButtons}</div>`;
      }).join('');

      return `
        <div class="spot-card">
          <h3>${spotDef.icon} ${spotDef.name}</h3>
          <div class="buildings">${buildingsHtml}</div>
        </div>`;
    }).filter(html => html !== '').join('');

    container.innerHTML = spotsWithProcessing || '<p class="empty">還沒有任何加工建築，先到「建築」分頁蓋一座吧</p>';
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

  function handleCraft(spotId, recipeId) {
    const result = Crafting.startCrafting(spotId, recipeId);
    if (!result.success) {
      alert(result.reason);
      return;
    }
    SaveLoad.save();
    render();
  }

  // ========== 建築分頁：建造新建築 + 採集點升級 ==========

  function renderConstructionTab() {
    const state = GameState.get();
    const container = document.getElementById('construction-list');
    if (!container) return;

    container.innerHTML = Object.keys(GATHERING_SPOTS).map(spotId => {
      const spotDef = GATHERING_SPOTS[spotId];
      const spotState = state.spots[spotId];
      const availableBuildings = Object.values(BUILDINGS).filter(b => b.spot === spotId);

      const buildingsHtml = availableBuildings.map(b => {
        const built = GameState.hasBuilding(spotId, b.id);
        const locked = spotState.level < b.unlockLevel;

        if (built) {
          const level = GameState.getBuildingLevel(spotId, b.id);
          if (b.type !== 'gathering') {
            // 加工建築目前先不支援升級（維持 Lv.1），未來可再擴充
            return `<div class="building built">✅ ${b.icon} ${b.name}（已建造）</div>`;
          }
          if (level >= Gathering.MAX_BUILDING_LEVEL) {
            return `<div class="building built">✅ ${b.icon} ${b.name}（建築 Lv.${level}，已達最高等級）</div>`;
          }
          const upgradeCost = Gathering.getBuildingUpgradeCost(b.id, level);
          const canAffordUpgrade = GameState.hasResources(upgradeCost);
          return `
            <div class="building built">
              <div class="building-row">✅ ${b.icon} ${b.name}（建築 Lv.${level}）
                <button class="${canAffordUpgrade ? '' : 'disabled-look'}" onclick="UI.handleUpgradeBuilding('${spotId}', '${b.id}')">升級到 Lv.${level + 1}</button>
              </div>
              <div class="cost-text">升級需要：${formatCost(upgradeCost)}</div>
            </div>`;
        }
        if (locked) {
          return `<div class="building locked">🔒 ${b.icon} ${b.name}（需採集點等級 ${b.unlockLevel}）</div>`;
        }

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

      const nextLevel = SPOT_LEVELS[spotState.level];
      const upgradeHtml = nextLevel
        ? `<button onclick="UI.handleUpgradeSpot('${spotId}')">升級到 Lv.${nextLevel.level}（消耗：${formatCost(nextLevel.upgradeCost)}）</button>`
        : `<span class="max-level">已達最高等級</span>`;

      return `
        <div class="spot-card">
          <h3>${spotDef.icon} ${spotDef.name}（Lv.${spotState.level}）</h3>
          <div class="buildings">${buildingsHtml}</div>
          <div class="upgrade">${upgradeHtml}</div>
        </div>`;
    }).join('');
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
    const nextLevel = SPOT_LEVELS[spotState.level];
    if (!nextLevel) return;

    if (!GameState.spendResources(nextLevel.upgradeCost)) {
      alert('資源不足，無法升級');
      return;
    }
    spotState.level = nextLevel.level;
    SaveLoad.save();
    render();
  }

  function handleUpgradeBuilding(spotId, buildingId) {
    const level = GameState.getBuildingLevel(spotId, buildingId);
    if (level >= Gathering.MAX_BUILDING_LEVEL) return;

    const cost = Gathering.getBuildingUpgradeCost(buildingId, level);
    if (!GameState.spendResources(cost)) {
      alert(`資源不足，升級需要：${formatCost(cost)}`);
      return;
    }
    GameState.upgradeBuilding(spotId, buildingId);
    SaveLoad.save();
    render();
  }

  // ========== 存檔管理（在人物資訊分頁裡） ==========

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

  function handleSaveToSlot(slotIndex) {
    const activeSlot = SaveLoad.getActiveSlot();
    const meta = SaveLoad.getSlotMeta(slotIndex);

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

    SaveLoad.save(activeSlot);
    const report = SaveLoad.loadSlot(slotIndex);
    render();
    UI.showOfflineReport(report);
  }

  function handleClearSlot(slotIndex) {
    const ok = confirm(
      `確定要清空存檔格 ${slotIndex} 嗎？\n\n這個動作無法復原，這個格子裡的所有資料都會永久消失。`
    );
    if (!ok) return;

    SaveLoad.clearSlot(slotIndex);
    render();
    notifySimple(`存檔格 ${slotIndex} 已清空`);
  }

  // ========== 通知 ==========

  function notifySimple(text) {
    const container = document.getElementById('notifications');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = text;
    container.appendChild(div);
    setTimeout(() => div.remove(), 2500);
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
    if (report.offlineSeconds < 5) return;

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

  // ========== 總渲染入口 ==========

  function render() {
    renderResources();
    renderCharacterPanel();
    renderFoodList();
    renderSaveSlots();
    renderProductionTab();
    renderCraftingTab();
    renderCraftingQueue();
    renderConstructionTab();
  }

  return {
    render, switchTab,
    handleBuild, handleUpgradeSpot, handleUpgradeBuilding, handleCraft, handleManualGather, handleEatFood,
    toggleProbabilityView,
    notifyCraftingCompleted, showOfflineReport,
    handleSaveToSlot, handleLoadSlot, handleClearSlot
  };
})();
