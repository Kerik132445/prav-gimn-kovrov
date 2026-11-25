/**
 * УПРАВЛЕНИЕ ДОКУМЕНТАМИ ГИМНАЗИИ (ADMIN PANEL)
 */
(() => {
	const API_BASE = `${typeof window.API_BASE_URL !== "undefined" ? window.API_BASE_URL : ""}/api/documents`;

	// DOM Elements
	const docsTabCount = document.getElementById("documents-tab-count");
	const docsSearchInput = document.getElementById("documents-admin-search");
	const docsCategoryFilter = document.getElementById("documents-admin-category-filter");
	const docsListContainer = document.getElementById("documents-admin-list");
	const createDocBtn = document.getElementById("create-document-button");

	// Modal Elements
	const docModal = document.getElementById("document-modal");
	const docModalTitle = document.getElementById("document-modal-title");
	const docForm = document.getElementById("document-form");
	const docIdInput = document.getElementById("document-id");
	const docCategorySelect = document.getElementById("document-category-select");
	const docNewCatWrapper = document.getElementById("document-new-category-wrapper");
	const docNewCatInput = document.getElementById("document-new-category-title");
	const docTitleInput = document.getElementById("document-title");
	const docDropzone = document.getElementById("document-dropzone");
	const docFileInput = document.getElementById("document-file-input");
	const docFileSelected = document.getElementById("document-file-selected");
	const docFileName = document.getElementById("selected-file-name");
	const clearDocFileBtn = document.getElementById("clear-selected-file");
	const docCurrentFileBox = document.getElementById("document-current-file-box");
	const docCurrentLinkText = document.getElementById("document-current-link-text");
	const docCurrentLinkView = document.getElementById("document-current-link-view");
	const docFileUrlInput = document.getElementById("document-file-url");
	const docFileSizeInput = document.getElementById("document-file-size");
	const docSortOrderInput = document.getElementById("document-sort-order");
	const docDownloadNameInput = document.getElementById("document-download-name");
	const docSubmitBtn = document.getElementById("document-submit-button");

	// Delete Modal Elements
	const deleteModal = document.getElementById("delete-document-modal");
	const deleteDocTitle = document.getElementById("delete-document-title");
	const confirmDeleteBtn = document.getElementById("confirm-delete-document-button");

	let documentsCache = [];
	let categoriesCache = [];
	let docToDeleteId = null;

	const STANDARD_CATEGORIES = [
		{ key: "legal", title: "Правоустанавливающие документы" },
		{ key: "relations", title: "Образовательные отношения" },
		{ key: "students", title: "Участники образовательных отношений: Обучающиеся" },
		{ key: "teachers", title: "Участники образовательных отношений: Работники" },
		{ key: "educational_environment", title: "Информационная образовательная среда (ЭИОС)" },
		{ key: "acts", title: "Локальные акты" },
		{ key: "Charity", title: "Благотворительные средства и добровольные пожертвования" }
	];

	function formatBytes(bytes) {
		if (bytes < 1024) return `${bytes} Б`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
	}

	function getPluralDocs(count) {
		const mod10 = count % 10;
		const mod100 = count % 100;
		if (mod100 >= 11 && mod100 <= 19) return `${count} документов`;
		if (mod10 === 1) return `${count} документ`;
		if (mod10 >= 2 && mod10 <= 4) return `${count} документа`;
		return `${count} документов`;
	}

	function getFileTypeBadge(fileType) {
		const type = (fileType || 'pdf').toLowerCase();
		let label = type.toUpperCase();
		let colorClass = 'doc-type-badge--pdf';

		if (type === 'docx' || type === 'doc') {
			colorClass = 'doc-type-badge--word';
		} else if (type === 'xlsx' || type === 'xls') {
			colorClass = 'doc-type-badge--excel';
		} else if (type === 'zip' || type === 'rar') {
			colorClass = 'doc-type-badge--archive';
		}

		return `<span class="doc-type-badge ${colorClass}">${label}</span>`;
	}

	function resolveAdminDocUrl(url) {
		if (!url) return "#";
		if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
			return url;
		}
		if (url.startsWith("/uploads") || url.startsWith("uploads/")) {
			const clean = url.startsWith("/") ? url : `/${url}`;
			const base = (typeof window.API_BASE_URL !== "undefined" ? window.API_BASE_URL : "").replace(/\/$/, "");
			return `${base}${clean}`;
		}
		if (url.startsWith("documents/") || url.startsWith("assets/")) {
			return `../${url}`;
		}
		if (!url.startsWith("/") && !url.startsWith("../")) {
			return `../${url}`;
		}
		return url;
	}

	// Загрузка документов из API
	async function loadDocuments() {
		try {
			const res = await fetch(API_BASE);
			if (!res.ok) throw new Error("Не удалось загрузить документы");
			documentsCache = await res.json();

			if (docsTabCount) {
				docsTabCount.textContent = documentsCache.length;
			}

			await loadCategories();
			renderAccordions();
		} catch (err) {
			console.error("Ошибка загрузки документов:", err);
			if (docsListContainer) {
				docsListContainer.innerHTML = `
					<div class="admin-empty">
						<p>Не удалось подключиться к серверу для загрузки документов.</p>
						<button type="button" class="admin-button" onclick="window.location.reload()">Повторить</button>
					</div>
				`;
			}
		}
	}

	// Загрузка категорий и обновление выпадающих списков
	async function loadCategories() {
		try {
			const res = await fetch(`${API_BASE}/categories`);
			if (res.ok) {
				categoriesCache = await res.json();
			} else {
				categoriesCache = STANDARD_CATEGORIES.map(c => ({ ...c, count: 0 }));
			}
		} catch (e) {
			categoriesCache = STANDARD_CATEGORIES.map(c => ({ ...c, count: 0 }));
		}

		updateCategorySelects();
	}

	function updateCategorySelects() {
		// Обновляем фильтр в тулбаре
		if (docsCategoryFilter) {
			const currentVal = docsCategoryFilter.value;
			let html = '<option value="all">Все разделы</option>';
			categoriesCache.forEach(c => {
				html += `<option value="${c.key}">${c.title} (${c.count || 0})</option>`;
			});
			docsCategoryFilter.innerHTML = html;
			docsCategoryFilter.value = currentVal;
		}

		// Обновляем селект в модалке
		if (docCategorySelect) {
			let modalHtml = '';
			categoriesCache.forEach(c => {
				modalHtml += `<option value="${c.key}">${c.title}</option>`;
			});
			modalHtml += '<option value="__custom__">+ Создать новый раздел...</option>';
			docCategorySelect.innerHTML = modalHtml;
		}
	}

	// Рендеринг аккордеонов категорий с документами внутри
	function renderAccordions() {
		if (!docsListContainer) return;

		const searchQuery = (docsSearchInput?.value || "").toLowerCase().trim();
		const filterCategory = docsCategoryFilter?.value || "all";

		// Фильтруем документы
		let filtered = documentsCache;
		if (filterCategory !== "all") {
			filtered = filtered.filter(d => d.category_key === filterCategory);
		}
		if (searchQuery) {
			filtered = filtered.filter(d => (d.title || "").toLowerCase().includes(searchQuery));
		}

		if (filtered.length === 0) {
			docsListContainer.innerHTML = `
				<div class="admin-empty">
					<p>Документы не найдены.</p>
					${searchQuery ? `<button type="button" class="admin-button" id="docs-reset-search">Сбросить поиск</button>` : ''}
				</div>
			`;
			const resetBtn = document.getElementById("docs-reset-search");
			if (resetBtn) {
				resetBtn.onclick = () => {
					if (docsSearchInput) docsSearchInput.value = "";
					renderAccordions();
				};
			}
			return;
		}

		// Группировка документов по категориям
		const grouped = new Map();
		filtered.forEach(doc => {
			const key = doc.category_key || "other";
			const title = doc.category_title || key;
			if (!grouped.has(key)) {
				grouped.set(key, { title, items: [] });
			}
			grouped.get(key).items.push(doc);
		});

		let html = "";
		let isFirst = true;

		grouped.forEach((data, catKey) => {
			// Сортировка внутри категории
			data.items.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

			const countText = getPluralDocs(data.items.length);
			// Раскрываем первый аккордеон или все при поиске
			const isOpen = isFirst || searchQuery.length > 0;
			isFirst = false;

			const docsHtml = data.items.map((doc, idx) => {
				const badge = doc.file_size || doc.file_type?.toUpperCase() || 'PDF';
				const typeBadge = getFileTypeBadge(doc.file_type);
				const isFirstItem = idx === 0;
				const isLastItem = idx === data.items.length - 1;

				return `
					<div class="admin-doc-item" data-id="${doc.id}">
						<div class="admin-doc-item__sort">
							<button type="button" class="admin-doc-sort-btn" data-action="up" data-id="${doc.id}" ${isFirstItem ? 'disabled' : ''} title="Поднять выше">▲</button>
							<button type="button" class="admin-doc-sort-btn" data-action="down" data-id="${doc.id}" ${isLastItem ? 'disabled' : ''} title="Опустить ниже">▼</button>
						</div>
						<div class="admin-doc-item__badge">
							${typeBadge}
						</div>
						<div class="admin-doc-item__info">
							<h4 class="admin-doc-item__title">${escapeHtml(doc.title)}</h4>
							<div class="admin-doc-item__meta">
								<span>${badge}</span>
								${doc.download_name ? `<span>• ${escapeHtml(doc.download_name)}</span>` : ''}
							</div>
						</div>
						<div class="admin-doc-item__actions">
							<a href="${resolveAdminDocUrl(doc.file_url)}" target="_blank" rel="noopener noreferrer" class="admin-button admin-button--sm" title="Открыть документ">
								👁️ Просмотр
							</a>
							<button type="button" class="admin-button admin-button--sm" data-action="edit" data-id="${doc.id}" title="Редактировать документ">
								✏️ Изменить
							</button>
							<button type="button" class="admin-button admin-button--sm admin-button--danger" data-action="delete" data-id="${doc.id}" title="Удалить документ">
								🗑️
							</button>
						</div>
					</div>
				`;
			}).join("");

			html += `
				<div class="admin-doc-accordion ${isOpen ? 'admin-doc-accordion--active' : ''}" data-cat-key="${catKey}">
					<div class="admin-doc-accordion__header">
						<button type="button" class="admin-doc-accordion__toggle">
							<span class="admin-doc-accordion__arrow">▼</span>
							<span class="admin-doc-accordion__title">${escapeHtml(data.title)}</span>
							<span class="admin-doc-accordion__count">${countText}</span>
						</button>
						<button type="button" class="admin-button admin-button--sm admin-button--outline admin-doc-accordion__add-btn" data-add-to-cat="${catKey}" data-cat-title="${escapeHtml(data.title)}">
							+ Добавить в раздел
						</button>
					</div>
					<div class="admin-doc-accordion__body">
						<div class="admin-doc-accordion__list">
							${docsHtml}
						</div>
					</div>
				</div>
			`;
		});

		docsListContainer.innerHTML = html;
		bindAccordionEvents();
	}

	function bindAccordionEvents() {
		// Раскрытие / сворачивание
		docsListContainer.querySelectorAll(".admin-doc-accordion__toggle").forEach(toggle => {
			toggle.onclick = (e) => {
				e.preventDefault();
				const acc = toggle.closest(".admin-doc-accordion");
				acc.classList.toggle("admin-doc-accordion--active");
			};
		});

		// Быстрое добавление в конкретную категорию
		docsListContainer.querySelectorAll(".admin-doc-accordion__add-btn").forEach(btn => {
			btn.onclick = (e) => {
				e.stopPropagation();
				const catKey = btn.dataset.addToCat;
				openCreateModal(catKey);
			};
		});

		// Редактирование
		docsListContainer.querySelectorAll('[data-action="edit"]').forEach(btn => {
			btn.onclick = () => {
				const id = parseInt(btn.dataset.id, 10);
				openEditModal(id);
			};
		});

		// Удаление
		docsListContainer.querySelectorAll('[data-action="delete"]').forEach(btn => {
			btn.onclick = () => {
				const id = parseInt(btn.dataset.id, 10);
				openDeleteModal(id);
			};
		});

		// Сортировка (вверх / вниз)
		docsListContainer.querySelectorAll(".admin-doc-sort-btn").forEach(btn => {
			btn.onclick = () => {
				const id = parseInt(btn.dataset.id, 10);
				const dir = btn.dataset.action;
				moveDocument(id, dir);
			};
		});
	}

	function escapeHtml(str) {
		if (!str) return "";
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	// Открытие модалки создания
	function openCreateModal(preselectedCatKey = null) {
		docForm.reset();
		docIdInput.value = "";
		docModalTitle.textContent = "Добавить документ";
		docSubmitBtn.textContent = "Сохранить документ";
		docSubmitBtn.disabled = false;

		docNewCatWrapper.style.display = "none";
		docNewCatInput.required = false;

		docCurrentFileBox.style.display = "none";
		docFileSelected.style.display = "none";
		docFileInput.value = "";

		if (preselectedCatKey) {
			docCategorySelect.value = preselectedCatKey;
		} else {
			docCategorySelect.value = "legal";
		}

		docSortOrderInput.value = (documentsCache.length + 1).toString();

		docModal.hidden = false;
		docModal.classList.add("modal--active");
		docTitleInput.focus();
	}

	// Открытие модалки редактирования
	function openEditModal(id) {
		const doc = documentsCache.find(d => d.id === id);
		if (!doc) return;

		docForm.reset();
		docIdInput.value = doc.id;
		docModalTitle.textContent = "Редактировать документ";
		docSubmitBtn.textContent = "Сохранить изменения";
		docSubmitBtn.disabled = false;

		docTitleInput.value = doc.title || "";
		docFileUrlInput.value = doc.file_url || "";
		docFileSizeInput.value = doc.file_size || "";
		docSortOrderInput.value = doc.sort_order || 0;
		docDownloadNameInput.value = doc.download_name || "";

		// Установка категории
		const hasCat = Array.from(docCategorySelect.options).some(o => o.value === doc.category_key);
		if (hasCat) {
			docCategorySelect.value = doc.category_key;
			docNewCatWrapper.style.display = "none";
			docNewCatInput.required = false;
		} else {
			// Кастомная категория
			docCategorySelect.value = "__custom__";
			docNewCatWrapper.style.display = "block";
			docNewCatInput.value = doc.category_title || doc.category_key;
			docNewCatInput.required = true;
		}

		// Текущий файл
		if (doc.file_url) {
			docCurrentFileBox.style.display = "block";
			docCurrentLinkText.textContent = doc.download_name || doc.file_url;
			docCurrentLinkView.href = resolveAdminDocUrl(doc.file_url);
		} else {
			docCurrentFileBox.style.display = "none";
		}

		docFileSelected.style.display = "none";
		docFileInput.value = "";

		docModal.hidden = false;
		docModal.classList.add("modal--active");
	}

	function closeModal(modalEl) {
		modalEl.hidden = true;
		modalEl.classList.remove("modal--active");
	}

	// Открытие модалки удаления
	function openDeleteModal(id) {
		const doc = documentsCache.find(d => d.id === id);
		if (!doc) return;

		docToDeleteId = id;
		deleteDocTitle.textContent = `«${doc.title}»`;
		deleteModal.hidden = false;
		deleteModal.classList.add("modal--active");
	}

	// Удаление документа
	async function confirmDelete() {
		if (!docToDeleteId) return;

		confirmDeleteBtn.disabled = true;
		confirmDeleteBtn.textContent = "Удаление...";

		try {
			const res = await window.AdminApp.apiFetch(`${API_BASE}/${docToDeleteId}`, {
				method: "DELETE"
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.detail || "Не удалось удалить документ");
			}

			closeModal(deleteModal);
			docToDeleteId = null;
			await loadDocuments();
		} catch (err) {
			alert(`Ошибка при удалении: ${err.message}`);
		} finally {
			confirmDeleteBtn.disabled = false;
			confirmDeleteBtn.textContent = "Удалить";
		}
	}

	// Перемещение документа вверх / вниз
	async function moveDocument(id, direction) {
		const doc = documentsCache.find(d => d.id === id);
		if (!doc) return;

		const sameCatDocs = documentsCache
			.filter(d => d.category_key === doc.category_key)
			.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

		const idx = sameCatDocs.findIndex(d => d.id === id);
		if (idx === -1) return;

		const targetIdx = direction === "up" ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= sameCatDocs.length) return;

		const otherDoc = sameCatDocs[targetIdx];

		// Меняем местами порядок
		const tempOrder = doc.sort_order || idx;
		doc.sort_order = otherDoc.sort_order || targetIdx;
		otherDoc.sort_order = tempOrder;

		// Сразу перерисовываем локально для мгновенного отклика UI
		renderAccordions();

		try {
			await window.AdminApp.apiFetch(`${API_BASE}/reorder`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: [
						{ id: doc.id, sort_order: doc.sort_order },
						{ id: otherDoc.id, sort_order: otherDoc.sort_order }
					]
				})
			});
		} catch (e) {
			console.error("Ошибка сохранения порядка:", e);
			await loadDocuments();
		}
	}

	// Сохранение документа (создание или редактирование)
	async function handleDocumentSubmit(e) {
		e.preventDefault();

		const id = docIdInput.value;
		const isEdit = Boolean(id);

		const title = docTitleInput.value.trim();
		if (!title) {
			alert("Укажите название документа");
			return;
		}

		let catKey = docCategorySelect.value;
		let catTitle = "";

		if (catKey === "__custom__") {
			catTitle = docNewCatInput.value.trim();
			if (!catTitle) {
				alert("Укажите название нового раздела");
				return;
			}
			// Генерируем ключ из названия транслитом или случайным хешем
			catKey = "cat_" + Date.now();
		} else {
			const selectedOption = docCategorySelect.options[docCategorySelect.selectedIndex];
			catTitle = selectedOption ? selectedOption.textContent : catKey;
		}

		const formData = new FormData();
		formData.append("title", title);
		formData.append("category_key", catKey);
		formData.append("category_title", catTitle);
		formData.append("sort_order", docSortOrderInput.value || "0");

		if (docFileUrlInput.value.trim()) {
			formData.append("file_url", docFileUrlInput.value.trim());
		}
		if (docFileSizeInput.value.trim()) {
			formData.append("file_size", docFileSizeInput.value.trim());
		}
		if (docDownloadNameInput.value.trim()) {
			formData.append("download_name", docDownloadNameInput.value.trim());
		}

		if (docFileInput.files && docFileInput.files[0]) {
			formData.append("doc_file", docFileInput.files[0]);
		} else if (!isEdit && !docFileUrlInput.value.trim()) {
			alert("Прикрепите файл документа или укажите ссылку на него");
			return;
		}

		docSubmitBtn.disabled = true;
		docSubmitBtn.textContent = "Сохранение...";

		try {
			const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
			const method = isEdit ? "PUT" : "POST";

			const res = await window.AdminApp.apiFetch(url, {
				method,
				body: formData
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.detail || "Не удалось сохранить документ");
			}

			closeModal(docModal);
			await loadDocuments();
		} catch (err) {
			alert(`Ошибка сохранения: ${err.message}`);
		} finally {
			docSubmitBtn.disabled = false;
			docSubmitBtn.textContent = isEdit ? "Сохранить изменения" : "Сохранить документ";
		}
	}

	// Инициализация событий
	function init() {
		// Кнопка создания
		if (createDocBtn) {
			createDocBtn.onclick = () => openCreateModal();
		}

		// Поиск
		if (docsSearchInput) {
			docsSearchInput.oninput = () => renderAccordions();
		}

		// Фильтр категорий
		if (docsCategoryFilter) {
			docsCategoryFilter.onchange = () => renderAccordions();
		}

		// Выбор категории в модалке (показ поля для новой категории)
		if (docCategorySelect) {
			docCategorySelect.onchange = () => {
				if (docCategorySelect.value === "__custom__") {
					docNewCatWrapper.style.display = "block";
					docNewCatInput.required = true;
					docNewCatInput.focus();
				} else {
					docNewCatWrapper.style.display = "none";
					docNewCatInput.required = false;
				}
			};
		}

		// Drag and Drop для загрузки файлов
		if (docDropzone && docFileInput) {
			docDropzone.onclick = () => docFileInput.click();

			docDropzone.ondragover = (e) => {
				e.preventDefault();
				docDropzone.classList.add("doc-upload-dropzone--dragover");
			};

			docDropzone.ondragleave = () => {
				docDropzone.classList.remove("doc-upload-dropzone--dragover");
			};

			docDropzone.ondrop = (e) => {
				e.preventDefault();
				docDropzone.classList.remove("doc-upload-dropzone--dragover");
				if (e.dataTransfer.files && e.dataTransfer.files.length) {
					docFileInput.files = e.dataTransfer.files;
					handleFileChosen(e.dataTransfer.files[0]);
				}
			};

			docFileInput.onchange = () => {
				if (docFileInput.files && docFileInput.files[0]) {
					handleFileChosen(docFileInput.files[0]);
				}
			};
		}

		if (clearDocFileBtn) {
			clearDocFileBtn.onclick = () => {
				docFileInput.value = "";
				docFileSelected.style.display = "none";
			};
		}

		// Сабмит формы
		if (docForm) {
			docForm.onsubmit = handleDocumentSubmit;
		}

		// Подтверждение удаления
		if (confirmDeleteBtn) {
			confirmDeleteBtn.onclick = confirmDelete;
		}

		// Закрытие модалок по data-close-modal
		document.querySelectorAll("[data-close-modal]").forEach(btn => {
			btn.addEventListener("click", () => {
				const modalId = btn.dataset.closeModal;
				const m = document.getElementById(modalId);
				if (m) closeModal(m);
			});
		});

		// Первичная загрузка документов
		loadDocuments();
	}

	function handleFileChosen(file) {
		docFileSelected.style.display = "flex";
		docFileName.textContent = `${file.name} (${formatBytes(file.size)})`;

		// Автозаполнение download_name и file_size
		if (!docDownloadNameInput.value.trim()) {
			docDownloadNameInput.value = file.name;
		}
		if (!docFileSizeInput.value.trim()) {
			const ext = file.name.split(".").pop().toUpperCase();
			docFileSizeInput.value = `${ext} • ${formatBytes(file.size)}`;
		}
	}

	// Запуск при готовности страницы
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
