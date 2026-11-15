# Update life.html
with open('life.html', 'r', encoding='utf-8') as f:
    html = f.read()

load_more_markup = """		</div>

		<!-- Кнопка «Показать ещё выпуски (+4)» -->
		<div class="newspaper-load-more-wrap" id="newspaper-load-more-wrap">
			<button type="button" class="newspaper-load-more-btn" id="newspaper-load-more-btn">
				<span id="newspaper-load-more-text">Показать ещё выпуски (+4)</span>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</button>
		</div>"""

target = "</div>\n\n\t\t<!-- Сноска о школьной библиотеке -->"
target_alt = "</div>\r\n\r\n\t\t<!-- Сноска о школьной библиотеке -->"

if target in html:
    html = html.replace(target, load_more_markup + "\n\n\t\t<!-- Сноска о школьной библиотеке -->", 1)
    print("Inserted load more markup in life.html (LF)")
elif target_alt in html:
    html = html.replace(target_alt, load_more_markup + "\n\n\t\t<!-- Сноска о школьной библиотеке -->", 1)
    print("Inserted load more markup in life.html (CRLF)")
else:
    import re
    html = re.sub(r'(\t*</div>\s*)(<!-- Сноска о школьной библиотеке -->)', r'\1\n' + load_more_markup + r'\n\n\t\t\2', html, count=1)
    print("Inserted load more markup via regex")

# Bump cache to v=2.9
html = html.replace('css/style.css?v=2.8', 'css/style.css?v=2.9')
html = html.replace('js/life.js?v=2.8', 'js/life.js?v=2.9')

