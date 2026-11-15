with open('js/life.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace initNewspaperArchive
old_func_pattern = r'function initNewspaperArchive\(\) \{.*?\ninitNewspaperArchive\(\);'

new_func = """function initNewspaperArchive() {
	const tabs = document.querySelectorAll(".newspaper-tab");
	const cards = document.querySelectorAll(".newspaper-card");
	const countIndicator = document.getElementById("newspaper-visible-count");
	const modal = document.getElementById("newspaper-modal");
	const backdrop = document.getElementById("newspaper-modal-backdrop");
	const closeBtn = document.getElementById("newspaper-modal-close");
	const iframe = document.getElementById("newspaper-modal-iframe");
	const titleEl = document.getElementById("newspaper-modal-title");
	const openNewBtn = document.getElementById("newspaper-modal-open-new");
	const downloadBtn = document.getElementById("newspaper-modal-download");

	// 1. Фильтрация архива по годам
	if (tabs.length && cards.length) {
		tabs.forEach((tab) => {
			tab.addEventListener("click", () => {
				const targetYear = tab.getAttribute("data-year");
				tabs.forEach((t) => t.classList.remove("active"));
				tab.classList.add("active");

				let visibleCount = 0;
				cards.forEach((card) => {
					const cardYear = card.getAttribute("data-year");
					if (targetYear === "all" || cardYear === targetYear) {
						card.style.display = "";
						visibleCount++;
					} else {
						card.style.display = "none";
					}
				});

				if (countIndicator) {
					countIndicator.textContent = String(visibleCount);
				}
			});
		});
	}

	// 2. Открытие просмотрщика PDF
	function openPdf(pdfUrl, title) {
		if (!pdfUrl) return;

		// Проверяем протокол: если сайт открыт напрямую с диска через file://
		// современные браузеры (Chrome, Edge, Opera) блокируют показ локальных PDF во фрейме iframe.
		// В этом случае открываем PDF напрямую в новой вкладке встроенного ридера браузера:
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
				// Если локальный файл открыт через file://, браузер сам откроет в новой вкладке благодаря target="_blank"
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
    print("Updated initNewspaperArchive in js/life.js")
else:
    print("Could not match old function in js/life.js")
