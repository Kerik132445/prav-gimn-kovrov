(() => {
	const MENU_API_URL = `${window.API_BASE_URL}/api/menu`;

	const AGE_GROUP_LABELS = {
		spassky: "Меню для 1–4 классов (Спасский корпус)",
		pokrovsky: "Меню для 5–11 классов (Покровский корпус)"
	};

	const DAY_LABELS = {
		1: "1 день (Понедельник)",
		2: "2 день (Вторник)",
		3: "3 день (Среда)",
		4: "4 день (Четверг)",
		5: "5 день (Пятница)"
	};

	const SHORT_DAY_LABELS = {
		1: "1 день (Пн)",
		2: "2 день (Вт)",
		3: "3 день (Ср)",
		4: "4 день (Чт)",
		5: "5 день (Пт)"
	};

	const MEAL_LABELS = {
		breakfast: "Завтрак",
		lunch: "Обед",
		snack: "Полдник / доп. питание"
	};

	const DISH_CATEGORY_LABELS = {
		first: "Первое блюдо",
		second: "Второе / гарнир",
		salad: "Салат / закуска",
		drink: "Напиток",
		bakery: "Хлеб / выпечка",
		fruit: "Фрукты / овощи",
		dessert: "Десерт",
		other: "Другое"
	};

	const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
	const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

	const tabCountEl = document.querySelector("#menu-tab-count");
	const countSpasskyEl = document.querySelector("#menu-group-count-spassky");
	const countPokrovskyEl = document.querySelector("#menu-group-count-pokrovsky");
	const groupTabsContainer = document.querySelector("#menu-group-tabs");
	const weekTabsContainer = document.querySelector("#menu-week-tabs");
	const dayTabsContainer = document.querySelector("#menu-day-tabs");
	const contextBarEl = document.querySelector("#menu-context-bar");
	const workspaceEl = document.querySelector("#menu-day-workspace");

	const createItemBtn = document.querySelector("#menu-create-item-button");
	const openCopyDayBtn = document.querySelector("#menu-open-copy-day-button");
	const openCopyWeekBtn = document.querySelector("#menu-open-copy-week-button");
	const clearDayBtn = document.querySelector("#menu-clear-day-button");

	const itemModal = document.querySelector("#menu-item-modal");
	const itemModalOverlay = document.querySelector("#menu-item-modal-overlay");
	const itemModalClose = document.querySelector("#menu-item-modal-close");
	const itemCancelBtn = document.querySelector("#menu-item-cancel-button");
	const itemModalTitle = document.querySelector("#menu-item-modal-title");
	const itemForm = document.querySelector("#menu-item-form");
	const itemFormError = document.querySelector("#menu-item-form-error");
	const itemIdInput = document.querySelector("#menu-item-id");
	const itemGroupSelect = document.querySelector("#menu-item-age-group");
	const itemWeekSelect = document.querySelector("#menu-item-week");
	const itemDaySelect = document.querySelector("#menu-item-day");
	const itemMealSelect = document.querySelector("#menu-item-meal-type");
	const itemDishCatSelect = document.querySelector("#menu-item-dish-category");
	const itemNameInput = document.querySelector("#menu-item-name");
	const itemWeightInput = document.querySelector("#menu-item-weight");
	const itemDescInput = document.querySelector("#menu-item-description");
	const itemCompInput = document.querySelector("#menu-item-composition");
	const itemImageInput = document.querySelector("#menu-item-image");
	const itemPreviewWrap = document.querySelector("#menu-item-image-preview-wrap");
	const itemPreview = document.querySelector("#menu-item-image-preview");
	const itemRemoveImageBtn = document.querySelector("#menu-item-remove-image-button");
	const itemSaveBtn = document.querySelector("#menu-item-save-button");
	const itemSaveNextBtn = document.querySelector("#menu-item-save-next-button");

	const copyDayModal = document.querySelector("#menu-copy-day-modal");
	const copyDayOverlay = document.querySelector("#menu-copy-day-modal-overlay");
	const copyDayClose = document.querySelector("#menu-copy-day-modal-close");
	const copyDayCancelBtn = document.querySelector("#menu-copy-day-cancel-button");
	const copyDayForm = document.querySelector("#menu-copy-day-form");
	const copyDayError = document.querySelector("#menu-copy-day-error");
	const copyDaySrcGroup = document.querySelector("#menu-copy-day-src-group");
	const copyDaySrcWeek = document.querySelector("#menu-copy-day-src-week");
	const copyDaySrcDay = document.querySelector("#menu-copy-day-src-day");
	const copyDayDstGroup = document.querySelector("#menu-copy-day-dst-group");
	const copyDayDstWeek = document.querySelector("#menu-copy-day-dst-week");
	const copyDayDstDay = document.querySelector("#menu-copy-day-dst-day");
	const copyDayOverwrite = document.querySelector("#menu-copy-day-overwrite");
	const copyDaySubmitBtn = document.querySelector("#menu-copy-day-submit-button");

	const copyWeekModal = document.querySelector("#menu-copy-week-modal");
	const copyWeekOverlay = document.querySelector("#menu-copy-week-modal-overlay");
	const copyWeekClose = document.querySelector("#menu-copy-week-modal-close");
	const copyWeekCancelBtn = document.querySelector("#menu-copy-week-cancel-button");
	const copyWeekForm = document.querySelector("#menu-copy-week-form");
	const copyWeekError = document.querySelector("#menu-copy-week-error");
	const copyWeekSrcGroup = document.querySelector("#menu-copy-week-src-group");
	const copyWeekSrcWeek = document.querySelector("#menu-copy-week-src-week");
	const copyWeekDstGroup = document.querySelector("#menu-copy-week-dst-group");
	const copyWeekDstWeek = document.querySelector("#menu-copy-week-dst-week");
	const copyWeekOverwrite = document.querySelector("#menu-copy-week-overwrite");
	const copyWeekSubmitBtn = document.querySelector("#menu-copy-week-submit-button");

	let selectedGroup = "spassky";
	let selectedWeek = 1;
	let selectedDay = 1;
	let currentItems = [];
	let currentSummaries = [];
	let summaryStats = null;
	let removeImageFlag = false;
	let existingEditingImageUrl = null;
	let showSnackForce = false;

	function escapeText(value) {
		return window.AdminApp.escapeHtml(value == null ? "" : String(value));
	}

	function showBannerError(el, message) {
		if (!el) return;
		if (!message) {
			el.textContent = "";
			el.hidden = true;
			return;
		}
		el.textContent = message;
		el.hidden = false;
	}

	function openModal(modalEl) {
		if (!modalEl) return;
		modalEl.classList.add("modal--active");
		document.body.style.overflow = "hidden";
	}

	function closeModal(modalEl) {
		if (!modalEl) return;
		modalEl.classList.remove("modal--active");
		document.body.style.overflow = "";
	}

	function updateContextBar() {
		if (!contextBarEl) return;
		contextBarEl.textContent = `${AGE_GROUP_LABELS[selectedGroup]} → ${selectedWeek} неделя → ${DAY_LABELS[selectedDay]}`;
	}

	function syncNavControls() {
		groupTabsContainer?.querySelectorAll("[data-menu-group]").forEach(btn => {
			btn.classList.toggle("menu-group-tab--active", btn.dataset.menuGroup === selectedGroup);
		});
		weekTabsContainer?.querySelectorAll("[data-menu-week]").forEach(btn => {
			btn.classList.toggle("schedule-day-tab--active", Number(btn.dataset.menuWeek) === selectedWeek);
		});
		dayTabsContainer?.querySelectorAll("[data-menu-day]").forEach(btn => {
			const dayNum = Number(btn.dataset.menuDay);
			btn.classList.toggle("schedule-day-tab--active", dayNum === selectedDay);
			const slot = summaryStats?.days?.[`${selectedGroup}:${selectedWeek}:${dayNum}`];
			const count = slot ? slot.total : 0;
			btn.innerHTML = `${escapeText(SHORT_DAY_LABELS[dayNum])}<span class="menu-day-tab__count">${count}</span>`;
		});

		if (tabCountEl && summaryStats) {
			tabCountEl.textContent = String(summaryStats.total_items || 0);
		}
		if (countSpasskyEl && summaryStats?.group_totals) {
			countSpasskyEl.textContent = `Блюд: ${summaryStats.group_totals.spassky || 0}`;
		}
		if (countPokrovskyEl && summaryStats?.group_totals) {
			countPokrovskyEl.textContent = `Блюд: ${summaryStats.group_totals.pokrovsky || 0}`;
		}
		updateContextBar();
	}

	function renderDishCard(item, index, total) {
		const catLabel = item.dish_category ? DISH_CATEGORY_LABELS[item.dish_category] || item.dish_category : "";
		const imageHtml = item.image
			? `<img src="${escapeText(window.AdminApp.getImageUrl(item.image))}" alt="${escapeText(item.name)}" class="menu-dish-card__thumb">`
			: "";

		const detailsParts = [];
		if (item.description) {
			detailsParts.push(`<p class="menu-dish-card__desc">${escapeText(item.description)}</p>`);
		}
		if (item.composition) {
			detailsParts.push(`<p class="menu-dish-card__desc"><strong>Состав:</strong> ${escapeText(item.composition)}</p>`);
		}

		return `
			<article class="menu-dish-card" data-menu-item-id="${item.id}">
				<div class="menu-dish-card__main">
					${imageHtml}
					<div class="menu-dish-card__body">
						<div class="menu-dish-card__top">
							<span class="menu-dish-card__name">${escapeText(item.name)}</span>
							${item.weight ? `<span class="menu-dish-card__weight">${escapeText(item.weight)}</span>` : ""}
						</div>
						${catLabel ? `
							<div class="menu-dish-card__badges">
								<span class="teacher-badge">${escapeText(catLabel)}</span>
							</div>
						` : ""}
						${detailsParts.join("")}
					</div>
				</div>
				<div class="menu-dish-card__actions">
					<button type="button" class="admin-button" data-move-menu="up" data-item-id="${item.id}" ${index === 0 ? "disabled" : ""} title="Переместить выше">↑</button>
					<button type="button" class="admin-button" data-move-menu="down" data-item-id="${item.id}" ${index === total - 1 ? "disabled" : ""} title="Переместить ниже">↓</button>
					<button type="button" class="admin-button" data-edit-menu-item="${item.id}">Изменить</button>
					<button type="button" class="admin-button news-card__delete" data-delete-menu-item="${item.id}">Удалить</button>
				</div>
			</article>
		`;
	}

	function renderMealBox(mealType) {
		const mealTitle = MEAL_LABELS[mealType] || mealType;
		const mealItems = currentItems
			.filter(i => i.meal_type === mealType)
			.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
		const summary = currentSummaries.find(s => s.meal_type === mealType) || {};

		const listHtml = mealItems.length
			? mealItems.map((item, idx) => renderDishCard(item, idx, mealItems.length)).join("")
			: `<div class="admin-empty">В категории «${escapeText(mealTitle)}» пока нет блюд.</div>`;

		return `
			<section class="menu-meal-box" data-meal-type="${mealType}">
				<div class="menu-meal-box__header">
					<div class="menu-meal-box__title-group">
						<h3>${escapeText(mealTitle)}</h3>
						<span class="teacher-badge">${mealItems.length} бл.</span>
					</div>
					<button type="button" class="admin-button admin-button--primary" data-add-meal-item="${mealType}">
						+ Добавить блюдо
					</button>
				</div>

				<form class="menu-meal-meta-form" data-meal-meta-form="${mealType}">
					<label class="form-field">
						<span>Стоимость</span>
						<input type="text" name="price" maxlength="64" placeholder="75,92 ₽" value="${escapeText(summary.price || "")}">
					</label>
					<label class="form-field">
						<span>КБЖУ / примечание</span>
						<input type="text" name="kbju" maxlength="128" placeholder="Б: 15г Ж: 16г У: 136г | 409 ккал" value="${escapeText(summary.kbju || "")}">
					</label>
					<button type="submit" class="admin-button" data-save-meta-btn="${mealType}">Сохранить</button>
					<span class="menu-meal-meta-status" data-meta-status="${mealType}" hidden></span>
				</form>

				<div class="menu-items-list">
					${listHtml}
				</div>
			</section>
		`;
	}

	function renderWorkspace() {
		if (!workspaceEl) return;

		const snackItemsCount = currentItems.filter(i => i.meal_type === "snack").length;
		const snackSummary = currentSummaries.find(s => s.meal_type === "snack");
		const hasSnackData = showSnackForce || snackItemsCount > 0 || Boolean(snackSummary && (snackSummary.price || snackSummary.kbju));

		const snackSectionHtml = hasSnackData
			? renderMealBox("snack")
			: `
				<section class="menu-meal-box menu-meal-box--compact">
					<div>
						<strong>Дополнительный приём пищи (Полдник)</strong>
						<p style="margin:4px 0 0; font-size:13px; color:#64748b;">На этот день полдник не задан. Можно добавить блюда отдельно при необходимости.</p>
					</div>
					<button type="button" class="admin-button" id="menu-expand-snack-btn">+ Добавить полдник</button>
				</section>
			`;

		workspaceEl.innerHTML = `
			<div class="menu-meals-grid">
				${renderMealBox("breakfast")}
				${renderMealBox("lunch")}
			</div>
			${snackSectionHtml}
		`;
	}

	async function refreshAll() {
		try {
			const [summaryResp, dayResp] = await Promise.all([
				fetch(`${MENU_API_URL}/summary`),
				fetch(`${MENU_API_URL}/?age_group=${encodeURIComponent(selectedGroup)}&week_number=${selectedWeek}&day_of_week=${selectedDay}`)
			]);

			if (!summaryResp.ok) throw new Error(`Ошибка сводки меню: ${summaryResp.status}`);
			if (!dayResp.ok) throw new Error(`Ошибка загрузки меню: ${dayResp.status}`);

			summaryStats = await summaryResp.json();
			const dayData = await dayResp.json();
			currentItems = Array.isArray(dayData.items) ? dayData.items : [];
			currentSummaries = Array.isArray(dayData.meal_summaries) ? dayData.meal_summaries : [];

			syncNavControls();
			renderWorkspace();
		} catch (error) {
			console.error(error);
			if (workspaceEl) {
				workspaceEl.innerHTML = `<div class="admin-empty">Не удалось загрузить меню питания.</div>`;
			}
		}
	}

	function updateImagePreviewDisplay(url) {
		if (!itemPreviewWrap || !itemPreview) return;
		if (!url) {
			itemPreview.innerHTML = "";
			itemPreviewWrap.hidden = true;
			if (itemRemoveImageBtn) itemRemoveImageBtn.hidden = true;
			return;
		}
		itemPreview.innerHTML = `<img src="${escapeText(url)}" alt="Предпросмотр блюда">`;
		itemPreviewWrap.hidden = false;
		if (itemRemoveImageBtn) {
			itemRemoveImageBtn.hidden = false;
		}
	}

	function openCreateItemModal(defaultMealType = "breakfast") {
		itemForm.reset();
		itemIdInput.value = "";
		showBannerError(itemFormError, "");

		itemGroupSelect.value = selectedGroup;
		itemWeekSelect.value = String(selectedWeek);
		itemDaySelect.value = String(selectedDay);
		itemMealSelect.value = defaultMealType || "breakfast";
		itemDishCatSelect.value = "";

		removeImageFlag = false;
		existingEditingImageUrl = null;
		updateImagePreviewDisplay("");

		itemModalTitle.textContent = "Добавление блюда";
		itemSaveBtn.textContent = "Добавить блюдо";
		itemSaveBtn.disabled = false;
		itemSaveNextBtn.disabled = false;
		itemSaveNextBtn.hidden = false;

		openModal(itemModal);
		setTimeout(() => itemNameInput?.focus(), 50);
	}

	function openEditItemModal(itemId) {
		const item = currentItems.find(i => i.id === itemId);
		if (!item) return;

		itemForm.reset();
		showBannerError(itemFormError, "");

		itemIdInput.value = String(item.id);
		itemGroupSelect.value = item.age_group;
		itemWeekSelect.value = String(item.week_number);
		itemDaySelect.value = String(item.day_of_week);
		itemMealSelect.value = item.meal_type;
		itemDishCatSelect.value = item.dish_category || "";
		itemNameInput.value = item.name;
		itemWeightInput.value = item.weight || "";
		itemDescInput.value = item.description || "";
		itemCompInput.value = item.composition || "";

		removeImageFlag = false;
		existingEditingImageUrl = item.image || null;
		updateImagePreviewDisplay(existingEditingImageUrl ? window.AdminApp.getImageUrl(existingEditingImageUrl) : "");

		itemModalTitle.textContent = "Редактирование блюда";
		itemSaveBtn.textContent = "Сохранить изменения";
		itemSaveBtn.disabled = false;
		itemSaveNextBtn.disabled = false;
		itemSaveNextBtn.hidden = true;

		openModal(itemModal);
		setTimeout(() => itemNameInput?.focus(), 50);
	}

	function validateSelectedImageFile(file) {
		if (!file) return true;
		if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
			showBannerError(itemFormError, "Допустимы только изображения JPG, PNG и WEBP.");
			return false;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			showBannerError(itemFormError, "Размер фотографии не должен превышать 10 МБ.");
			return false;
		}
		return true;
	}

	itemImageInput?.addEventListener("change", () => {
		showBannerError(itemFormError, "");
		const file = itemImageInput.files[0];
		if (!file) {
			if (!removeImageFlag && existingEditingImageUrl) {
				updateImagePreviewDisplay(window.AdminApp.getImageUrl(existingEditingImageUrl));
			} else {
				updateImagePreviewDisplay("");
			}
			return;
		}
		if (!validateSelectedImageFile(file)) {
			itemImageInput.value = "";
			return;
		}
		removeImageFlag = false;
		const reader = new FileReader();
		reader.onload = () => updateImagePreviewDisplay(reader.result);
		reader.readAsDataURL(file);
	});

	itemRemoveImageBtn?.addEventListener("click", () => {
		itemImageInput.value = "";
		removeImageFlag = true;
		existingEditingImageUrl = null;
		updateImagePreviewDisplay("");
	});

	async function handleSaveItem({ addNext = false } = {}) {
		showBannerError(itemFormError, "");

		const editId = itemIdInput.value;
		const ageGroup = itemGroupSelect.value;
		const weekNumber = Number(itemWeekSelect.value);
		const dayNumber = Number(itemDaySelect.value);
		const mealType = itemMealSelect.value;
		const name = itemNameInput.value.trim();

		if (!name) {
			showBannerError(itemFormError, "Укажите название блюда.");
			return;
		}

		const imageFile = itemImageInput.files[0];
		if (imageFile && !validateSelectedImageFile(imageFile)) {
			return;
		}

		const formData = new FormData();
		formData.append("age_group", ageGroup);
		formData.append("week_number", String(weekNumber));
		formData.append("day_of_week", String(dayNumber));
		formData.append("meal_type", mealType);
		formData.append("dish_category", itemDishCatSelect.value || "");
		formData.append("name", name);
		formData.append("weight", itemWeightInput.value.trim());
		formData.append("description", itemDescInput.value.trim());
		formData.append("composition", itemCompInput.value.trim());

		if (editId) {
			formData.append("remove_image", removeImageFlag ? "true" : "false");
		}
		if (imageFile) {
			formData.append("image", imageFile);
		}

		itemSaveBtn.disabled = true;
		itemSaveNextBtn.disabled = true;

		try {
			const url = editId ? `${MENU_API_URL}/items/${editId}` : `${MENU_API_URL}/items`;
			const response = await window.AdminApp.apiFetch(url, {
				method: editId ? "PUT" : "POST",
				body: formData
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}

			selectedGroup = ageGroup;
			selectedWeek = weekNumber;
			selectedDay = dayNumber;
			if (mealType === "snack") showSnackForce = true;

			await refreshAll();

			if (addNext && !editId) {
				itemNameInput.value = "";
				itemWeightInput.value = "";
				itemDescInput.value = "";
				itemCompInput.value = "";
				itemDishCatSelect.value = "";
				itemImageInput.value = "";
				removeImageFlag = false;
				existingEditingImageUrl = null;
				updateImagePreviewDisplay("");
				itemNameInput.focus();
			} else {
				closeModal(itemModal);
			}
		} catch (error) {
			showBannerError(itemFormError, error.message || "Не удалось сохранить блюдо.");
		} finally {
			itemSaveBtn.disabled = false;
			itemSaveNextBtn.disabled = false;
		}
	}

	async function handleDeleteItem(itemId) {
		const item = currentItems.find(i => i.id === itemId);
		const label = item ? item.name : `#${itemId}`;
		if (!confirm(`Удалить блюдо «${label}» из меню этого дня?`)) {
			return;
		}
		try {
			const response = await window.AdminApp.apiFetch(`${MENU_API_URL}/items/${itemId}`, {
				method: "DELETE"
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось удалить блюдо");
			}
			await refreshAll();
		} catch (error) {
			alert(error.message || "Не удалось удалить блюдо.");
		}
	}

	async function handleMoveItem(itemId, direction) {
		const target = currentItems.find(i => i.id === itemId);
		if (!target) return;

		const list = currentItems
			.filter(i => i.meal_type === target.meal_type)
			.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

		const idx = list.findIndex(i => i.id === itemId);
		const swapIdx = direction === "up" ? idx - 1 : idx + 1;
		if (idx === -1 || swapIdx < 0 || swapIdx >= list.length) return;

		const copy = list.slice();
		const [moved] = copy.splice(idx, 1);
		copy.splice(swapIdx, 0, moved);

		const payload = {
			items: copy.map((row, pos) => ({
				id: row.id,
				sort_order: (pos + 1) * 10
			}))
		};

		try {
			const response = await window.AdminApp.apiFetch(`${MENU_API_URL}/items/reorder`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось изменить порядок блюд");
			}
			await refreshAll();
		} catch (error) {
			alert(error.message || "Не удалось изменить порядок блюд.");
		}
	}

	async function handleSaveMealMeta(form) {
		const mealType = form.dataset.mealMetaForm;
		const price = form.elements.price.value.trim();
		const kbju = form.elements.kbju.value.trim();
		const statusEl = form.querySelector(`[data-meta-status="${mealType}"]`);
		const submitBtn = form.querySelector(`[data-save-meta-btn="${mealType}"]`);

		if (submitBtn) submitBtn.disabled = true;
		try {
			const response = await window.AdminApp.apiFetch(`${MENU_API_URL}/meal-meta`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					age_group: selectedGroup,
					week_number: selectedWeek,
					day_of_week: selectedDay,
					meal_type: mealType,
					price: price || null,
					kbju: kbju || null
				})
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось сохранить параметры приёма пищи");
			}
			await refreshAll();
			const freshStatus = workspaceEl?.querySelector(`[data-meta-status="${mealType}"]`);
			if (freshStatus) {
				freshStatus.textContent = "Параметры приёма пищи сохранены";
				freshStatus.hidden = false;
				setTimeout(() => {
					freshStatus.hidden = true;
				}, 2500);
			}
		} catch (error) {
			if (statusEl) {
				statusEl.style.color = "#b91c1c";
				statusEl.textContent = error.message || "Ошибка сохранения";
				statusEl.hidden = false;
			} else {
				alert(error.message || "Не удалось сохранить параметры приёма пищи.");
			}
		} finally {
			if (submitBtn) submitBtn.disabled = false;
		}
	}

	async function handleClearDay() {
		const label = `${AGE_GROUP_LABELS[selectedGroup]}, ${selectedWeek} неделя, ${DAY_LABELS[selectedDay]}`;
		if (!confirm(`Полностью очистить меню за выбранный день (${label})?`)) {
			return;
		}
		try {
			const url = `${MENU_API_URL}/clear?age_group=${encodeURIComponent(selectedGroup)}&week_number=${selectedWeek}&day_of_week=${selectedDay}`;
			const response = await window.AdminApp.apiFetch(url, { method: "DELETE" });
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось очистить день");
			}
			showSnackForce = false;
			await refreshAll();
		} catch (error) {
			alert(error.message || "Не удалось очистить меню дня.");
		}
	}

	function openCopyDayModal() {
		copyDayForm.reset();
		showBannerError(copyDayError, "");
		if (copyDaySubmitBtn) copyDaySubmitBtn.disabled = false;

		copyDaySrcGroup.value = selectedGroup;
		copyDaySrcWeek.value = String(selectedWeek);
		copyDaySrcDay.value = String(selectedDay);

		copyDayDstGroup.value = selectedGroup;
		copyDayDstWeek.value = String(selectedWeek);
		copyDayDstDay.value = String(selectedDay < 5 ? selectedDay + 1 : 1);
		copyDayOverwrite.checked = false;

		openModal(copyDayModal);
	}

	function openCopyWeekModal() {
		copyWeekForm.reset();
		showBannerError(copyWeekError, "");
		if (copyWeekSubmitBtn) copyWeekSubmitBtn.disabled = false;

		copyWeekSrcGroup.value = selectedGroup;
		copyWeekSrcWeek.value = String(selectedWeek);
		copyWeekDstGroup.value = selectedGroup;
		copyWeekDstWeek.value = selectedWeek === 1 ? "2" : "1";
		copyWeekOverwrite.checked = false;

		openModal(copyWeekModal);
	}

	groupTabsContainer?.addEventListener("click", (event) => {
		const btn = event.target.closest("[data-menu-group]");
		if (!btn) return;
		const nextGroup = btn.dataset.menuGroup;
		if (nextGroup === selectedGroup) return;
		selectedGroup = nextGroup;
		showSnackForce = false;
		refreshAll();
	});

	weekTabsContainer?.addEventListener("click", (event) => {
		const btn = event.target.closest("[data-menu-week]");
		if (!btn) return;
		const nextWeek = Number(btn.dataset.menuWeek);
		if (nextWeek === selectedWeek) return;
		selectedWeek = nextWeek;
		showSnackForce = false;
		refreshAll();
	});

	dayTabsContainer?.addEventListener("click", (event) => {
		const btn = event.target.closest("[data-menu-day]");
		if (!btn) return;
		const nextDay = Number(btn.dataset.menuDay);
		if (nextDay === selectedDay) return;
		selectedDay = nextDay;
		showSnackForce = false;
		refreshAll();
	});

	workspaceEl?.addEventListener("click", (event) => {
		const addBtn = event.target.closest("[data-add-meal-item]");
		if (addBtn) {
			openCreateItemModal(addBtn.dataset.addMealItem);
			return;
		}
		if (event.target.closest("#menu-expand-snack-btn")) {
			showSnackForce = true;
			renderWorkspace();
			return;
		}
		const editBtn = event.target.closest("[data-edit-menu-item]");
		if (editBtn) {
			openEditItemModal(Number(editBtn.dataset.editMenuItem));
			return;
		}
		const delBtn = event.target.closest("[data-delete-menu-item]");
		if (delBtn) {
			handleDeleteItem(Number(delBtn.dataset.deleteMenuItem));
			return;
		}
		const moveBtn = event.target.closest("[data-move-menu]");
		if (moveBtn && !moveBtn.disabled) {
			handleMoveItem(Number(moveBtn.dataset.itemId), moveBtn.dataset.moveMenu);
		}
	});

	workspaceEl?.addEventListener("submit", (event) => {
		const form = event.target.closest("[data-meal-meta-form]");
		if (!form) return;
		event.preventDefault();
		handleSaveMealMeta(form);
	});

	createItemBtn?.addEventListener("click", () => openCreateItemModal("breakfast"));
	itemModalClose?.addEventListener("click", () => closeModal(itemModal));
	itemCancelBtn?.addEventListener("click", () => closeModal(itemModal));
	itemModalOverlay?.addEventListener("click", () => closeModal(itemModal));

	itemForm?.addEventListener("submit", (event) => {
		event.preventDefault();
		handleSaveItem({ addNext: false });
	});
	itemSaveNextBtn?.addEventListener("click", () => {
		handleSaveItem({ addNext: true });
	});

	openCopyDayBtn?.addEventListener("click", openCopyDayModal);
	copyDayClose?.addEventListener("click", () => closeModal(copyDayModal));
	copyDayCancelBtn?.addEventListener("click", () => closeModal(copyDayModal));
	copyDayOverlay?.addEventListener("click", () => closeModal(copyDayModal));

	copyDayForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		showBannerError(copyDayError, "");
		copyDaySubmitBtn.disabled = true;

		const payload = {
			source_age_group: copyDaySrcGroup.value,
			source_week: Number(copyDaySrcWeek.value),
			source_day: Number(copyDaySrcDay.value),
			target_age_group: copyDayDstGroup.value,
			target_week: Number(copyDayDstWeek.value),
			target_day: Number(copyDayDstDay.value),
			overwrite: Boolean(copyDayOverwrite.checked)
		};

		try {
			const response = await window.AdminApp.apiFetch(`${MENU_API_URL}/copy-day`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}
			selectedGroup = payload.target_age_group;
			selectedWeek = payload.target_week;
			selectedDay = payload.target_day;
			await refreshAll();
			closeModal(copyDayModal);
		} catch (error) {
			showBannerError(copyDayError, error.message || "Не удалось скопировать меню дня.");
		} finally {
			copyDaySubmitBtn.disabled = false;
		}
	});

	openCopyWeekBtn?.addEventListener("click", openCopyWeekModal);
	copyWeekClose?.addEventListener("click", () => closeModal(copyWeekModal));
	copyWeekCancelBtn?.addEventListener("click", () => closeModal(copyWeekModal));
	copyWeekOverlay?.addEventListener("click", () => closeModal(copyWeekModal));

	copyWeekForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		showBannerError(copyWeekError, "");
		copyWeekSubmitBtn.disabled = true;

		const payload = {
			source_age_group: copyWeekSrcGroup.value,
			source_week: Number(copyWeekSrcWeek.value),
			target_age_group: copyWeekDstGroup.value,
			target_week: Number(copyWeekDstWeek.value),
			overwrite: Boolean(copyWeekOverwrite.checked)
		};

		try {
			const response = await window.AdminApp.apiFetch(`${MENU_API_URL}/copy-week`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}
			selectedGroup = payload.target_age_group;
			selectedWeek = payload.target_week;
			await refreshAll();
			closeModal(copyWeekModal);
		} catch (error) {
			showBannerError(copyWeekError, error.message || "Не удалось скопировать неделю.");
		} finally {
			copyWeekSubmitBtn.disabled = false;
		}
	});

	clearDayBtn?.addEventListener("click", handleClearDay);

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") return;
		[itemModal, copyDayModal, copyWeekModal].forEach(m => {
			if (m?.classList.contains("modal--active")) closeModal(m);
		});
	});

	window.initMenuAdmin = async function initMenuAdmin() {
		await refreshAll();
	};
})();
