with open('js/life.js', 'r', encoding='utf-8') as f:
    js = f.read()

newspaper_js = """
// ========================================
// Медиа-архив газеты «Доброе слово» и просмотрщик PDF
// ========================================
function initNewspaperArchive() {
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

	// 1. Фильтрация по годам
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

	// 2. Открытие модального просмотрщика PDF
	function openPdfModal(pdfUrl, title) {
		if (!modal || !iframe) {
			window.open(pdfUrl, "_blank");
			return;
		}

		if (titleEl) titleEl.textContent = title || "Просмотр газеты";
		if (openNewBtn) openNewBtn.href = pdfUrl;
		if (downloadBtn) {
			downloadBtn.href = pdfUrl;
			const fname = pdfUrl.split("/").pop();
			if (fname) downloadBtn.setAttribute("download", fname);
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
			e.preventDefault();
			const pdfUrl = readBtn.getAttribute("data-pdf");
			const title = readBtn.getAttribute("data-title");
			if (pdfUrl) {
				openPdfModal(pdfUrl, title);
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

initNewspaperArchive();
"""

if "function initNewspaperArchive()" not in js:
    idx = js.rfind("})();")
    if idx != -1:
        js = js[:idx] + newspaper_js + "\n})();\n"
        with open('js/life.js', 'w', encoding='utf-8') as f:
            f.write(js)
        print("Added initNewspaperArchive to js/life.js")
    else:
        print("Could not find })();")
else:
    print("initNewspaperArchive already present")
