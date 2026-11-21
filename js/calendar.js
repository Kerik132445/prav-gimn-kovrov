/**
 * Православный церковный календарь для сайта гимназии
 * Интеграция с официальным богослужебным месяцесловом Православие.Ru (days.pravoslavie.ru)
 * Офлайн-резерв и локальное кеширование икон
 */

(function () {
	"use strict";

	let currentDate = new Date();
	let currentCalendarData = null;

	const MONTHS_RU_GENITIVE = [
		"", "января", "февраля", "марта", "апреля", "мая", "июня",
		"июля", "августа", "сентября", "октября", "ноября", "декабря"
	];

	function formatDateKey(dateObj) {
		const m = String(dateObj.getMonth() + 1).padStart(2, "0");
		const d = String(dateObj.getDate()).padStart(2, "0");
		return `${m}-${d}`;
	}

	function formatDateIso(dateObj) {
		const y = dateObj.getFullYear();
		const m = String(dateObj.getMonth() + 1).padStart(2, "0");
		const d = String(dateObj.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	function getLocalFallback(dateObj) {
		const key = formatDateKey(dateObj);
		if (window.CALENDAR_FALLBACK && window.CALENDAR_FALLBACK[key]) {
			return window.CALENDAR_FALLBACK[key];
		}

		// Расчёт старого стиля (минус 13 дней)
		const oldStyleDate = new Date(dateObj.getTime() - 13 * 24 * 60 * 60 * 1000);
		const day = dateObj.getDate();
		const month = dateObj.getMonth() + 1;
		const oldDay = oldStyleDate.getDate();
		const oldMonth = oldStyleDate.getMonth() + 1;

		const dateDisplay = `${day} ${MONTHS_RU_GENITIVE[month]} (${oldDay} ${MONTHS_RU_GENITIVE[oldMonth]} по ст. ст.)`;

		// Проверка Рождественского поста (с 28 ноября по 6 января)
		const isAdvent = (month === 11 && day >= 28) || (month === 12) || (month === 1 && day <= 6);
		const weekday = dateObj.getDay(); // 0 - Вс, 1 - Пн, 2 - Вт, 3 - Ср, 4 - Чт, 5 - Пт, 6 - Сб

		let fasting = "Поста нет";
		let fastingType = "none";

		if (isAdvent) {
			if (weekday === 0 || weekday === 6) {
				fasting = "Рождественский пост (рыба разрешена)";
				fastingType = "fish";
			} else if (weekday === 2 || weekday === 4) {
				fasting = "Рождественский пост (горячая пища с елеем)";
				fastingType = "oil";
			} else {
				fasting = "Рождественский пост (сухоядение / постный день)";
				fastingType = "fast";
			}
		} else {
			if (weekday === 3 || weekday === 5) {
				fasting = "Постный день (рыба разрешена)";
				fastingType = "fish";
			}
		}

		return {
			date: formatDateIso(dateObj),
			date_display: dateDisplay,
			week: "Седмица по Пятидесятнице",
			title: "Память святых угодников Божиих",
			fasting: fasting,
			fasting_type: fastingType,
			icon_url: "assets/images/calendar/spas_default.jpg",
			icon_title: "Спас Нерукотворный",
			saints_html: "<span>Святые подвижники веры и благочестия</span>",
			saints_text: "Святые подвижники веры и благочестия",
			readings_html: "<span>Богослужебные чтения дня согласно церковному уставу</span>",
			pravoslavie_url: "https://days.pravoslavie.ru/"
		};
	}

	async function fetchCalendarDay(dateObj) {
		const isoDate = formatDateIso(dateObj);
		const baseUrl = window.API_BASE_URL || "http://127.0.0.1:8000";
		const apiUrl = `${baseUrl}/api/calendar/${isoDate}`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000);

			const response = await fetch(apiUrl, {
				signal: controller.signal
			});
			clearTimeout(timeoutId);

			if (response.ok) {
				const data = await response.json();
				return data;
			}
		} catch (err) {
			console.info("Загрузка календаря из локальной канонической базы (офлайн):", err.message);
		}

		return getLocalFallback(dateObj);
	}

	function getFullIconUrl(rawUrl) {
		if (!rawUrl) return "assets/images/calendar/2026-11-21.jpg";
		if (rawUrl.startsWith("/uploads")) {
			const baseUrl = window.API_BASE_URL || "http://127.0.0.1:8000";
			return baseUrl + rawUrl;
		}
		return rawUrl;
	}

	function renderCalendarBanner(data) {
		currentCalendarData = data;

		const iconImg = document.getElementById("calendar-icon-img");
		const dateEl = document.getElementById("calendar-date-text");
		const weekEl = document.getElementById("calendar-week-text");
		const fastingBadge = document.getElementById("calendar-fasting-badge");
		const titleEl = document.getElementById("calendar-feast-title");
		const descEl = document.getElementById("calendar-feast-desc");

		if (!titleEl) return;

		if (iconImg) {
			iconImg.src = getFullIconUrl(data.icon_url);
			iconImg.alt = data.icon_title || data.title || "Икона дня";
			iconImg.onerror = function() {
				this.onerror = null;
				this.src = "assets/images/calendar/spas_default.jpg";
			};
		}

		if (dateEl) {
			dateEl.textContent = data.date_display || data.date;
		}

		if (weekEl) {
			if (data.week) {
				weekEl.textContent = data.week;
				weekEl.style.display = "inline-flex";
			} else {
				weekEl.style.display = "none";
			}
		}

		if (fastingBadge) {
			fastingBadge.textContent = data.fasting || "Поста нет";
			fastingBadge.className = "church-calendar__fasting-badge";
			if (data.fasting_type === "fish") {
				fastingBadge.classList.add("church-calendar__fasting-badge--fish");
			} else if (data.fasting_type === "fast") {
				fastingBadge.classList.add("church-calendar__fasting-badge--strict");
			} else if (data.fasting_type === "oil") {
				fastingBadge.classList.add("church-calendar__fasting-badge--fish");
			} else {
				fastingBadge.classList.add("church-calendar__fasting-badge--none");
			}
		}

		if (titleEl) {
			titleEl.textContent = data.title || "Память святых дня";
		}

		if (descEl) {
			descEl.textContent = data.saints_text || data.description || "Православный месяцеслов гимназии";
		}
	}

	function openModal() {
		if (!currentCalendarData) return;
		const modal = document.getElementById("calendar-modal");
		if (!modal) return;

		const mDate = document.getElementById("modal-calendar-date");
		const mOldDate = document.getElementById("modal-calendar-old-date");
		const mWeek = document.getElementById("modal-calendar-week");
		const mIcon = document.getElementById("modal-calendar-icon");
		const mTitle = document.getElementById("modal-calendar-title");
		const mSubtitle = document.getElementById("modal-calendar-feast-subtitle");
		const mFasting = document.getElementById("modal-calendar-fasting");
		const mSaintsHtml = document.getElementById("modal-calendar-saints-html");
		const mReadingsHtml = document.getElementById("modal-calendar-readings-html");
		const mPravoslavieLink = document.getElementById("modal-calendar-pravoslavie-link");

		// Красивое разделение даты и старого стиля
		let rawDate = currentCalendarData.date_display || currentCalendarData.date || "";
		let mainDate = rawDate;
		let subDate = "";

		const dateMatch = rawDate.match(/^([^(]+)\(\s*([^)]+?)\s*ст\.ст\.\)\s*,?\s*(.*)$/i);
		if (dateMatch) {
			mainDate = dateMatch[1].trim();
			const oldSt = dateMatch[2].trim();
			let weekday = dateMatch[3].replace(/[.,]/g, "").trim();
			if (weekday) {
				weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
			}
			subDate = `${oldSt} по старому стилю` + (weekday ? ` • ${weekday}` : "");
		} else {
			subDate = currentCalendarData.old_date || "";
		}

		if (mDate) mDate.textContent = mainDate;
		if (mOldDate) {
			mOldDate.textContent = subDate;
			mOldDate.style.display = subDate ? "block" : "none";
		}

		if (mWeek) {
			let w = currentCalendarData.week || "Седмица по Пятидесятнице";
			if (w.endsWith(".")) w = w.slice(0, -1);
			mWeek.textContent = w;
		}

		if (mIcon) {
			mIcon.src = getFullIconUrl(currentCalendarData.icon_url);
			mIcon.alt = currentCalendarData.icon_title || currentCalendarData.title;
			mIcon.onerror = function() {
				this.onerror = null;
				this.src = "assets/images/calendar/spas_default.jpg";
			};
		}

		if (mTitle) {
			// Убираем точку на конце названия, если она есть
			let t = currentCalendarData.title || "Память святых дня";
			if (t.endsWith(".")) t = t.slice(0, -1);
			mTitle.textContent = t;
		}

		if (mSubtitle) {
			let desc = currentCalendarData.description || "";
			if (!desc && currentCalendarData.saints_text) {
				const parts = currentCalendarData.saints_text.split(".");
				desc = parts[0].trim();
				if (desc && !desc.endsWith(".")) desc += ".";
			}
			mSubtitle.textContent = desc || "Православный богослужебный месяцеслов гимназии";
		}

		if (mFasting) {
			let fastText = currentCalendarData.fasting || "Поста нет";
			if (fastText.endsWith(".")) fastText = fastText.slice(0, -1);
			mFasting.textContent = fastText;
			mFasting.className = "calendar-modal__fasting-tag";
			if (currentCalendarData.fasting_type === "fish") {
				mFasting.classList.add("calendar-modal__fasting-tag--fish");
			} else if (currentCalendarData.fasting_type === "fast") {
				mFasting.classList.add("calendar-modal__fasting-tag--strict");
			} else if (currentCalendarData.fasting_type === "oil") {
				mFasting.classList.add("calendar-modal__fasting-tag--oil");
			} else {
				mFasting.classList.add("calendar-modal__fasting-tag--none");
			}
		}

		if (mSaintsHtml) {
			mSaintsHtml.innerHTML = currentCalendarData.saints_html || currentCalendarData.saints_text || "Память святых дня";
		}

		if (mReadingsHtml) {
			let readings = currentCalendarData.readings_html || "Чтения согласно богослужебному уставу";
			// Форматируем зачала построчно и красиво
			readings = readings
				.replace(/(?:Утр\.\s*-\s*)/gi, "<div class='calendar-reading-row'><span class='reading-badge'>Утреня:</span> ")
				.replace(/(?:Лит\.\s*-\s*)/gi, "</div><div class='calendar-reading-row'><span class='reading-badge'>Литургия:</span> ")
				.replace(/(?:Ап\.\s*:\s*)/gi, "</div><div class='calendar-reading-row'><span class='reading-badge'>Апостол:</span> ");
			if (readings.includes("<div class='calendar-reading-row'>") && !readings.endsWith("</div>")) {
				readings += "</div>";
			}
			mReadingsHtml.innerHTML = readings;
		}

		if (mPravoslavieLink) {
			mPravoslavieLink.href = currentCalendarData.pravoslavie_url || "https://days.pravoslavie.ru/";
		}

		modal.classList.add("calendar-modal--active");
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}

	function closeModal() {
		const modal = document.getElementById("calendar-modal");
		if (!modal) return;

		modal.classList.remove("calendar-modal--active");
		modal.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	}

	async function changeDay(offsetDays) {
		currentDate = new Date(currentDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
		const data = await fetchCalendarDay(currentDate);
		renderCalendarBanner(data);
	}

	async function initCalendar() {
		const banner = document.getElementById("church-calendar-banner");
		if (!banner) return;

		// Загружаем сегодняшний день
		const data = await fetchCalendarDay(currentDate);
		renderCalendarBanner(data);

		// Клик для открытия модалки
		const triggerEls = [
			document.getElementById("calendar-details-btn"),
			document.getElementById("calendar-icon-card"),
			document.getElementById("calendar-feast-title")
		];

		triggerEls.forEach(el => {
			if (el) {
				el.addEventListener("click", (e) => {
					e.preventDefault();
					openModal();
				});
			}
		});

		// Навигация по дням
		const prevBtn = document.getElementById("calendar-prev-btn");
		const nextBtn = document.getElementById("calendar-next-btn");
		const todayBtn = document.getElementById("calendar-today-btn");

		if (prevBtn) {
			prevBtn.addEventListener("click", () => changeDay(-1));
		}
		if (nextBtn) {
			nextBtn.addEventListener("click", () => changeDay(1));
		}
		if (todayBtn) {
			todayBtn.addEventListener("click", () => {
				currentDate = new Date();
				fetchCalendarDay(currentDate).then(renderCalendarBanner);
			});
		}

		// Модальное окно: закрытие
		const closeBtn = document.getElementById("calendar-modal-close");
		const modalOverlay = document.getElementById("calendar-modal");

		if (closeBtn) {
			closeBtn.addEventListener("click", closeModal);
		}

		if (modalOverlay) {
			modalOverlay.addEventListener("click", (e) => {
				if (e.target === modalOverlay) {
					closeModal();
				}
			});
		}

		window.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				closeModal();
			}
		});
	}

	// Инициализация при готовности DOM
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initCalendar);
	} else {
		initCalendar();
	}
})();
