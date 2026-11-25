document.addEventListener('DOMContentLoaded', async () => {
	const accordionsContainer = document.querySelector('.accordions-container');
	const filterPillsContainer = document.querySelector('.filter-pills');
	const searchInput = document.querySelector('.search-box__input, .container-search input');
	const header = document.querySelector('header');
	const toolbar = document.querySelector('.toolbar-sticky');

	function getPluralDocs(count) {
		const mod10 = count % 10;
		const mod100 = count % 100;
		if (mod100 >= 11 && mod100 <= 19) {
			return `${count} документов`;
		}
		if (mod10 === 1) {
			return `${count} документ`;
		}
		if (mod10 >= 2 && mod10 <= 4) {
			return `${count} документа`;
		}
		return `${count} документов`;
	}

	function getFileIcon(fileType) {
		const type = (fileType || '').toLowerCase();
		if (type === 'docx' || type === 'doc') {
			return 'assets/icons/file-documents.svg';
		}
		if (type === 'xlsx' || type === 'xls') {
			return 'assets/icons/file-documents.svg';
		}
		return 'assets/icons/file-documents.svg';
	}

	function resolveDocUrl(url) {
		if (!url) return '#';
		if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
			return url;
		}
		if (url.startsWith('/uploads') || url.startsWith('uploads/')) {
			const clean = url.startsWith('/') ? url : `/${url}`;
			const base = (typeof window.API_BASE_URL !== "undefined" ? window.API_BASE_URL : "").replace(/\/$/, "");
			return `${base}${clean}`;
		}
		return url;
	}

	function scrollToFilteredList() {
		if (!accordionsContainer) return;

		const headerHeight = header ? header.offsetHeight : 0;
		const isToolbarSticky = toolbar && getComputedStyle(toolbar).position === 'sticky';
		const toolbarHeight = isToolbarSticky ? toolbar.offsetHeight : 0;
		const toolbarBottom = toolbar ? toolbar.getBoundingClientRect().bottom : 0;
		const accordionsRect = accordionsContainer.getBoundingClientRect();
		const currentBodyPaddingTop = parseFloat(getComputedStyle(document.body).paddingTop) || 0;

		const triggerLine = isToolbarSticky ? toolbarBottom + 12 : headerHeight + 12;
		if (accordionsRect.top >= triggerLine) return;

		const accordionsDocTop = accordionsRect.top + window.scrollY + (headerHeight - currentBodyPaddingTop);
		const targetY = Math.max(0, accordionsDocTop - headerHeight - toolbarHeight - 24);

		if (header) header.classList.remove('header-hidden');
		document.body.classList.remove('header-is-hidden');

		window.scrollTo({
			top: targetY,
			behavior: 'smooth'
		});
	}

	// Рендеринг документов в контейнер аккордеонов
	function renderDocuments(documents) {
		if (!accordionsContainer || !documents || !documents.length) return;

		// Группировка документов по категориям с сохранением порядка
		const categoryMap = new Map();

		documents.forEach(doc => {
			const catKey = doc.category_key || 'other';
			const catTitle = doc.category_title || catKey;

			if (!categoryMap.has(catKey)) {
				categoryMap.set(catKey, {
					title: catTitle,
					items: []
				});
			}
			categoryMap.get(catKey).items.push(doc);
		});

		// Генерируем HTML аккордеонов
		let isFirst = true;
		const htmlPieces = [];

		categoryMap.forEach((catData, catKey) => {
			const countStr = getPluralDocs(catData.items.length);
			const activeClass = isFirst ? ' accordion-document--active' : '';
			isFirst = false;

			const itemsHtml = catData.items.map(item => {
				const title = item.title || 'Документ';
				const badge = item.file_size || (item.file_type ? item.file_type.toUpperCase() : 'PDF');
				const rawUrl = item.file_url || '#';
				const fileUrl = resolveDocUrl(rawUrl);
				const downloadName = item.download_name || title;
				const iconSrc = getFileIcon(item.file_type);

				return `
					<li class="documents-item">
						<div class="documents-item__info">
							<img alt="Документ" class="doc-icon" src="${iconSrc}" />
							<span class="documents-item__title">${title}</span>
							<span class="documents-item__badge">${badge}</span>
						</div>
						<div class="documents-item__actions">
							<a class="doc-btn doc-btn--view" href="${fileUrl}" rel="noopener noreferrer" target="_blank" title="Открыть «${title}» для онлайн-просмотра">Просмотр</a>
							<a class="doc-btn doc-btn--download" download="${downloadName}" href="${fileUrl}" target="_blank" title="Скачать файл «${downloadName}»">
								<img alt="" src="assets/icons/download-documents.svg" />
								<span>Скачать</span>
							</a>
						</div>
					</li>
				`;
			}).join('');

			htmlPieces.push(`
				<div class="accordion-document${activeClass}" data-category="${catKey}">
					<div class="document-title">
						<div class="document-title-text">
							<h2>${catData.title}</h2>
							<span class="accordion-document-badge">${countStr}</span>
						</div>
						<img alt="Открыть/закрыть" class="accordion-icon" src="assets/icons/arrow_down.svg" />
					</div>
					<div class="accordion-content">
						<div class="accordion-content__inner">
							<div class="document-list">
								<ul class="documents-list">
									${itemsHtml}
								</ul>
							</div>
						</div>
					</div>
				</div>
			`);
		});

		accordionsContainer.innerHTML = htmlPieces.join('');

		// Динамическое обновление кнопок фильтров, если появились новые категории
		if (filterPillsContainer) {
			const existingPillKeys = new Set(
				Array.from(filterPillsContainer.querySelectorAll('.pill-btn')).map(b => b.dataset.category)
			);

			categoryMap.forEach((catData, catKey) => {
				if (!existingPillKeys.has(catKey)) {
					const newBtn = document.createElement('button');
					newBtn.className = 'pill-btn';
					newBtn.dataset.category = catKey;
					newBtn.textContent = catData.title.length > 25 ? catData.title.slice(0, 22) + '...' : catData.title;
					filterPillsContainer.appendChild(newBtn);
				}
			});
		}

		// Реинициализация обработчиков событий
		bindEvents();
	}

	function bindEvents() {
		const tagButtons = document.querySelectorAll('.pill-btn, .tag-btn');
		const accordions = document.querySelectorAll('.accordion-document');

		// 1. Фильтрация по категориям
		tagButtons.forEach(button => {
			button.onclick = () => {
				const category = button.dataset.category || 'all';

				tagButtons.forEach(btn => {
					btn.classList.remove('pill-btn--active', 'tag-btn--active');
				});
				button.classList.add(button.classList.contains('pill-btn') ? 'pill-btn--active' : 'tag-btn--active');

				if (searchInput) {
					searchInput.value = '';
				}

				accordions.forEach(accordion => {
					const accordionCategory = accordion.dataset.category;
					const items = accordion.querySelectorAll('.documents-item');
					items.forEach(item => {
						item.style.display = '';
					});

					if (category === 'all') {
						accordion.style.display = '';
					} else if (accordionCategory === category) {
						accordion.style.display = '';
						accordion.classList.add('accordion-document--active');
					} else {
						accordion.style.display = 'none';
						accordion.classList.remove('accordion-document--active');
					}
				});

				scrollToFilteredList();
			};
		});

		// 2. Раскрытие / сворачивание аккордеонов
		accordions.forEach(accordion => {
			const title = accordion.querySelector('.document-title');
			if (title) {
				title.onclick = () => {
					accordion.classList.toggle('accordion-document--active');
				};
			}
		});

		// 3. Поиск по документам
		if (searchInput) {
			searchInput.oninput = (e) => {
				const query = e.target.value.toLowerCase().trim();

				accordions.forEach(accordion => {
					const items = accordion.querySelectorAll('.documents-item');
					let hasMatch = false;

					items.forEach(item => {
						const titleText = item.querySelector('.documents-item__title')?.textContent.toLowerCase() || '';

						if (query === '' || titleText.includes(query)) {
							item.style.display = '';
							if (query !== '') hasMatch = true;
						} else {
							item.style.display = 'none';
						}
					});

					if (query.length > 0) {
						if (hasMatch) {
							accordion.style.display = '';
							accordion.classList.add('accordion-document--active');
						} else {
							accordion.style.display = 'none';
							accordion.classList.remove('accordion-document--active');
						}
					} else {
						const activeBtn = document.querySelector('.pill-btn--active, .tag-btn--active');
						const activeCat = activeBtn?.dataset.category || 'all';
						if (activeCat === 'all') {
							accordion.style.display = '';
						} else {
							accordion.style.display = (accordion.dataset.category === activeCat) ? '' : 'none';
						}
					}
				});
			};
		}
	}

	// Первичная привязка для уже существующего статического HTML
	bindEvents();

	// Делегирование принудительного скачивания для удалённых файлов (CORS / Blob)
	if (accordionsContainer) {
		accordionsContainer.addEventListener('click', async (e) => {
			const dlBtn = e.target.closest('.doc-btn--download');
			if (!dlBtn) return;
			const href = dlBtn.getAttribute('href');
			const filename = dlBtn.getAttribute('download') || 'document.pdf';
			if (!href || href === '#' || href.startsWith('data:')) return;

			// Если файл находится на бэкенде (например, http://127.0.0.1:8000/uploads/...)
			if (href.startsWith('http://') || href.startsWith('https://')) {
				try {
					e.preventDefault();
					const res = await fetch(href);
					if (!res.ok) throw new Error('Fetch failed');
					const blob = await res.blob();
					const blobUrl = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = blobUrl;
					a.download = filename;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
				} catch (err) {
					// При сбое fetch открываем ссылку напрямую
					window.open(href, '_blank');
				}
			}
		});
	}

	// Загрузка актуальных данных из API с фоллбеком
	const apiBase = typeof window.API_BASE_URL !== "undefined" ? window.API_BASE_URL : "";
	let loadedFromApi = false;

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 2500);

		const response = await fetch(`${apiBase}/api/documents`, {
			signal: controller.signal
		});
		clearTimeout(timeoutId);

		if (response.ok) {
			const data = await response.json();
			if (Array.isArray(data) && data.length > 0) {
				renderDocuments(data);
				loadedFromApi = true;
			}
		}
	} catch (err) {
		console.warn('API документов недоступно, используется локальный источник данных:', err);
	}

	// Если API не ответил, но есть оффлайн-резерв window.FALLBACK_DOCUMENTS
	if (!loadedFromApi && window.FALLBACK_DOCUMENTS && window.FALLBACK_DOCUMENTS.length) {
		renderDocuments(window.FALLBACK_DOCUMENTS);
	}
});