with open('life.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Saved life.html with load more markup")

# Update js/life.js
with open('js/life.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_func_pattern = r'function initNewspaperArchive\(\) \{.*?\ninitNewspaperArchive\(\);'

new_func = """function initNewspaperArchive() {
	const tabs = document.querySelectorAll(".newspaper-tab");
	const cards = Array.from(document.querySelectorAll(".newspaper-card"));
	const countIndicator = document.getElementById("newspaper-visible-count");
	const loadMoreWrap = document.getElementById("newspaper-load-more-wrap");
	const loadMoreBtn = document.getElementById("newspaper-load-more-btn");
	const loadMoreText = document.getElementById("newspaper-load-more-text");

	const modal = document.getElementById("newspaper-modal");
	const backdrop = document.getElementById("newspaper-modal-backdrop");
	const closeBtn = document.getElementById("newspaper-modal-close");
	const iframe = document.getElementById("newspaper-modal-iframe");
	const titleEl = document.getElementById("newspaper-modal-title");
	const openNewBtn = document.getElementById("newspaper-modal-open-new");
	const downloadBtn = document.getElementById("newspaper-modal-download");

	const BATCH_SIZE = 4;
	let currentLimit = BATCH_SIZE;
	let activeYear = "all";

	// Функция обновления отображения карточек по активному фильтру и лимиту
	function updateDisplay(isLoadMoreClick) {
		const matchingCards = cards.filter((card) => {
			const cardYear = card.getAttribute("data-year");
			return activeYear === "all" || cardYear === activeYear;
		});

		const totalMatching = matchingCards.length;

		// Скрываем все карточки, не относящиеся к текущему году
		cards.forEach((card) => {
			const cardYear = card.getAttribute("data-year");
			if (activeYear !== "all" && cardYear !== activeYear) {
				card.style.display = "none";
				card.classList.add("newspaper-card--hidden");
				card.classList.remove("newspaper-card--revealed");
			}
		});

		// Отображаем подходящие карточки порциями
		matchingCards.forEach((card, index) => {
			if (index < currentLimit) {
				const wasHidden = card.classList.contains("newspaper-card--hidden") || card.style.display === "none";
				card.style.display = "";
				card.classList.remove("newspaper-card--hidden");
				if (wasHidden && isLoadMoreClick) {
					card.classList.add("newspaper-card--revealed");
				}
			} else {
				card.style.display = "none";
				card.classList.add("newspaper-card--hidden");
				card.classList.remove("newspaper-card--revealed");
			}
		});

		const currentlyVisible = Math.min(currentLimit, totalMatching);

		// Обновляем счетчик
		if (countIndicator) {
			countIndicator.textContent = `${currentlyVisible} из ${totalMatching}`;
		}

		// Управление кнопкой «Показать ещё»
		if (loadMoreWrap && loadMoreBtn) {
			if (currentLimit < totalMatching) {
				loadMoreWrap.style.display = "flex";
				loadMoreBtn.style.display = "inline-flex";
				const remaining = totalMatching - currentLimit;
				const nextBatch = Math.min(BATCH_SIZE, remaining);
				if (loadMoreText) {
					loadMoreText.textContent = `Показать ещё выпуски (+${nextBatch})`;
				}
			} else {
				loadMoreWrap.style.display = "none";
			}
		}
	}

	// 1. Фильтрация архива по вкладкам-годам
	if (tabs.length) {
		tabs.forEach((tab) => {
			tab.addEventListener("click", () => {
				activeYear = tab.getAttribute("data-year") || "all";
				tabs.forEach((t) => t.classList.remove("active"));
				tab.classList.add("active");

				// Сбрасываем лимит к начальным 4 выпускам при смене года
				currentLimit = BATCH_SIZE;
				updateDisplay(false);
			});
		});
	}

	// 2. Клик по кнопке «Показать ещё (+4)»
	if (loadMoreBtn) {
		loadMoreBtn.addEventListener("click", () => {
			currentLimit += BATCH_SIZE;
			updateDisplay(true);
		});
	}

	// Инициализируем стартовое состояние (показываем ровно первые 4 выпуска)
	updateDisplay(false);

	// 3. Открытие просмотрщика PDF
	function openPdf(pdfUrl, title) {
		if (!pdfUrl) return;

		// Проверяем протокол: если сайт открыт напрямую через file://
		// современные браузеры блокируют локальные PDF во фрейме iframe.
		// В этом случае открываем PDF напрямую в новой вкладке встроенного ридера:
		const isFileProtocol = window.location.protocol === "file:";

		if (isFileProtocol || !modal || !iframe) {
			window.open(pdfUrl, "_blank");
			return;
		}

		// На веб-сервере (http / https) открываем интерактивный модальный просмотрщик
		if (titleEl) titleEl.textContent = title || "Просмотр газеты";
		if (openNewBtn) openNewBtn.href = pdfUrl;
		if (downloadBtn) {
			downloadBtn.href = pdfUrl;
			const fname = pdfUrl.split("/").pop();
			if (fname) downloadBtn.setAttribute("download", decodeURIComponent(fname));
		}

		iframe.src = pdfUrl;
		modal.style.display = "flex";
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}

	function closePdfModal() {
		if (!modal) return;
		modal.style.display = "none";
		modal.setAttribute("aria-hidden", "true");
		if (iframe) iframe.src = "";
		document.body.style.overflow = "";
	}

	// Делегирование кликов по кнопкам чтения
	document.addEventListener("click", (e) => {
		const readBtn = e.target.closest(".btn-read-pdf, .btn-read-issue");
		if (readBtn) {
			const pdfUrl = readBtn.getAttribute("data-pdf") || readBtn.getAttribute("href");
			const title = readBtn.getAttribute("data-title");
			if (pdfUrl) {
				if (window.location.protocol !== "file:") {
					e.preventDefault();
					openPdf(pdfUrl, title);
				}
			}
		}
	});

	if (closeBtn) closeBtn.addEventListener("click", closePdfModal);
	if (backdrop) backdrop.addEventListener("click", closePdfModal);

	// Закрытие по Escape
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal && modal.style.display === "flex") {
			closePdfModal();
		}
	});
}

initNewspaperArchive();"""

import re
if re.search(old_func_pattern, js, re.DOTALL):
    js = re.sub(old_func_pattern, new_func, js, flags=re.DOTALL)
    with open('js/life.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated initNewspaperArchive with batch loading logic")
else:
    print("Could not match old function pattern in js/life.js")
