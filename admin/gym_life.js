/**
 * Модуль управления разделом «Жизнь гимназии» в админ-панели
 * Управление школьной газетой «Доброе слово», театром «Встреча» и сменами летнего лагеря
 */

(function () {
	const API_BASE = window.API_BASE_URL || "";
	const NEWSPAPERS_API = `${API_BASE}/api/life/newspapers`;
	const THEATRE_API = `${API_BASE}/api/life/theatre-plays`;
	const CAMP_API = `${API_BASE}/api/life/camp-shifts`;

	let newspapersData = [];
	let theatreData = [];
	let campData = [];
	let activeSubTab = "newspapers";

	// DOM Элементы
	const section = document.getElementById("gym-life-section");
	const tabCountEl = document.getElementById("gym-life-tab-count");
	const subtabButtons = document.querySelectorAll("[data-life-subtab]");

	// Подсекции
	const newspapersSubtab = document.getElementById("life-subtab-newspapers");
	const theatreSubtab = document.getElementById("life-subtab-theatre");
	const campSubtab = document.getElementById("life-subtab-camp");

	// Списки
	const newspapersList = document.getElementById("admin-newspapers-list");
	const theatreList = document.getElementById("admin-theatre-list");
	const campList = document.getElementById("admin-camp-list");

	// Счетчики подвкладок
	const newspapersCountEl = document.getElementById("life-newspapers-count");
	const theatreCountEl = document.getElementById("life-theatre-count");
	const campCountEl = document.getElementById("life-camp-count");

	// Фильтры
	const newspaperYearFilter = document.getElementById("admin-newspaper-year-filter");

	// Модальные окна
	const newspaperModal = document.getElementById("admin-newspaper-modal");
	const newspaperForm = document.getElementById("admin-newspaper-form");
	const newspaperModalTitle = document.getElementById("admin-newspaper-modal-title");

	const theatreModal = document.getElementById("admin-theatre-modal");
	const theatreForm = document.getElementById("admin-theatre-form");
	const theatreModalTitle = document.getElementById("admin-theatre-modal-title");

	const campModal = document.getElementById("admin-camp-modal");
	const campForm = document.getElementById("admin-camp-form");
	const campModalTitle = document.getElementById("admin-camp-modal-title");

	// Утилиты
	function escapeHtml(str) {
		if (window.AdminApp && window.AdminApp.escapeHtml) {
			return window.AdminApp.escapeHtml(str);
		}
		if (!str) return "";
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	function resolveMediaUrl(url) {
		if (!url) return "";
		if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
			return url;
		}
		if (url.startsWith("/uploads") || url.startsWith("uploads/")) {
			const clean = url.startsWith("/") ? url : `/${url}`;
			return `${API_BASE}${clean}`;
		}
		if (url.startsWith("assets/") || url.startsWith("documents/")) {
			return `../${url}`;
		}
		if (!url.startsWith("/") && !url.startsWith("../")) {
			return `../${url}`;
		}
		return url;
	}

	function apiFetch(url, options) {
		if (window.AdminApp && window.AdminApp.apiFetch) {
			return window.AdminApp.apiFetch(url, options);
		}
		return fetch(url, options);
	}

	function openModal(modalEl) {
		if (modalEl) modalEl.classList.add("modal--active");
	}

	function closeModal(modalEl) {
		if (modalEl) modalEl.classList.remove("modal--active");
	}

	function updateTotalCount() {
		const total = newspapersData.length + theatreData.length + campData.length;
		if (tabCountEl) tabCountEl.textContent = total;
		if (newspapersCountEl) newspapersCountEl.textContent = newspapersData.length;
		if (theatreCountEl) theatreCountEl.textContent = theatreData.length;
		if (campCountEl) campCountEl.textContent = campData.length;
	}

	// =========================================================
	// ПЕРЕКЛЮЧЕНИЕ ПОДВКЛАДОК (ГАЗЕТА / ТЕАТР / ЛАГЕРЬ)
	// =========================================================
	function switchSubTab(subTabKey) {
		activeSubTab = subTabKey;
		subtabButtons.forEach((btn) => {
			const isActive = btn.dataset.lifeSubtab === subTabKey;
			btn.classList.toggle("gym-life-tab--active", isActive);
		});

		if (newspapersSubtab) newspapersSubtab.hidden = subTabKey !== "newspapers";
		if (theatreSubtab) theatreSubtab.hidden = subTabKey !== "theatre";
		if (campSubtab) campSubtab.hidden = subTabKey !== "camp";
	}

	subtabButtons.forEach((btn) => {
		btn.addEventListener("click", () => {
			switchSubTab(btn.dataset.lifeSubtab || "newspapers");
		});
	});

	// =========================================================
	// 1. ШКОЛЬНАЯ ГАЗЕТА «ДОБРОЕ СЛОВО»
	// =========================================================
	async function loadNewspapers() {
		if (!newspapersList) return;
		newspapersList.innerHTML = '<div class="admin-loading">Загрузка архива газет...</div>';

		try {
			const selectedYear = newspaperYearFilter ? newspaperYearFilter.value : "all";
			let url = NEWSPAPERS_API;
			if (selectedYear && selectedYear !== "all") {
				url += `?year=${encodeURIComponent(selectedYear)}`;
			}

			const res = await apiFetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();

			if (!selectedYear || selectedYear === "all") {
				newspapersData = data;
			}
			renderNewspapersList(data);
			updateNewspaperYearOptions();
			updateTotalCount();
		} catch (err) {
			console.error("Ошибка загрузки газет:", err);
			newspapersList.innerHTML = `<div class="admin-error">Не удалось загрузить газеты: ${escapeHtml(err.message)}</div>`;
		}
	}

	function updateNewspaperYearOptions() {
		if (!newspaperYearFilter || !newspapersData.length) return;
		const currentVal = newspaperYearFilter.value;
		const years = Array.from(new Set(newspapersData.map((n) => n.year))).filter(Boolean);
		years.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

		let html = '<option value="all">Все годы</option>';
		years.forEach((yr) => {
			html += `<option value="${escapeHtml(yr)}">${escapeHtml(yr)} год</option>`;
		});
		newspaperYearFilter.innerHTML = html;
		if (years.includes(currentVal)) {
			newspaperYearFilter.value = currentVal;
		}
	}

	function renderNewspapersList(items) {
		if (!newspapersList) return;
		if (!items || !items.length) {
			newspapersList.innerHTML = '<div class="admin-empty">Выпуски газеты не найдены. Нажмите «+ Добавить выпуск», чтобы добавить номер.</div>';
			return;
		}

		let html = '<div class="admin-cards-grid">';
		items.forEach((item) => {
			const isSpec = item.is_special;
			const specBadge = isSpec ? '<span class="life-badge life-badge--amber">🌟 Спецвыпуск</span>' : `<span class="life-badge life-badge--blue">${escapeHtml(item.year)} год</span>`;
			const fileSizeText = item.file_size ? `${escapeHtml(item.file_size)} • PDF` : "PDF документ";
			const fileUrl = resolveMediaUrl(item.file_url);

			html += `
				<div class="admin-item-card" data-newspaper-id="${item.id}">
					<div class="admin-item-card__header">
						<div class="admin-item-card__title-wrap">
							${specBadge}
							<span class="life-badge life-badge--gray">${escapeHtml(item.number)}</span>
						</div>
						<span class="admin-item-card__size">${fileSizeText}</span>
					</div>

					<div class="admin-item-card__body">
						<h3 class="admin-item-card__title">${escapeHtml(item.title)}</h3>
						${item.subtitle ? `<div class="admin-item-card__sub">${escapeHtml(item.subtitle)}</div>` : ""}
						${item.description ? `<p class="admin-item-card__desc">${escapeHtml(item.description)}</p>` : ""}
					</div>

					<div class="admin-item-card__footer">
						<div class="admin-item-card__link-wrap">
							<a href="${escapeHtml(fileUrl)}" target="_blank" class="admin-button admin-button--small admin-button--link" title="Открыть выпуск в новой вкладке">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
								<span>Открыть PDF</span>
							</a>
						</div>
						<div class="admin-item-card__actions">
							<button type="button" class="admin-button admin-button--small" data-newspaper-edit="${item.id}">
								Редактировать
							</button>
							<button type="button" class="admin-button admin-button--small admin-button--danger" data-newspaper-delete="${item.id}">
								Удалить
							</button>
						</div>
					</div>
				</div>
			`;
		});
		html += "</div>";
		newspapersList.innerHTML = html;

		// Навешиваем обработчики на кнопки карточек
		newspapersList.querySelectorAll("[data-newspaper-edit]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.newspaperEdit, 10);
				const item = newspapersData.find((n) => n.id === id) || items.find((n) => n.id === id);
				if (item) openEditNewspaperModal(item);
			});
		});

		newspapersList.querySelectorAll("[data-newspaper-delete]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.newspaperDelete, 10);
				deleteNewspaper(id);
			});
		});
	}

	function openCreateNewspaperModal() {
		if (!newspaperForm) return;
		newspaperForm.reset();
		document.getElementById("admin-newspaper-id").value = "";
		document.getElementById("admin-newspaper-year").value = new Date().getFullYear();
		if (newspaperModalTitle) newspaperModalTitle.textContent = "Добавление выпуска газеты";
		const currentFileWrap = document.getElementById("admin-newspaper-current-file");
		if (currentFileWrap) currentFileWrap.style.display = "none";
		openModal(newspaperModal);
	}

	function openEditNewspaperModal(item) {
		if (!newspaperForm) return;
		newspaperForm.reset();
		document.getElementById("admin-newspaper-id").value = item.id;
		document.getElementById("admin-newspaper-year").value = item.year || "";
		document.getElementById("admin-newspaper-number").value = item.number || "";
		document.getElementById("admin-newspaper-title").value = item.title || "";
		document.getElementById("admin-newspaper-subtitle").value = item.subtitle || "";
		document.getElementById("admin-newspaper-desc").value = item.description || "";
		document.getElementById("admin-newspaper-special").checked = Boolean(item.is_special);
		document.getElementById("admin-newspaper-filesize").value = item.file_size || "";
		document.getElementById("admin-newspaper-fileurl").value = item.file_url || "";

		const currentFileWrap = document.getElementById("admin-newspaper-current-file");
		const currentFileLink = document.getElementById("admin-newspaper-current-link");
		if (currentFileWrap && currentFileLink) {
			currentFileWrap.style.display = "block";
			currentFileLink.href = resolveMediaUrl(item.file_url);
			currentFileLink.textContent = item.file_url;
		}

		if (newspaperModalTitle) newspaperModalTitle.textContent = "Редактирование выпуска газеты";
		openModal(newspaperModal);
	}

	async function deleteNewspaper(id) {
		if (!confirm("Вы уверены, что хотите удалить этот выпуск газеты?")) return;
		try {
			const res = await apiFetch(`${NEWSPAPERS_API}/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.detail || `Ошибка ${res.status}`);
			}
			newspapersData = newspapersData.filter((n) => n.id !== id);
			loadNewspapers();
		} catch (err) {
			alert(`Не удалось удалить выпуск газеты:\n${err.message}`);
		}
	}

	// =========================================================
	// 2. ТЕАТРАЛЬНАЯ СТУДИЯ «ВСТРЕЧА»
	// =========================================================
	async function loadTheatrePlays() {
		if (!theatreList) return;
		theatreList.innerHTML = '<div class="admin-loading">Загрузка репертуара театра...</div>';

		try {
			const res = await apiFetch(THEATRE_API);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			theatreData = await res.json();
			renderTheatreList(theatreData);
			updateTotalCount();
		} catch (err) {
			console.error("Ошибка загрузки спектаклей:", err);
			theatreList.innerHTML = `<div class="admin-error">Не удалось загрузить спектакли: ${escapeHtml(err.message)}</div>`;
		}
	}

	function renderTheatreList(items) {
		if (!theatreList) return;
		if (!items || !items.length) {
			theatreList.innerHTML = '<div class="admin-empty">Постановки театра не найдены. Нажмите «+ Добавить постановку», чтобы внести спектакль.</div>';
			return;
		}

		let html = '<div class="admin-cards-grid">';
		items.forEach((item) => {
			const photoUrl = resolveMediaUrl(item.photo_url);
			const photoThumb = photoUrl
				? `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.title)}" class="admin-item-thumb" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"><div class="admin-item-thumb admin-item-thumb--placeholder" style="display:none;">🎭</div>`
				: '<div class="admin-item-thumb admin-item-thumb--placeholder">🎭</div>';

			html += `
				<div class="admin-item-card admin-item-card--media" data-theatre-id="${item.id}">
					${photoThumb}
					<div class="admin-item-card__content">
						<div class="admin-item-card__header">
							<div class="admin-item-card__title-wrap">
								${item.year ? `<span class="life-badge life-badge--purple">${escapeHtml(item.year)} г.</span>` : ""}
								${item.author_or_director ? `<span class="life-badge life-badge--gray">${escapeHtml(item.author_or_director)}</span>` : ""}
							</div>
						</div>

						<h3 class="admin-item-card__title">${escapeHtml(item.title)}</h3>
						${item.awards ? `<div class="life-awards-pill">🏆 ${escapeHtml(item.awards)}</div>` : ""}
						${item.description ? `<p class="admin-item-card__desc">${escapeHtml(item.description)}</p>` : ""}

						<div class="admin-item-card__footer">
							<div class="admin-item-card__link-wrap">
								${item.video_url ? `
									<a href="${escapeHtml(item.video_url)}" target="_blank" class="admin-button admin-button--small admin-button--link" title="Смотреть видеозапись">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
										<span>Видео</span>
									</a>` : ""}
							</div>
							<div class="admin-item-card__actions">
								<button type="button" class="admin-button admin-button--small" data-theatre-edit="${item.id}">
									Редактировать
								</button>
								<button type="button" class="admin-button admin-button--small admin-button--danger" data-theatre-delete="${item.id}">
									Удалить
								</button>
							</div>
						</div>
					</div>
				</div>
			`;
		});
		html += "</div>";
		theatreList.innerHTML = html;

		theatreList.querySelectorAll("[data-theatre-edit]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.theatreEdit, 10);
				const item = theatreData.find((t) => t.id === id);
				if (item) openEditTheatreModal(item);
			});
		});

		theatreList.querySelectorAll("[data-theatre-delete]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.theatreDelete, 10);
				deleteTheatrePlay(id);
			});
		});
	}

	function openCreateTheatreModal() {
		if (!theatreForm) return;
		theatreForm.reset();
		document.getElementById("admin-theatre-id").value = "";
		document.getElementById("admin-theatre-director").value = "Андреева М. В.";
		if (theatreModalTitle) theatreModalTitle.textContent = "Добавление постановки театра";
		const currentPhotoWrap = document.getElementById("admin-theatre-current-photo");
		if (currentPhotoWrap) currentPhotoWrap.style.display = "none";
		openModal(theatreModal);
	}

	function openEditTheatreModal(item) {
		if (!theatreForm) return;
		theatreForm.reset();
		document.getElementById("admin-theatre-id").value = item.id;
		document.getElementById("admin-theatre-title").value = item.title || "";
		document.getElementById("admin-theatre-director").value = item.author_or_director || "";
		document.getElementById("admin-theatre-year").value = item.year || "";
		document.getElementById("admin-theatre-awards").value = item.awards || "";
		document.getElementById("admin-theatre-videourl").value = item.video_url || "";
		document.getElementById("admin-theatre-photourl").value = item.photo_url || "";
		document.getElementById("admin-theatre-desc").value = item.description || "";

		const currentPhotoWrap = document.getElementById("admin-theatre-current-photo");
		const currentPhotoImg = document.getElementById("admin-theatre-current-img");
		if (currentPhotoWrap && currentPhotoImg) {
			if (item.photo_url) {
				currentPhotoWrap.style.display = "block";
				currentPhotoImg.src = resolveMediaUrl(item.photo_url);
			} else {
				currentPhotoWrap.style.display = "none";
			}
		}

		if (theatreModalTitle) theatreModalTitle.textContent = "Редактирование постановки театра";
		openModal(theatreModal);
	}

	async function deleteTheatrePlay(id) {
		if (!confirm("Вы уверены, что хотите удалить этот спектакль?")) return;
		try {
			const res = await apiFetch(`${THEATRE_API}/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.detail || `Ошибка ${res.status}`);
			}
			theatreData = theatreData.filter((t) => t.id !== id);
			loadTheatrePlays();
		} catch (err) {
			alert(`Не удалось удалить спектакль:\n${err.message}`);
		}
	}

	// =========================================================
	// 3. ЛЕТНИЙ ПРИШКОЛЬНЫЙ ЛАГЕРЬ
	// =========================================================
	async function loadCampShifts() {
		if (!campList) return;
		campList.innerHTML = '<div class="admin-loading">Загрузка смен летнего лагеря...</div>';

		try {
			const res = await apiFetch(CAMP_API);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			campData = await res.json();
			renderCampList(campData);
			updateTotalCount();
		} catch (err) {
			console.error("Ошибка загрузки смен лагеря:", err);
			campList.innerHTML = `<div class="admin-error">Не удалось загрузить смены лагеря: ${escapeHtml(err.message)}</div>`;
		}
	}

	function getCampStatusBadge(status) {
		switch (status) {
			case "upcoming":
				return '<span class="life-badge life-badge--green">🟢 Открыта запись / предстоит</span>';
			case "active":
				return '<span class="life-badge life-badge--blue">🔵 Смена идет сейчас</span>';
			case "completed":
			default:
				return '<span class="life-badge life-badge--gray">⚪ Смена завершена</span>';
		}
	}

	function renderCampList(items) {
		if (!campList) return;
		if (!items || !items.length) {
			campList.innerHTML = '<div class="admin-empty">Смены лагеря пока не добавлены. Нажмите «+ Добавить смену лагеря», чтобы создать программу.</div>';
			return;
		}

		let html = '<div class="admin-cards-grid">';
		items.forEach((item) => {
			const photoUrl = resolveMediaUrl(item.photo_url);
			const photoThumb = photoUrl
				? `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(item.title)}" class="admin-item-thumb" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"><div class="admin-item-thumb admin-item-thumb--placeholder" style="display:none;">☀️</div>`
				: '<div class="admin-item-thumb admin-item-thumb--placeholder">☀️</div>';

			html += `
				<div class="admin-item-card admin-item-card--media" data-camp-id="${item.id}">
					${photoThumb}
					<div class="admin-item-card__content">
						<div class="admin-item-card__header">
							<div class="admin-item-card__title-wrap">
								<span class="life-badge life-badge--amber font-bold">${escapeHtml(String(item.year))} год</span>
								${getCampStatusBadge(item.status)}
							</div>
							${item.dates ? `<span class="admin-item-card__size">📅 ${escapeHtml(item.dates)}</span>` : ""}
						</div>

						<h3 class="admin-item-card__title">${escapeHtml(item.title)}</h3>
						${item.description ? `<p class="admin-item-card__desc">${escapeHtml(item.description)}</p>` : ""}

						<div class="admin-item-card__footer">
							<div class="admin-item-card__link-wrap">
								${item.vk_album_url ? `
									<a href="${escapeHtml(item.vk_album_url)}" target="_blank" class="admin-button admin-button--small admin-button--link" title="Открыть фотоальбом VK">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
										<span>Фотоальбом VK</span>
									</a>` : ""}
							</div>
							<div class="admin-item-card__actions">
								<button type="button" class="admin-button admin-button--small" data-camp-edit="${item.id}">
									Редактировать
								</button>
								<button type="button" class="admin-button admin-button--small admin-button--danger" data-camp-delete="${item.id}">
									Удалить
								</button>
							</div>
						</div>
					</div>
				</div>
			`;
		});
		html += "</div>";
		campList.innerHTML = html;

		campList.querySelectorAll("[data-camp-edit]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.campEdit, 10);
				const item = campData.find((c) => c.id === id);
				if (item) openEditCampModal(item);
			});
		});

		campList.querySelectorAll("[data-camp-delete]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.campDelete, 10);
				deleteCampShift(id);
			});
		});
	}

	function openCreateCampModal() {
		if (!campForm) return;
		campForm.reset();
		document.getElementById("admin-camp-id").value = "";
		document.getElementById("admin-camp-year").value = new Date().getFullYear();
		document.getElementById("admin-camp-status").value = "upcoming";
		if (campModalTitle) campModalTitle.textContent = "Добавление смены летнего лагеря";
		const currentPhotoWrap = document.getElementById("admin-camp-current-photo");
		if (currentPhotoWrap) currentPhotoWrap.style.display = "none";
		openModal(campModal);
	}

	function openEditCampModal(item) {
		if (!campForm) return;
		campForm.reset();
		document.getElementById("admin-camp-id").value = item.id;
		document.getElementById("admin-camp-year").value = item.year || "";
		document.getElementById("admin-camp-title").value = item.title || "";
		document.getElementById("admin-camp-status").value = item.status || "completed";
		document.getElementById("admin-camp-dates").value = item.dates || "";
		document.getElementById("admin-camp-vkurl").value = item.vk_album_url || "";
		document.getElementById("admin-camp-photourl").value = item.photo_url || "";
		document.getElementById("admin-camp-desc").value = item.description || "";

		const currentPhotoWrap = document.getElementById("admin-camp-current-photo");
		const currentPhotoImg = document.getElementById("admin-camp-current-img");
		if (currentPhotoWrap && currentPhotoImg) {
			if (item.photo_url) {
				currentPhotoWrap.style.display = "block";
				currentPhotoImg.src = resolveMediaUrl(item.photo_url);
			} else {
				currentPhotoWrap.style.display = "none";
			}
		}

		if (campModalTitle) campModalTitle.textContent = "Редактирование смены летнего лагеря";
		openModal(campModal);
	}

	async function deleteCampShift(id) {
		if (!confirm("Вы уверены, что хотите удалить эту смену лагеря?")) return;
		try {
			const res = await apiFetch(`${CAMP_API}/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.detail || `Ошибка ${res.status}`);
			}
			campData = campData.filter((c) => c.id !== id);
			loadCampShifts();
		} catch (err) {
			alert(`Не удалось удалить смену лагеря:\n${err.message}`);
		}
	}

	// =========================================================
	// ОБРАБОТЧИКИ ФОРМ (SUBMIT)
	// =========================================================

	// Форма газеты
	if (newspaperForm) {
		newspaperForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const id = document.getElementById("admin-newspaper-id").value;
			const isEdit = Boolean(id);

			const formData = new FormData();
			formData.append("year", document.getElementById("admin-newspaper-year").value.trim());
			formData.append("number", document.getElementById("admin-newspaper-number").value.trim());
			formData.append("title", document.getElementById("admin-newspaper-title").value.trim());
			formData.append("subtitle", document.getElementById("admin-newspaper-subtitle").value.trim());
			formData.append("description", document.getElementById("admin-newspaper-desc").value.trim());
			formData.append("is_special", document.getElementById("admin-newspaper-special").checked ? "true" : "false");
			formData.append("file_size", document.getElementById("admin-newspaper-filesize").value.trim());
			formData.append("file_url", document.getElementById("admin-newspaper-fileurl").value.trim());

			const fileInput = document.getElementById("admin-newspaper-file");
			if (fileInput && fileInput.files && fileInput.files[0]) {
				formData.append("pdf_file", fileInput.files[0]);
			}

			const submitBtn = newspaperForm.querySelector("button[type='submit']");
			const originalText = submitBtn ? submitBtn.textContent : "Сохранить";
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = "Сохранение...";
			}

			try {
				const url = isEdit ? `${NEWSPAPERS_API}/${id}` : NEWSPAPERS_API;
				const method = isEdit ? "PUT" : "POST";
				const res = await apiFetch(url, { method, body: formData });

				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err.detail || `Ошибка ${res.status}`);
				}

				closeModal(newspaperModal);
				loadNewspapers();
			} catch (err) {
				alert(`Ошибка сохранения выпуска газеты:\n${err.message}`);
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = originalText;
				}
			}
		});
	}

	// Форма театра
	if (theatreForm) {
		theatreForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const id = document.getElementById("admin-theatre-id").value;
			const isEdit = Boolean(id);

			const formData = new FormData();
			formData.append("title", document.getElementById("admin-theatre-title").value.trim());
			formData.append("author_or_director", document.getElementById("admin-theatre-director").value.trim());
			formData.append("year", document.getElementById("admin-theatre-year").value.trim());
			formData.append("awards", document.getElementById("admin-theatre-awards").value.trim());
			formData.append("video_url", document.getElementById("admin-theatre-videourl").value.trim());
			formData.append("photo_url", document.getElementById("admin-theatre-photourl").value.trim());
			formData.append("description", document.getElementById("admin-theatre-desc").value.trim());

			const photoInput = document.getElementById("admin-theatre-photo-file");
			if (photoInput && photoInput.files && photoInput.files[0]) {
				formData.append("photo_file", photoInput.files[0]);
			}

			const submitBtn = theatreForm.querySelector("button[type='submit']");
			const originalText = submitBtn ? submitBtn.textContent : "Сохранить";
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = "Сохранение...";
			}

			try {
				const url = isEdit ? `${THEATRE_API}/${id}` : THEATRE_API;
				const method = isEdit ? "PUT" : "POST";
				const res = await apiFetch(url, { method, body: formData });

				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err.detail || `Ошибка ${res.status}`);
				}

				closeModal(theatreModal);
				loadTheatrePlays();
			} catch (err) {
				alert(`Ошибка сохранения постановки театра:\n${err.message}`);
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = originalText;
				}
			}
		});
	}

	// Форма лагеря
	if (campForm) {
		campForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			const id = document.getElementById("admin-camp-id").value;
			const isEdit = Boolean(id);

			const formData = new FormData();
			formData.append("year", document.getElementById("admin-camp-year").value.trim());
			formData.append("title", document.getElementById("admin-camp-title").value.trim());
			formData.append("status", document.getElementById("admin-camp-status").value.trim());
			formData.append("dates", document.getElementById("admin-camp-dates").value.trim());
			formData.append("vk_album_url", document.getElementById("admin-camp-vkurl").value.trim());
			formData.append("photo_url", document.getElementById("admin-camp-photourl").value.trim());
			formData.append("description", document.getElementById("admin-camp-desc").value.trim());

			const photoInput = document.getElementById("admin-camp-photo-file");
			if (photoInput && photoInput.files && photoInput.files[0]) {
				formData.append("photo_file", photoInput.files[0]);
			}

			const submitBtn = campForm.querySelector("button[type='submit']");
			const originalText = submitBtn ? submitBtn.textContent : "Сохранить";
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.textContent = "Сохранение...";
			}

			try {
				const url = isEdit ? `${CAMP_API}/${id}` : CAMP_API;
				const method = isEdit ? "PUT" : "POST";
				const res = await apiFetch(url, { method, body: formData });

				if (!res.ok) {
					const err = await res.json().catch(() => ({}));
					throw new Error(err.detail || `Ошибка ${res.status}`);
				}

				closeModal(campModal);
				loadCampShifts();
			} catch (err) {
				alert(`Ошибка сохранения смены лагеря:\n${err.message}`);
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.textContent = originalText;
				}
			}
		});
	}

	// =========================================================
	// КНОПКИ СОЗДАНИЯ И ЗАКРЫТИЯ МОДАЛОК
	// =========================================================
	const createNewspaperBtn = document.getElementById("create-newspaper-button");
	if (createNewspaperBtn) createNewspaperBtn.addEventListener("click", openCreateNewspaperModal);

	const createTheatreBtn = document.getElementById("create-theatre-button");
	if (createTheatreBtn) createTheatreBtn.addEventListener("click", openCreateTheatreModal);

	const createCampBtn = document.getElementById("create-camp-button");
	if (createCampBtn) createCampBtn.addEventListener("click", openCreateCampModal);

	// Кнопки закрытия модальных окон
	document.querySelectorAll("[data-close-modal]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const targetId = btn.dataset.closeModal;
			const targetModal = document.getElementById(targetId);
			if (targetModal) closeModal(targetModal);
		});
	});

	// Клик по оверлею закрывает модалку
	[newspaperModal, theatreModal, campModal].forEach((m) => {
		if (!m) return;
		const overlay = m.querySelector(".modal__overlay");
		if (overlay) {
			overlay.addEventListener("click", () => closeModal(m));
		}
	});

	// Фильтр газеты по году
	if (newspaperYearFilter) {
		newspaperYearFilter.addEventListener("change", () => {
			loadNewspapers();
		});
	}

	// =========================================================
	// ИНИЦИАЛИЗАЦИЯ
	// =========================================================
	function initGymLifeAdmin() {
		loadNewspapers();
		loadTheatrePlays();
		loadCampShifts();
	}

	// Запуск выполняется через admin.js после проверки авторизации
	window.initGymLifeAdmin = initGymLifeAdmin;

	window.GymLifeAdmin = {
		reloadAll: initGymLifeAdmin,
		loadNewspapers,
		loadTheatrePlays,
		loadCampShifts,
	};
})();
