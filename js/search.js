(() => {
const API_BASE = (window.API_BASE_URL || "").replace(/\/$/, "");
const SEARCH_API = `${API_BASE}/api/search`;
const IN_SVEDEN = window.location.pathname.includes("/sveden/");
const REL_PREFIX = IN_SVEDEN ? "../" : "";

const TYPE_LABELS = {
	all: "Всё",
	page: "Страницы",
	document: "Документы",
	sveden: "Сведения",
	news: "Новости",
	teacher: "Учителя",
	schedule: "Расписание",
	menu: "Питание",
	life: "Жизнь гимназии"
};

const TYPE_ORDER = ["all", "page", "document", "sveden", "news", "teacher", "schedule", "life", "menu"];

function escapeHTML(value) {
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function normalizeUrl(url) {
	if (!url) return "#";
	if (/^(https?:|mailto:|tel:|\/)/i.test(url)) {
		return url;
	}
	return `${REL_PREFIX}${url}`;
}

function buildResultUrl(url, query, type) {
	const base = normalizeUrl(url);
	if (!base || base === "#" || /^(https?:|mailto:|tel:)/i.test(base)) {
		return base;
	}
	if (!query || base.includes("highlight=")) {
		return base;
	}
	const [pathAndQuery, hash] = base.split("#");
	const sep = pathAndQuery.includes("?") ? "&" : "?";
	const next = `${pathAndQuery}${sep}highlight=${encodeURIComponent(query)}`;
	return hash ? `${next}#${hash}` : next;
}

function resolveActionUrl(url) {
	if (!url) return null;
	if (/^(https?:|mailto:|tel:)/i.test(url)) {
		return url;
	}
	if (url.startsWith("/")) {
		return API_BASE ? `${API_BASE}${url}` : url;
	}
	return `${REL_PREFIX}${url}`;
}

function highlightText(text, query) {
	const safe = escapeHTML(text);
	const words = String(query || "")
		.toLowerCase()
		.replace(/ё/g, "е")
		.split(/\s+/)
		.filter(w => w.length >= 2);
	if (!words.length) return safe;

	const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
	const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
	return safe.replace(regex, "<mark>$1</mark>");
}

async function fetchSearchResults(query, type = "all", limit = 100) {
	const url = `${SEARCH_API}?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}&limit=${limit}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	return response.json();
}

// ========================================
// Живой поиск и подсказки в шапке
// ========================================

function initHeaderLiveSearch() {
	const searchForm = document.getElementById("site-search-form");
	const searchInput = document.getElementById("site-search-input");
	if (!searchForm || !searchInput) return;

	searchForm.classList.add("search-form--has-dropdown");

	let dropdown = document.getElementById("site-search-dropdown");
	if (!dropdown) {
		dropdown = document.createElement("div");
		dropdown.id = "site-search-dropdown";
		dropdown.className = "search-dropdown";
		dropdown.setAttribute("role", "listbox");
		dropdown.hidden = true;
		searchForm.appendChild(dropdown);
	}

	let debounceTimer = null;
	let activeController = null;
	let activeIndex = -1;

	function closeDropdown() {
		dropdown.hidden = true;
		dropdown.innerHTML = "";
		activeIndex = -1;
	}

	function updateActiveItem(items) {
		items.forEach((el, idx) => {
			el.classList.toggle("is-active", idx === activeIndex);
		});
		if (activeIndex >= 0 && items[activeIndex]) {
			items[activeIndex].scrollIntoView({ block: "nearest" });
		}
	}

	function renderDropdown(data, rawQuery) {
		const results = data.results || [];
		const effectiveQuery = data.effective_query || rawQuery;

		if (!results.length) {
			dropdown.innerHTML = `
				<div class="search-dropdown__empty">
					Ничего не найдено по запросу «${escapeHTML(rawQuery)}»
				</div>
			`;
			dropdown.hidden = false;
			return;
		}

		const correctionBanner = data.corrected_from
			? `<div class="search-dropdown__correction">Показано для «<strong>${escapeHTML(effectiveQuery)}</strong>»</div>`
			: "";

		const itemsHtml = results
			.map(item => {
				const href = escapeHTML(buildResultUrl(item.url, effectiveQuery, item.type));
				const titleHtml = highlightText(item.title, effectiveQuery);
				const sub = escapeHTML(item.meta || item.description || "");
				const badge = escapeHTML(item.type_label || TYPE_LABELS[item.type] || "Раздел");
				const actionUrl = resolveActionUrl(item.action_url);
				const isPdf = actionUrl && /\.pdf(\?|$)/i.test(actionUrl);
				const actionShort = isPdf ? "PDF ↗" : "Открыть ↗";
				const actionHtml = actionUrl
					? `<a class="search-dropdown__action" href="${escapeHTML(actionUrl)}" target="_blank" rel="noopener" title="${escapeHTML(item.action_label || "Открыть")}">${actionShort}</a>`
					: "";

				return `
					<div class="search-dropdown__row">
						<a class="search-dropdown__item" href="${href}" role="option">
							<span class="search-dropdown__badge search-dropdown__badge--${escapeHTML(item.type)}">${badge}</span>
							<span class="search-dropdown__content">
								<span class="search-dropdown__title">${titleHtml}</span>
								${sub ? `<span class="search-dropdown__meta">${sub}</span>` : ""}
							</span>
						</a>
						${actionHtml}
					</div>
				`;
			})
			.join("");

		const allUrl = `${REL_PREFIX}search.html?q=${encodeURIComponent(effectiveQuery)}`;
		dropdown.innerHTML = `
			${correctionBanner}
			<div class="search-dropdown__list">${itemsHtml}</div>
			<a class="search-dropdown__footer" href="${escapeHTML(allUrl)}">
				Все результаты (${data.total}) →
			</a>
		`;
		dropdown.hidden = false;
		activeIndex = -1;
	}

	searchForm.addEventListener("submit", event => {
		event.preventDefault();
		const q = searchInput.value.trim();
		if (!q) return;
		window.location.href = `${REL_PREFIX}search.html?q=${encodeURIComponent(q)}`;
	});

	searchInput.addEventListener("input", () => {
		const q = searchInput.value.trim();
		clearTimeout(debounceTimer);
		if (activeController) {
			activeController.abort();
			activeController = null;
		}

		if (q.length < 2) {
			closeDropdown();
			return;
		}

		debounceTimer = setTimeout(async () => {
			try {
				activeController = new AbortController();
				const url = `${SEARCH_API}?q=${encodeURIComponent(q)}&limit=7`;
				const res = await fetch(url, { signal: activeController.signal });
				if (!res.ok) return;
				const data = await res.json();
				renderDropdown(data, q);
			} catch (err) {
				if (err.name !== "AbortError") {
					closeDropdown();
				}
			}
		}, 200);
	});

	searchInput.addEventListener("keydown", event => {
		if (dropdown.hidden) return;
		const items = Array.from(dropdown.querySelectorAll(".search-dropdown__item"));
		if (!items.length) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % items.length;
			updateActiveItem(items);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
			updateActiveItem(items);
		} else if (event.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
			event.preventDefault();
			window.location.href = items[activeIndex].getAttribute("href");
		} else if (event.key === "Escape") {
			closeDropdown();
		}
	});

	document.addEventListener("click", event => {
		if (!searchForm.contains(event.target)) {
			closeDropdown();
		}
	});
}

// ========================================
// Страница результатов /search.html
// ========================================

function initSearchPage() {
	const resultsContainer = document.getElementById("search-results");
	if (!resultsContainer) return;

	const queryText = document.getElementById("search-query-text");
	const emptyMessage = document.getElementById("search-empty");
	const statusContainer = document.getElementById("search-status");
	const tabsContainer = document.getElementById("search-tabs");
	const pageInput = document.getElementById("page-search-input");
	const siteInput = document.getElementById("site-search-input");
	const pageForm = document.getElementById("page-search-form");

	const params = new URLSearchParams(window.location.search);
	const initialQuery = (params.get("q") || "").trim();
	let activeType = (params.get("type") || "all").trim();
	let cachedData = null;

	if (pageInput && initialQuery) pageInput.value = initialQuery;
	if (siteInput && initialQuery) siteInput.value = initialQuery;

	if (pageForm && pageInput) {
		pageForm.addEventListener("submit", event => {
			event.preventDefault();
			const q = pageInput.value.trim();
			if (!q) return;
			const nextUrl = `search.html?q=${encodeURIComponent(q)}`;
			window.location.href = nextUrl;
		});
	}

	function renderTabs(counts) {
		if (!tabsContainer) return;
		const keys = TYPE_ORDER.filter(k => k === "all" || (counts[k] && counts[k] > 0));
		if (keys.length <= 2) {
			tabsContainer.hidden = true;
			tabsContainer.innerHTML = "";
			return;
		}

		tabsContainer.innerHTML = keys
			.map(key => {
				const count = counts[key] || 0;
				const label = TYPE_LABELS[key] || key;
				const isActive = key === activeType ? "search-tab--active" : "";
				return `
					<button type="button" class="search-tab ${isActive}" data-type="${escapeHTML(key)}">
						<span>${escapeHTML(label)}</span>
						<span class="search-tab__count">${count}</span>
					</button>
				`;
			})
			.join("");
		tabsContainer.hidden = false;

		tabsContainer.querySelectorAll(".search-tab").forEach(btn => {
			btn.addEventListener("click", () => {
				activeType = btn.dataset.type || "all";
				renderTabs(counts);
				renderResultsList();
			});
		});
	}

	function renderResultsList() {
		if (!cachedData) return;
		const effectiveQuery = cachedData.effective_query || initialQuery;
		const allResults = cachedData.results || [];
		const filtered =
			activeType === "all" ? allResults : allResults.filter(r => r.type === activeType);

		if (!filtered.length) {
			resultsContainer.innerHTML = "";
			if (emptyMessage) emptyMessage.hidden = false;
			return;
		}

		if (emptyMessage) emptyMessage.hidden = true;

		resultsContainer.innerHTML = filtered
			.map(item => {
				const href = escapeHTML(buildResultUrl(item.url, effectiveQuery, item.type));
				const titleHtml = highlightText(item.title, effectiveQuery);
				const snippetText = item.snippet || item.description || "";
				const snippetHtml = highlightText(snippetText, effectiveQuery);
				const badge = escapeHTML(item.type_label || TYPE_LABELS[item.type] || "Раздел");
				const metaHtml = item.meta ? `<div class="search-result__meta">${escapeHTML(item.meta)}</div>` : "";
				const actionUrl = resolveActionUrl(item.action_url);
				const actionBtn = actionUrl
					? `<a class="search-result__action" href="${escapeHTML(actionUrl)}" target="_blank" rel="noopener">${escapeHTML(item.action_label || "Открыть файл")} ↗</a>`
					: "";

				return `
					<article class="search-result">
						<div class="search-result__top">
							<span class="search-result__type search-result__type--${escapeHTML(item.type)}">${badge}</span>
							${metaHtml}
						</div>
						<h3 class="search-result__title">
							<a href="${href}">${titleHtml}</a>
						</h3>
						${snippetHtml ? `<p class="search-result__description">${snippetHtml}</p>` : ""}
						<div class="search-result__footer">
							<a class="search-result__link" href="${href}">Перейти →</a>
							${actionBtn}
						</div>
					</article>
				`;
			})
			.join("");
	}

	async function runPageSearch() {
		if (!initialQuery) {
			if (queryText) {
				queryText.textContent = "Введите слово, название документа, фамилию учителя или тему";
			}
			if (emptyMessage) emptyMessage.hidden = true;
			resultsContainer.innerHTML = "";
			return;
		}

		if (queryText) {
			queryText.innerHTML = `Поиск по запросу: <strong>«${escapeHTML(initialQuery)}»</strong>`;
		}

		resultsContainer.innerHTML = `<div class="search-loading">Ищем по разделам, документам, новостям и учителям...</div>`;
		if (emptyMessage) emptyMessage.hidden = true;

		try {
			const data = await fetchSearchResults(initialQuery, "all", 150);
			cachedData = data;

			if (statusContainer) {
				if (data.corrected_from) {
					statusContainer.innerHTML = `Показаны результаты для <strong>«${escapeHTML(data.effective_query)}»</strong> (исправлена раскладка с «${escapeHTML(data.corrected_from)}») • Найдено: <strong>${data.total}</strong>`;
					statusContainer.hidden = false;
				} else if (data.total > 0) {
					statusContainer.innerHTML = `Найдено результатов: <strong>${data.total}</strong>`;
					statusContainer.hidden = false;
				} else {
					statusContainer.hidden = true;
				}
			}

			renderTabs(data.counts || { all: data.total });
			renderResultsList();
		} catch (error) {
			console.error("Ошибка поиска:", error);
			resultsContainer.innerHTML = "";
			if (emptyMessage) emptyMessage.hidden = false;
		}
	}

	runPageSearch();
}

// ========================================
// Подсветка и прокрутка к слову при переходе из поиска
// ========================================

function initPageHighlight() {
	const path = window.location.pathname.toLowerCase();
	if (path.endsWith("/search.html") || path.endsWith("/documents.html")) {
		return;
	}

	const params = new URLSearchParams(window.location.search);
	const highlightQuery = (params.get("highlight") || "").trim();
	if (!highlightQuery) return;

	const words = highlightQuery
		.replace(/ё/gi, "[её]")
		.split(/\s+/)
		.filter(w => w.length >= 2);
	if (!words.length) return;

	// Для длинных русских слов ищем по основе, чтобы подсвечивать разные окончания
	const patterns = words.map(rawWord => {
		const plain = rawWord.replace(/\[её\]/g, "е");
		const escaped = rawWord.replace(/[.*+?^${}()|[\]\\]/g, m =>
			m === "[" || m === "]" ? m : `\\${m}`
		);
		if (plain.length >= 5 && /^[а-яa-z0-9\[\]]+$/i.test(escaped)) {
			const stem = escaped.slice(0, -2);
			return `${stem}[а-яё]*`;
		}
		return escaped;
	});

	const matchRegex = new RegExp(`(${patterns.join("|")})`, "gi");

	function runHighlight() {
		const root = document.querySelector("main") || document.body;
		if (!root) return;

		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
				const parent = node.parentElement;
				if (!parent) return NodeFilter.FILTER_REJECT;
				if (
					parent.closest(
						"header, nav, footer, script, style, noscript, textarea, input, select, mark, .breadcrumbs, .search-dropdown, .search-highlight-bar"
					)
				) {
					return NodeFilter.FILTER_REJECT;
				}
				return matchRegex.test(node.nodeValue)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_SKIP;
			}
		});

		const textNodes = [];
		let current;
		while ((current = walker.nextNode())) {
			textNodes.push(current);
		}
		matchRegex.lastIndex = 0;

		const marks = [];
		textNodes.forEach(node => {
			const text = node.nodeValue;
			matchRegex.lastIndex = 0;
			let lastIdx = 0;
			let match;
			const frag = document.createDocumentFragment();
			let replaced = false;

			while ((match = matchRegex.exec(text)) !== null) {
				if (match.index > lastIdx) {
					frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
				}
				const mark = document.createElement("mark");
				mark.className = "site-search-highlight";
				mark.textContent = match[0];
				frag.appendChild(mark);
				marks.push(mark);
				lastIdx = match.index + match[0].length;
				replaced = true;
			}

			if (replaced) {
				if (lastIdx < text.length) {
					frag.appendChild(document.createTextNode(text.slice(lastIdx)));
				}
				const parentDisplay = getComputedStyle(node.parentElement).display;
				if (/flex|grid/i.test(parentDisplay)) {
					const wrapper = document.createElement("span");
					wrapper.appendChild(frag);
					node.parentNode.replaceChild(wrapper, node);
				} else {
					node.parentNode.replaceChild(frag, node);
				}
			}
		});

		if (!marks.length) return;

		let activeIdx = 0;

		function focusMark(idx) {
			marks.forEach((m, i) => m.classList.toggle("site-search-highlight--active", i === idx));
			const target = marks[idx];
			if (!target) return;

			const details = target.closest("details");
			if (details) details.open = true;

			const acc = target.closest(".accordion-document");
			if (acc) acc.classList.add("accordion-document--active");

			target.scrollIntoView({ behavior: "smooth", block: "center" });
			const counter = bar.querySelector(".search-highlight-bar__count");
			if (counter) counter.textContent = `${idx + 1} / ${marks.length}`;
		}

		const bar = document.createElement("div");
		bar.className = "search-highlight-bar";
		bar.innerHTML = `
			<span class="search-highlight-bar__label">Найдено: «${escapeHTML(highlightQuery)}»</span>
			<span class="search-highlight-bar__count">1 / ${marks.length}</span>
			<button type="button" class="search-highlight-bar__btn" data-dir="prev" title="Предыдущее">↑</button>
			<button type="button" class="search-highlight-bar__btn" data-dir="next" title="Следующее">↓</button>
			<button type="button" class="search-highlight-bar__close" title="Снять выделение">✕</button>
		`;
		document.body.appendChild(bar);

		bar.querySelector('[data-dir="prev"]').addEventListener("click", () => {
			activeIdx = (activeIdx - 1 + marks.length) % marks.length;
			focusMark(activeIdx);
		});

		bar.querySelector('[data-dir="next"]').addEventListener("click", () => {
			activeIdx = (activeIdx + 1) % marks.length;
			focusMark(activeIdx);
		});

		bar.querySelector(".search-highlight-bar__close").addEventListener("click", () => {
			marks.forEach(m => {
				const parent = m.parentNode;
				if (parent) {
					parent.replaceChild(document.createTextNode(m.textContent), m);
					parent.normalize();
				}
			});
			bar.remove();
			params.delete("highlight");
			const nextSearch = params.toString();
			const cleanUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
			window.history.replaceState({}, "", cleanUrl);
		});

		focusMark(0);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => setTimeout(runHighlight, 250));
	} else {
		setTimeout(runHighlight, 250);
	}
}

initHeaderLiveSearch();
initSearchPage();
initPageHighlight();
})();
