(() => {
	const MENU_API_URL = `${window.API_BASE_URL}/api/menu`;

	const MEAL_TYPE_TITLES = {
		breakfast: "ЗАВТРАК",
		lunch: "ОБЕД",
		snack: "ПОЛДНИК"
	};

	const MEAL_ORDER = ["breakfast", "lunch", "snack"];

	const DISH_CATEGORY_LABELS = {
		first: "Первое",
		second: "Второе",
		salad: "Салат",
		drink: "Напиток",
		bakery: "Выпечка",
		fruit: "Фрукты",
		dessert: "Десерт",
		other: "Другое"
	};

	const container = document.getElementById("canteen-meals-container")
		|| document.querySelector(".canteen-board__meals");
	const dayButtons = document.querySelectorAll(".tab-group:nth-child(2) .tab-btn");
	const weekButtons = document.querySelectorAll(".tab-group:nth-child(1) .tab-btn");
	const campusButtons = document.querySelectorAll(".building-card");

	let currentBuilding = "spassky";
	let currentWeek = 1;
	let currentDay = 1;

	const weekCache = new Map();
	let activeRequestId = 0;

	function escapeHtml(text) {
		return String(text ?? "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}

	function resolveImageUrl(imagePath) {
		if (!imagePath) return "";
		if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
			return imagePath;
		}
		if (imagePath.startsWith("/")) {
			return `${window.API_BASE_URL}${imagePath}`;
		}
		return `${window.API_BASE_URL}/${imagePath}`;
	}

	function parseWeekNumber(rawWeek) {
		const digits = String(rawWeek || "").replace(/\D+/g, "");
		const num = Number(digits);
		return num === 2 ? 2 : 1;
	}

	function parseDayNumber(rawDay) {
		const digits = String(rawDay || "").replace(/\D+/g, "");
		const num = Number(digits);
		return num >= 1 && num <= 5 ? num : 1;
	}

	function renderDishItem(dish) {
		const categoryLabel = dish.dish_category
			? (DISH_CATEGORY_LABELS[dish.dish_category] || dish.dish_category)
			: "";
		const hasRichFields = Boolean(dish.image || dish.description || dish.composition || categoryLabel);

		if (!hasRichFields) {
			return `
				<li class="meal-card__item">
					<span class="meal-card__dish-name">${escapeHtml(dish.name)}</span>
					${dish.weight ? `<span class="meal-card__dish-weight">${escapeHtml(dish.weight)}</span>` : ""}
				</li>
			`;
		}

		const extraParts = [];
		if (categoryLabel) {
			extraParts.push(`<span class="meal-card__dish-tag">${escapeHtml(categoryLabel)}</span>`);
		}
		if (dish.description) {
			extraParts.push(`<p class="meal-card__dish-extra">${escapeHtml(dish.description)}</p>`);
		}
		if (dish.composition) {
			extraParts.push(`<p class="meal-card__dish-extra">Состав: ${escapeHtml(dish.composition)}</p>`);
		}

		const thumbHtml = dish.image
			? `<img src="${escapeHtml(resolveImageUrl(dish.image))}" alt="${escapeHtml(dish.name)}" class="meal-card__dish-thumb" loading="lazy">`
			: "";

		return `
			<li class="meal-card__item meal-card__item--rich">
				<div class="meal-card__dish-main">
					${thumbHtml}
					<div class="meal-card__dish-content">
						<div class="meal-card__dish-row">
							<span class="meal-card__dish-name">${escapeHtml(dish.name)}</span>
							${dish.weight ? `<span class="meal-card__dish-weight">${escapeHtml(dish.weight)}</span>` : ""}
						</div>
						${extraParts.join("")}
					</div>
				</div>
			</li>
		`;
	}

	function renderMealCard(mealType, dishes, summary) {
		const title = MEAL_TYPE_TITLES[mealType] || mealType.toUpperCase();
		const price = summary?.price ? `<span class="meal-card__price">${escapeHtml(summary.price)}</span>` : "";
		const footerText = summary?.kbju || summary?.note || "";

		const listHtml = dishes.length
			? dishes.map(renderDishItem).join("")
			: `<li class="meal-card__item meal-card__item--empty">Список блюд уточняется</li>`;

		const footerHtml = footerText
			? `
				<div class="meal-card__footer">
					<span class="meal-card__kbju">${escapeHtml(footerText)}</span>
				</div>
			`
			: "";

		return `
			<div class="meal-card is-menu-visible" data-meal-type="${escapeHtml(mealType)}">
				<div class="meal-card__header">
					<span class="meal-card__title">${escapeHtml(title)}</span>
					${price}
				</div>
				<ul class="meal-card__list">
					${listHtml}
				</ul>
				${footerHtml}
			</div>
		`;
	}

	function renderStatus(message, { isError = false } = {}) {
		if (!container) return;
		container.innerHTML = `
			<div class="meal-card meal-card--status ${isError ? "meal-card--error" : ""}">
				<p class="meal-card__status-text">${escapeHtml(message)}</p>
				${isError ? `<button type="button" class="meal-card__retry-btn" id="menu-retry-button">Повторить попытку</button>` : ""}
			</div>
		`;
	}

	function renderCurrentDay(weekPayload) {
		if (!container) return;

		const items = Array.isArray(weekPayload?.items) ? weekPayload.items : [];
		const summaries = Array.isArray(weekPayload?.meal_summaries) ? weekPayload.meal_summaries : [];

		const dayItems = items.filter(item => item.day_of_week === currentDay);
		const daySummaries = summaries.filter(s => s.day_of_week === currentDay);

		const cardsHtml = [];
		for (const mealType of MEAL_ORDER) {
			const mealDishes = dayItems
				.filter(item => item.meal_type === mealType)
				.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
			const mealSummary = daySummaries.find(s => s.meal_type === mealType);

			const hasContent = mealDishes.length > 0 || Boolean(mealSummary && (mealSummary.price || mealSummary.kbju || mealSummary.note));
			if (hasContent) {
				cardsHtml.push(renderMealCard(mealType, mealDishes, mealSummary));
			}
		}

		if (!cardsHtml.length) {
			renderStatus("Меню на выбранный день пока не заполнено.");
			return;
		}

		container.innerHTML = cardsHtml.join("");

		void container.offsetWidth;
		container.querySelectorAll(".meal-card").forEach(card => {
			card.classList.add("is-menu-visible");
		});
	}

	async function loadAndRender({ forceRefresh = false } = {}) {
		if (!container) return;

		const cacheKey = `${currentBuilding}:${currentWeek}`;
		if (!forceRefresh && weekCache.has(cacheKey)) {
			renderCurrentDay(weekCache.get(cacheKey));
			return;
		}

		const reqId = ++activeRequestId;
		renderStatus("Загрузка меню...");

		try {
			const response = await fetch(
				`${MENU_API_URL}/?age_group=${encodeURIComponent(currentBuilding)}&week_number=${currentWeek}`
			);
			if (!response.ok) {
				throw new Error(`Ошибка сервера: ${response.status}`);
			}
			const data = await response.json();
			weekCache.set(cacheKey, data);
			if (reqId !== activeRequestId) return;
			renderCurrentDay(data);
		} catch (error) {
			console.warn("Backend API недоступен, загружаем меню из локального резерва:", error);
			const fallbackWeek = window.FALLBACK_MENU_DATA?.[cacheKey];
			if (fallbackWeek) {
				weekCache.set(cacheKey, fallbackWeek);
				if (reqId !== activeRequestId) return;
				renderCurrentDay(fallbackWeek);
				return;
			}
			console.error(error);
			if (reqId !== activeRequestId) return;
			renderStatus("Не удалось загрузить меню питания. Проверьте подключение или попробуйте снова.", { isError: true });
		}
	}

	container?.addEventListener("click", (event) => {
		if (event.target.closest("#menu-retry-button")) {
			loadAndRender({ forceRefresh: true });
		}
	});

	dayButtons.forEach(btn => {
		btn.addEventListener("click", () => {
			dayButtons.forEach(b => b.classList.remove("tab-btn--active"));
			btn.classList.add("tab-btn--active");
			currentDay = parseDayNumber(btn.dataset.day);
			loadAndRender();
		});
	});

	weekButtons.forEach(btn => {
		btn.addEventListener("click", () => {
			weekButtons.forEach(b => b.classList.remove("tab-btn--active"));
			btn.classList.add("tab-btn--active");
			currentWeek = parseWeekNumber(btn.dataset.week);
			loadAndRender();
		});
	});

	campusButtons.forEach(btn => {
		btn.addEventListener("click", (event) => {
			campusButtons.forEach(b => b.classList.remove("building-card--active"));
			btn.classList.add("building-card--active");
			const targetBuilding = event.currentTarget?.dataset?.building || btn.dataset.building || "spassky";
			currentBuilding = targetBuilding;
			loadAndRender();
		});
	});

	loadAndRender();
})();
