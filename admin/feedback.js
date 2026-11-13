(() => {
	const FEEDBACK_API_URL = `${window.API_BASE_URL}/api/feedback/`;

	// DOM Elements
	const feedbackTabCount = document.getElementById("feedback-tab-count");
	const feedbackList = document.getElementById("feedback-list");
	const searchInput = document.getElementById("feedback-admin-search");
	const refreshBtn = document.getElementById("feedback-refresh-btn");
	const filterTabs = document.querySelectorAll("[data-feedback-filter]");

	const filterAllCount = document.getElementById("fb-filter-all-count");
	const filterNewCount = document.getElementById("fb-filter-new-count");
	const filterProcessedCount = document.getElementById("fb-filter-processed-count");

	// Modal Elements
	const modal = document.getElementById("feedback-modal");
	const modalOverlay = document.getElementById("feedback-modal-overlay");
	const modalClose = document.getElementById("feedback-modal-close");
	const modalCloseBtn = document.getElementById("fb-modal-close-btn");
	const modalId = document.getElementById("fb-modal-id");
	const modalStatusBadge = document.getElementById("fb-modal-status-badge");
	const modalDate = document.getElementById("fb-modal-date");
	const modalName = document.getElementById("fb-modal-name");
	const modalContact = document.getElementById("fb-modal-contact");
	const modalPage = document.getElementById("fb-modal-page");
	const modalSubject = document.getElementById("fb-modal-subject");
	const modalIp = document.getElementById("fb-modal-ip");
	const modalIpRow = document.getElementById("fb-modal-ip-row");
	const modalMessage = document.getElementById("fb-modal-message");
	const modalToggleStatusBtn = document.getElementById("fb-modal-toggle-status-btn");
	const modalDeleteBtn = document.getElementById("fb-modal-delete-btn");

	let currentFilter = "all";
	let currentSearch = "";
	let currentItems = [];
	let currentActiveMessage = null;
	let searchDebounceTimer = null;

	function escapeHtml(str) {
		if (!str) return "";
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	function formatDate(isoStr) {
		if (!isoStr) return "";
		try {
			let normalized = String(isoStr).trim();
			// Если таймзона не указана в строке — трактуем как московское время (+03:00)
			if (!normalized.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
				normalized += "+03:00";
			}
			const d = new Date(normalized);
			return d.toLocaleString("ru-RU", {
				timeZone: "Europe/Moscow",
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
		} catch (e) {
			return isoStr;
		}
	}

	function updateBadges(unreadCount, stats = null) {
		const count = unreadCount || 0;
		if (feedbackTabCount) {
			feedbackTabCount.textContent = count;
			feedbackTabCount.classList.toggle("admin-tab__count--active", count > 0);
		}

		if (stats) {
			if (filterAllCount) filterAllCount.textContent = stats.total || 0;
			if (filterNewCount) filterNewCount.textContent = stats.new || 0;
			if (filterProcessedCount) filterProcessedCount.textContent = stats.processed || 0;
		}
	}

	async function loadStats() {
		try {
			const res = await window.AdminApp.apiFetch(`${FEEDBACK_API_URL}stats`);
			if (res.ok) {
				const stats = await res.json();
				updateBadges(stats.new, stats);
			}
		} catch (e) {
			console.warn("Failed to load feedback stats:", e);
		}
	}

	async function loadFeedback() {
		if (!feedbackList) return;
		feedbackList.innerHTML = `<div class="admin-loading">Загрузка обращений...</div>`;

		try {
			const params = new URLSearchParams();
			if (currentFilter !== "all") {
				params.append("status", currentFilter);
			}
			if (currentSearch.trim()) {
				params.append("search", currentSearch.trim());
			}

			const res = await window.AdminApp.apiFetch(`${FEEDBACK_API_URL}?${params.toString()}`);
			if (!res.ok) {
				throw new Error(`HTTP ${res.status}`);
			}

			const data = await res.json();
			currentItems = data.items || [];
			updateBadges(data.unread_count);
			loadStats();
			renderList(currentItems);
		} catch (err) {
			console.error("Error loading feedback:", err);
			feedbackList.innerHTML = `
				<div class="admin-loading admin-loading--error">
					<p>Не удалось загрузить список обращений.</p>
					<button type="button" class="admin-button" id="feedback-retry-btn">Повторить попытку</button>
				</div>
			`;
			const retryBtn = document.getElementById("feedback-retry-btn");
			if (retryBtn) retryBtn.addEventListener("click", loadFeedback);
		}
	}

	function renderList(items) {
		if (!feedbackList) return;

		if (!items || items.length === 0) {
			feedbackList.innerHTML = `
				<div class="feedback-empty-state">
					<div class="feedback-empty-icon">✉</div>
					<h3>Обращений не найдено</h3>
					<p>${currentSearch ? "Попробуйте изменить поисковый запрос или фильтр." : "Пока никто не отправлял сообщений через форму обратной связи."}</p>
				</div>
			`;
			return;
		}

		feedbackList.innerHTML = items.map(item => {
			const isNew = item.status === "new";
			const statusLabel = isNew ? "Новое" : "Обработано";
			const statusClass = isNew ? "fb-badge--new" : "fb-badge--processed";
			const dateStr = formatDate(item.created_at);

			// Contact link
			const isEmail = item.contact && item.contact.includes("@");
			const contactHref = isEmail ? `mailto:${encodeURIComponent(item.contact)}` : `tel:${encodeURIComponent(item.contact)}`;

			// Text preview
			const snippet = item.message && item.message.length > 140
				? escapeHtml(item.message.slice(0, 140)) + "…"
				: escapeHtml(item.message);

			const displaySubject = item.subject
				? escapeHtml(item.subject)
				: '<em class="fb-empty-subject">Не указана</em>';
			const pageLabel = item.source_page
				? escapeHtml(item.source_page)
				: "Не указана";

			return `
				<article class="feedback-card ${isNew ? "feedback-card--new" : ""}" data-id="${item.id}">
					<div class="feedback-card__header">
						<div class="feedback-card__title-row">
							<span class="fb-badge ${statusClass}">${statusLabel}</span>
							<span class="fb-page-badge" title="Страница отправки">📍 ${pageLabel}</span>
							<h3 class="feedback-card__subject">${displaySubject}</h3>
						</div>
						<time class="feedback-card__time" datetime="${item.created_at}">${dateStr}</time>
					</div>

					<div class="feedback-card__sender">
						<span class="feedback-card__name">👤 ${escapeHtml(item.name)}</span>
						<a href="${contactHref}" class="feedback-card__contact" target="_blank" rel="noopener noreferrer">
							${isEmail ? "✉" : "📞"} ${escapeHtml(item.contact)}
						</a>
					</div>

					<p class="feedback-card__snippet">${snippet}</p>

					<div class="feedback-card__footer">
						<button type="button" class="admin-button admin-button--primary btn-sm fb-view-btn" data-id="${item.id}">
							Просмотреть полностью
						</button>
						<button type="button" class="admin-button btn-sm fb-toggle-btn" data-id="${item.id}" data-current="${item.status}">
							${isNew ? "✓ Отметить как обработанное" : "↺ Вернуть в новые"}
						</button>
						<button type="button" class="admin-button admin-button--danger btn-sm fb-delete-btn" data-id="${item.id}" title="Удалить обращение">
							🗑 Удалить
						</button>
					</div>
				</article>
			`;
		}).join("");

		// Attach event listeners
		feedbackList.querySelectorAll(".fb-view-btn").forEach(btn => {
			btn.addEventListener("click", () => {
				const id = parseInt(btn.dataset.id, 10);
				openModal(id);
			});
		});

		feedbackList.querySelectorAll(".fb-toggle-btn").forEach(btn => {
			btn.addEventListener("click", async () => {
				const id = parseInt(btn.dataset.id, 10);
				const current = btn.dataset.current;
				const nextStatus = current === "new" ? "processed" : "new";
				await toggleStatus(id, nextStatus);
			});
		});

		feedbackList.querySelectorAll(".fb-delete-btn").forEach(btn => {
			btn.addEventListener("click", async () => {
				const id = parseInt(btn.dataset.id, 10);
				await deleteFeedback(id);
			});
		});
	}

	async function toggleStatus(id, newStatus) {
		try {
			const res = await window.AdminApp.apiFetch(`${FEEDBACK_API_URL}${id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus })
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			updateBadges(data.unread_count);
			loadStats();

			// Update in local items
			const item = currentItems.find(i => i.id === id);
			if (item) {
				item.status = newStatus;
			}

			// If modal is open for this item, update it too
			if (currentActiveMessage && currentActiveMessage.id === id) {
				currentActiveMessage.status = newStatus;
				updateModalState(currentActiveMessage);
			}

			renderList(currentItems);
		} catch (err) {
			console.error("Error updating status:", err);
			alert("Не удалось изменить статус обращения. Попробуйте еще раз.");
		}
	}

	async function deleteFeedback(id) {
		const confirmed = window.confirm("Вы уверены, что хотите безвозвратно удалить это обращение?");
		if (!confirmed) return;

		try {
			const res = await window.AdminApp.apiFetch(`${FEEDBACK_API_URL}${id}`, {
				method: "DELETE"
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data = await res.json();
			updateBadges(data.unread_count);
			loadStats();

			currentItems = currentItems.filter(i => i.id !== id);
			renderList(currentItems);

			if (currentActiveMessage && currentActiveMessage.id === id) {
				closeModal();
			}
		} catch (err) {
			console.error("Error deleting feedback:", err);
			alert("Не удалось удалить обращение. Попробуйте еще раз.");
		}
	}

	function openModal(id) {
		const item = currentItems.find(i => i.id === id);
		if (!item) return;

		currentActiveMessage = item;
		updateModalState(item);

		if (modal) {
			modal.hidden = false;
			modal.classList.add("modal--active");
			document.body.style.overflow = "hidden";
		}
	}

	function updateModalState(item) {
		if (!item) return;

		if (modalId) modalId.textContent = item.id;
		if (modalDate) modalDate.textContent = formatDate(item.created_at);
		if (modalName) modalName.textContent = item.name;

		if (modalContact) {
			const isEmail = item.contact && item.contact.includes("@");
			const href = isEmail ? `mailto:${encodeURIComponent(item.contact)}` : `tel:${encodeURIComponent(item.contact)}`;
			modalContact.innerHTML = `<a href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.contact)}</a>`;
		}

		if (modalPage) {
			modalPage.textContent = item.source_page || "Не указана";
		}

		if (modalSubject) {
			modalSubject.innerHTML = item.subject
				? escapeHtml(item.subject)
				: '<em class="fb-empty-subject">Не указана</em>';
		}

		if (modalIp) {
			modalIp.textContent = item.ip_address || "Не определен";
		}

		if (modalMessage) {
			modalMessage.textContent = item.message;
		}

		const isNew = item.status === "new";
		if (modalStatusBadge) {
			modalStatusBadge.textContent = isNew ? "Новое" : "Обработано";
			modalStatusBadge.className = `fb-badge ${isNew ? "fb-badge--new" : "fb-badge--processed"}`;
		}

		if (modalToggleStatusBtn) {
			modalToggleStatusBtn.textContent = isNew ? "Отметить как обработанное" : "Вернуть в новые";
		}
	}

	function closeModal() {
		currentActiveMessage = null;
		if (modal) {
			modal.hidden = true;
			modal.classList.remove("modal--active");
			document.body.style.overflow = "";
		}
	}

	// Setup Event Listeners
	if (refreshBtn) {
		refreshBtn.addEventListener("click", () => {
			loadFeedback();
		});
	}

	filterTabs.forEach(tab => {
		tab.addEventListener("click", () => {
			filterTabs.forEach(t => t.classList.remove("feedback-status-tab--active"));
			tab.classList.add("feedback-status-tab--active");
			currentFilter = tab.dataset.feedbackFilter || "all";
			loadFeedback();
		});
	});

	if (searchInput) {
		searchInput.addEventListener("input", (e) => {
			clearTimeout(searchDebounceTimer);
			searchDebounceTimer = setTimeout(() => {
				currentSearch = e.target.value.trim();
				loadFeedback();
			}, 300);
		});
	}

	if (modalClose) modalClose.addEventListener("click", closeModal);
	if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
	if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal && !modal.hidden) {
			closeModal();
		}
	});

	if (modalToggleStatusBtn) {
		modalToggleStatusBtn.addEventListener("click", async () => {
			if (!currentActiveMessage) return;
			const next = currentActiveMessage.status === "new" ? "processed" : "new";
			await toggleStatus(currentActiveMessage.id, next);
		});
	}

	if (modalDeleteBtn) {
		modalDeleteBtn.addEventListener("click", async () => {
			if (!currentActiveMessage) return;
			await deleteFeedback(currentActiveMessage.id);
		});
	}

	// Listen for tab activation to load data
	document.querySelectorAll("[data-admin-tab]").forEach(btn => {
		btn.addEventListener("click", () => {
			if (btn.dataset.adminTab === "feedback") {
				loadFeedback();
			}
		});
	});

	// If loaded directly with #feedback
	if (window.location.hash === "#feedback") {
		loadFeedback();
	}

	// Initial stats load to show unread badge right away
	loadStats();
})();
