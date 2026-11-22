document.addEventListener("DOMContentLoaded", () => {
	const SCHEDULE_API_URL = `${window.API_BASE_URL}/api/schedule`;

	const BASE_DAYS = {
		spassky: [
			{ id: "mon", label: "Понедельник" },
			{ id: "tue", label: "Вторник" },
			{ id: "wed", label: "Среда" },
			{ id: "thu", label: "Четверг" },
			{ id: "fri", label: "Пятница" }
		],
		pokrovsky: [
			{ id: "mon", label: "Понедельник" },
			{ id: "tue", label: "Вторник" },
			{ id: "wed", label: "Среда" },
			{ id: "thu", label: "Четверг" },
			{ id: "fri", label: "Пятница" },
			{ id: "sat", label: "Суббота" }
		]
	};

	const ALL_DAY_ITEMS = [
		{ id: "mon", label: "Понедельник" },
		{ id: "tue", label: "Вторник" },
		{ id: "wed", label: "Среда" },
		{ id: "thu", label: "Четверг" },
		{ id: "fri", label: "Пятница" },
		{ id: "sat", label: "Суббота" }
	];

	const scheduleTemplates = {
		regular: [
			{ type: "church", title: "Молитва", time: "7:55 – 8:15", icon: "church.svg" },
			{ type: "lesson", title: "1 урок", time: "8:20 – 9:00" },
			{ type: "break", title: "Завтрак", time: "9:00 – 9:10", icon: "food-toastr.svg" },
			{ type: "lesson", title: "2 урок", time: "9:10 – 9:50" },
			{ type: "lesson", title: "3 урок", time: "10:00 – 10:40" },
			{ type: "lesson", title: "4 урок", time: "10:50 – 11:30" },
			{ type: "lesson", title: "5 урок", time: "11:45 – 12:25" },
			{ type: "break", title: "Обед", time: "12:25 – 12:40", icon: "food-appler.svg" },
			{ type: "lesson", title: "6 урок", time: "12:40 – 13:20" },
			{ type: "lesson", title: "7 урок", time: "13:30 – 14:10" },
			{ type: "lesson", title: "8 урок", time: "14:20 – 15:00" }
		],
		thursday: [
			{ type: "church", title: "Молитва", time: "7:55 – 8:20", icon: "church.svg" },
			{ type: "lesson", title: "1 урок", time: "8:30 – 9:10" },
			{ type: "break", title: "Завтрак", time: "9:10 – 9:20", icon: "food-toastr.svg" },
			{ type: "lesson", title: "2 урок", time: "9:20 – 10:00" },
			{ type: "lesson", title: "3 урок", time: "10:10 – 10:50" },
			{ type: "lesson", title: "4 урок", time: "11:00 – 11:40" },
			{ type: "break", title: "Обед", time: "11:40 – 11:55", icon: "food-appler.svg" },
			{ type: "lesson", title: "5 урок", time: "11:55 – 12:35" },
			{ type: "church", title: "Молебен", time: "12:45 – 13:05", icon: "church.svg" },
			{ type: "lesson", title: "6 урок", time: "13:15 – 13:55" },
			{ type: "lesson", title: "7 урок", time: "14:05 – 14:45" },
			{ type: "lesson", title: "8 урок", time: "14:50 – 15:30" }
		],
		saturday: [
			{ type: "lesson", title: "2 урок", time: "9:10 – 9:50" },
			{ type: "break", title: "Завтрак", time: "9:50 – 10:00", icon: "food-toastr.svg" },
			{ type: "lesson", title: "3 урок", time: "10:00 – 10:40" },
			{ type: "lesson", title: "4 урок", time: "10:50 – 11:30" },
			{ type: "lesson", title: "5 урок", time: "11:40 – 12:20" },
			{ type: "lesson", title: "6 урок", time: "12:30 – 13:10" },
			{ type: "lesson", title: "7 урок", time: "13:20 – 14:00" }
		]
	};

	const campusCards = document.querySelectorAll(".campus-card");
	const classTabsContainer = document.querySelector(".class-tabs");
	const dayTabsContainer = document.querySelector(".day-tabs");
	const bellsListContainer = document.querySelector(".schedule-card:first-child .schedule-list");
	const lessonsListContainer = document.getElementById("schedule-lessons-list")
		|| document.querySelector(".schedule-card:last-child .schedule-list");

	let allClasses = [];
	const lessonsCache = new Map();

	const state = {
		building: "spassky",
		classId: null,
		day: "mon",
		loadingClasses: true,
		loadingLessons: false,
		errorMessage: ""
	};

	function escapeHtml(text) {
		return String(text ?? "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}

	function formatRoom(room) {
		const trimmed = (room || "").trim();
		if (!trimmed) return "";
		if (/^каб/i.test(trimmed)) return trimmed;
		if (/^\d+[а-яa-z\-]*$/i.test(trimmed)) return `каб. ${trimmed}`;
		return trimmed;
	}

	function generateBellsSchedule(building, day) {
		let templateKey = "regular";
		if (day === "thu") templateKey = "thursday";
		if (day === "sat") templateKey = "saturday";

		let bells = [...scheduleTemplates[templateKey]];

		if (building === "spassky") {
			const cutIndex = bells.findIndex(item => item.title === "6 урок");
			if (cutIndex !== -1) {
				bells = bells.slice(0, cutIndex);
			}

			bells.push(
				{ type: "special", title: "Прогулка", time: "13:00 – 13:30", icon: "tree.svg" },
				{ type: "lesson", title: "1 внеурочка", time: "13:30 – 14:10" },
				{ type: "lesson", title: "2 внеурочка", time: "14:20 – 15:00" },
				{ type: "special", title: "Самоподготовка", time: "15:00 – 16:00", icon: "book-schedule.svg" }
			);
		}

		return bells;
	}

	function renderBells() {
		if (!bellsListContainer) return;
		const bells = generateBellsSchedule(state.building, state.day);

		bellsListContainer.innerHTML = bells.map(item => {
			const modClass = item.type !== "lesson" ? `schedule-item--${item.type}` : "";
			const iconImg = item.icon ? `<img src="assets/icons/${item.icon}" alt="${escapeHtml(item.title)}">` : "";
			return `
				<li class="schedule-item ${modClass}">
					<p class="schedule-item__text">${iconImg}${escapeHtml(item.title)}</p>
					<p class="schedule-item__time">${escapeHtml(item.time)}</p>
				</li>
			`;
		}).join("");
	}

	function getClassesForBuilding(buildingKey) {
		return allClasses.filter(c => c.building === buildingKey);
	}

	function getDaysForActiveView() {
		const base = BASE_DAYS[state.building] || BASE_DAYS.spassky;
		const classLessons = state.classId ? (lessonsCache.get(state.classId) || []) : [];
		if (state.building === "spassky" && classLessons.some(l => l.day_of_week === "sat")) {
			return ALL_DAY_ITEMS;
		}
		return base;
	}

	function renderCampusCardsState() {
		campusCards.forEach(card => {
			card.classList.toggle("campus-card--active", card.dataset.building === state.building);
		});
	}

	function renderClassTabs() {
		if (!classTabsContainer) return;

		if (state.loadingClasses) {
			classTabsContainer.innerHTML = `<p class="schedule-empty-classes">Загрузка классов...</p>`;
			return;
		}

		const buildingClasses = getClassesForBuilding(state.building);
		if (!buildingClasses.length) {
			state.classId = null;
			classTabsContainer.innerHTML = `<p class="schedule-empty-classes">В этом корпусе классы пока не добавлены</p>`;
			return;
		}

		if (!buildingClasses.some(c => c.id === state.classId)) {
			state.classId = buildingClasses[0].id;
		}

		classTabsContainer.innerHTML = "";
		buildingClasses.forEach(cls => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `class-btn ${cls.id === state.classId ? "class-btn--active" : ""}`;
			btn.dataset.classId = String(cls.id);
			btn.dataset.class = cls.name;
			btn.textContent = `${cls.name} класс`;

			btn.addEventListener("click", async () => {
				if (state.classId === cls.id) return;
				state.classId = cls.id;
				renderClassTabs();
				await ensureClassLessonsLoaded(cls.id);
				renderDayTabs();
				renderSchedule();
			});

			classTabsContainer.appendChild(btn);
		});
	}

	function renderDayTabs() {
		if (!dayTabsContainer) return;
		const days = getDaysForActiveView();
		if (!days.some(d => d.id === state.day)) {
			state.day = days[0].id;
		}

		dayTabsContainer.innerHTML = "";
		days.forEach(dayObj => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `day-btn ${dayObj.id === state.day ? "day-btn--active" : ""}`;
			btn.dataset.day = dayObj.id;
			btn.textContent = dayObj.label;

			btn.addEventListener("click", () => {
				state.day = dayObj.id;
				renderDayTabs();
				renderSchedule();
			});

			dayTabsContainer.appendChild(btn);
		});
	}

	function renderLessons() {
		if (!lessonsListContainer) return;

		if (state.errorMessage) {
			lessonsListContainer.innerHTML = `
				<li class="schedule-item schedule-item--status schedule-item--error">
					<p class="schedule-item__text">${escapeHtml(state.errorMessage)}</p>
					<button type="button" class="schedule-retry-btn" id="schedule-retry-button">Повторить попытку</button>
				</li>
			`;
			document.getElementById("schedule-retry-button")?.addEventListener("click", initSchedule);
			return;
		}

		if (state.loadingClasses || state.loadingLessons) {
			lessonsListContainer.innerHTML = `
				<li class="schedule-item schedule-item--status">
					<p class="schedule-item__text">Загрузка расписания...</p>
				</li>
			`;
			return;
		}

		if (!state.classId) {
			lessonsListContainer.innerHTML = `
				<li class="schedule-item schedule-item--status">
					<p class="schedule-item__text">Для выбранного корпуса расписание пока не добавлено</p>
				</li>
			`;
			return;
		}

		const classLessons = lessonsCache.get(state.classId) || [];
		if (!classLessons.length) {
			lessonsListContainer.innerHTML = `
				<li class="schedule-item schedule-item--status">
					<p class="schedule-item__text">Для этого класса расписание пока не заполнено</p>
				</li>
			`;
			return;
		}

		const dayLessons = classLessons
			.filter(item => item.day_of_week === state.day)
			.sort((a, b) => a.lesson_number - b.lesson_number || a.start_time.localeCompare(b.start_time));

		if (!dayLessons.length) {
			lessonsListContainer.innerHTML = `
				<li class="schedule-item schedule-item--status">
					<p class="schedule-item__text">В этот день занятий нет</p>
				</li>
			`;
			return;
		}

		lessonsListContainer.innerHTML = dayLessons.map(lesson => {
			const metaParts = [];
			const formattedRoom = formatRoom(lesson.room);
			if (formattedRoom) metaParts.push(formattedRoom);
			const teacherDisplay = lesson.teacher_short_name || lesson.teacher_name || "";
			if (teacherDisplay) metaParts.push(teacherDisplay);

			const metaHtml = metaParts.length
				? `<p class="schedule-item__title">${escapeHtml(metaParts.join(" • "))}</p>`
				: "";

			return `
				<li class="schedule-item">
					<p class="schedule-item__text">${lesson.lesson_number} урок</p>
					<div class="schedule-item__info">
						<p class="schedule-item__subject">${escapeHtml(lesson.subject)}</p>
						${metaHtml}
					</div>
					<p class="schedule-item__time">${escapeHtml(lesson.start_time)} – ${escapeHtml(lesson.end_time)}</p>
				</li>
			`;
		}).join("");
	}

	function renderSchedule() {
		renderBells();
		renderLessons();
		updateScheduleLiveWidget();
	}

	function formatLiveRemaining(totalSeconds) {
		if (totalSeconds < 0) totalSeconds = 0;
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		if (hours > 0) return `${hours} ч ${minutes} мин`;
		if (minutes > 0) return `${minutes} мин ${seconds < 10 ? "0" : ""}${seconds} сек`;
		return `${seconds} сек`;
	}

	function parseLiveTimeToSeconds(timeStr) {
		const parts = timeStr.split(/[–—\-]/);
		const parseOne = s => {
			const [h, m] = s.trim().split(":").map(Number);
			return h * 3600 + m * 60;
		};
		return {
			startSec: parseOne(parts[0]),
			endSec: parseOne(parts[1])
		};
	}

	function updateScheduleLiveWidget() {
		const widgetEl = document.getElementById("schedule-live-widget");
		if (!widgetEl) return;

		const now = new Date();
		const dayIndex = now.getDay();
		const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
		const todayKey = dayKeys[dayIndex];
		const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

		if (todayKey === "sun") {
			widgetEl.className = "schedule-live-card schedule-live-card--done";
			widgetEl.innerHTML = `
				<div class="schedule-live-card__main">
					<div class="schedule-live-card__header">
						<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>Выходной день</span>
						<div class="schedule-live-timer"><span>Занятий нет 🌿</span></div>
					</div>
					<div class="schedule-live-title-row">
						<h3 class="schedule-live-card__title">Сегодня воскресенье – гимназия отдыхает</h3>
					</div>
					<p class="schedule-live-card__desc">Проведите этот день с пользой и радостью в кругу семьи. Ждём вас завтра на занятиях!</p>
				</div>
				<div class="schedule-live-card__next">
					<div class="schedule-live-card__next-label"><span>Следующий учебный день</span><span class="schedule-live-card__next-time" style="background:#ede9fe; color:#6d28d9;">Пн, 07:55</span></div>
					<p class="schedule-live-card__next-title">Общая молитва и 1-й урок</p>
					<p class="schedule-live-card__next-meta">Спасский и Покровский корпуса</p>
				</div>
			`;
			return;
		}

		if (todayKey === "sat" && state.building === "spassky") {
			widgetEl.className = "schedule-live-card schedule-live-card--done";
			widgetEl.innerHTML = `
				<div class="schedule-live-card__main">
					<div class="schedule-live-card__header">
						<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>Выходной день</span>
						<div class="schedule-live-timer"><span>Занятий нет 🌿</span></div>
					</div>
					<div class="schedule-live-title-row">
						<h3 class="schedule-live-card__title">В Спасском корпусе сегодня выходной</h3>
					</div>
					<p class="schedule-live-card__desc">У 1–4 классов пятидневная учебная неделя. Отдыхайте и набирайтесь сил перед новой неделей!</p>
				</div>
				<div class="schedule-live-card__next">
					<div class="schedule-live-card__next-label"><span>Следующий учебный день</span><span class="schedule-live-card__next-time" style="background:#ede9fe; color:#6d28d9;">Пн, 07:55</span></div>
					<p class="schedule-live-card__next-title">Общая молитва и 1-й урок</p>
					<p class="schedule-live-card__next-meta">1–4 классы • Спасский корпус</p>
				</div>
			`;
			return;
		}

		const bells = generateBellsSchedule(state.building, todayKey);
		if (!bells || !bells.length) return;

		const parsedBells = bells.map(item => {
			const { startSec, endSec } = parseLiveTimeToSeconds(item.time);
			return { ...item, startSec, endSec };
		});

		const firstBell = parsedBells[0];
		const lastBell = parsedBells[parsedBells.length - 1];

		const classLessons = state.classId ? (lessonsCache.get(state.classId) || []) : [];
		const selectedClass = allClasses.find(c => c.id === state.classId);
		const classLabel = selectedClass ? `${selectedClass.name} класс` : "";

		const getLessonInfo = bellItem => {
			if (!bellItem) return null;
			const numMatch = bellItem.title.match(/(\d+)\s*урок/i);
			const lessonNum = numMatch ? parseInt(numMatch[1], 10) : null;
			if (lessonNum && classLessons.length) {
				const found = classLessons.find(l => l.day_of_week === todayKey && l.lesson_number === lessonNum);
				if (found) {
					return {
						subject: found.subject,
						room: formatRoom(found.room),
						teacher: found.teacher_short_name || found.teacher_name || "",
						isSpecific: true
					};
				}
			}
			return {
				subject: bellItem.title,
				room: "",
				teacher: "",
				isSpecific: false
			};
		};

		// 1: Before school starts
		if (nowSec < firstBell.startSec) {
			const remSec = firstBell.startSec - nowSec;
			const firstLessonBell = parsedBells.find(b => b.type === "lesson") || firstBell;
			const firstLessonInfo = getLessonInfo(firstLessonBell);

			widgetEl.className = "schedule-live-card schedule-live-card--break";
			widgetEl.innerHTML = `
				<div class="schedule-live-card__main">
					<div class="schedule-live-card__header">
						<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>До начала занятий</span>
						<div class="schedule-live-timer"><span>До первого звонка:</span><span class="schedule-live-timer__digits">${formatLiveRemaining(remSec)}</span></div>
					</div>
					<div class="schedule-live-title-row">
						<h3 class="schedule-live-card__title">Учебный день ещё не начался</h3>
						${classLabel ? `<span class="schedule-live-card__meta-tag">${escapeHtml(classLabel)}</span>` : ""}
					</div>
					<p class="schedule-live-card__desc">Первый звонок прозвенит в ${firstBell.time.split(/[–—\-]/)[0].trim()}. Не забудьте прийти вовремя и переобуться!</p>
				</div>
				<div class="schedule-live-card__next">
					<div class="schedule-live-card__next-label"><span>${escapeHtml(firstLessonBell.title)}</span><span class="schedule-live-card__next-time">${firstLessonBell.time.split(/[–—\-]/)[0].trim()}</span></div>
					<p class="schedule-live-card__next-title">${escapeHtml(firstLessonInfo.subject)}</p>
					<p class="schedule-live-card__next-meta">${[firstLessonInfo.room, firstLessonInfo.teacher].filter(Boolean).map(escapeHtml).join(" • ") || "Начало занятий"}</p>
				</div>
			`;
			return;
		}

		// 2: After last bell
		if (nowSec >= lastBell.endSec) {
			const isSpassky = state.building === "spassky";
			const tomorrowDesc = (todayKey === "fri" && isSpassky) || todayKey === "sat"
				? "Ждём вас в понедельник в 07:55"
				: "Ждём вас завтра в 07:55";

			widgetEl.className = "schedule-live-card schedule-live-card--done";
			widgetEl.innerHTML = `
				<div class="schedule-live-card__main">
					<div class="schedule-live-card__header">
						<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>Уроки окончены</span>
						<div class="schedule-live-timer"><span>Учебный день завершён 🎉</span></div>
					</div>
					<div class="schedule-live-title-row">
						<h3 class="schedule-live-card__title">Все уроки на сегодня подошли к концу</h3>
						${classLabel ? `<span class="schedule-live-card__meta-tag">${escapeHtml(classLabel)}</span>` : ""}
					</div>
					<p class="schedule-live-card__desc">Отличная работа! Отдыхайте, делайте домашние задания и набирайтесь сил перед новым днём.</p>
				</div>
				<div class="schedule-live-card__next">
					<div class="schedule-live-card__next-label"><span>Следующий сбор</span><span class="schedule-live-card__next-time" style="background:#ede9fe; color:#6d28d9;">07:55</span></div>
					<p class="schedule-live-card__next-title">Общая молитва и 1-й урок</p>
					<p class="schedule-live-card__next-meta">${escapeHtml(tomorrowDesc)}</p>
				</div>
			`;
			return;
		}

		// 3: During the day (inside an event or in a break)
		for (let i = 0; i < parsedBells.length; i++) {
			const item = parsedBells[i];

			if (nowSec >= item.startSec && nowSec < item.endSec) {
				const remSec = item.endSec - nowSec;
				const totalDur = item.endSec - item.startSec;
				const progressPct = Math.min(100, Math.max(0, ((nowSec - item.startSec) / totalDur) * 100));

				const nextItem = i + 1 < parsedBells.length ? parsedBells[i + 1] : null;
				const nextInfo = getLessonInfo(nextItem);
				const isLesson = item.type === "lesson";
				const isBreak = item.type === "break";
				const lessonInfo = isLesson ? getLessonInfo(item) : null;

				const cardClass = isLesson ? "schedule-live-card--lesson" : "schedule-live-card--break";
				const pillText = isLesson ? `Идёт ${item.title}` : (isBreak ? `${item.title}` : item.title);
				const timerLabel = isLesson ? "До перемены:" : "До конца:";
				const [startDisplay, endDisplay] = item.time.split(/[–—\-]/).map(s => s.trim());

				const metaParts = [];
				if (classLabel) metaParts.push(`<span class="schedule-live-card__meta-tag">${escapeHtml(classLabel)}</span>`);
				if (lessonInfo?.room) metaParts.push(`<span class="schedule-live-card__meta-tag">${escapeHtml(lessonInfo.room)}</span>`);
				if (lessonInfo?.teacher) metaParts.push(`<span>${escapeHtml(lessonInfo.teacher)}</span>`);
				metaParts.push(`<span>${escapeHtml(item.time)}</span>`);

				widgetEl.className = `schedule-live-card ${cardClass}`;
				widgetEl.innerHTML = `
					<div class="schedule-live-card__main">
						<div class="schedule-live-card__header">
							<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>${escapeHtml(pillText)}</span>
							<div class="schedule-live-timer"><span>${timerLabel}</span><span class="schedule-live-timer__digits">${formatLiveRemaining(remSec)}</span></div>
						</div>
						<div class="schedule-live-title-row">
							<h3 class="schedule-live-card__title">${escapeHtml(lessonInfo ? lessonInfo.subject : item.title)}</h3>
							<div class="schedule-live-card__meta">${metaParts.join("")}</div>
						</div>
						<div class="schedule-live-progress">
							<div class="schedule-live-progress__track"><div class="schedule-live-progress__fill" style="width: ${progressPct.toFixed(1)}%;"></div></div>
							<div class="schedule-live-progress__labels"><span>${startDisplay}</span><span>${Math.round(progressPct)}% позади</span><span>${endDisplay}</span></div>
						</div>
					</div>
					${nextItem ? `
						<div class="schedule-live-card__next">
							<div class="schedule-live-card__next-label"><span>Далее: ${escapeHtml(nextItem.title)}</span><span class="schedule-live-card__next-time">${nextItem.time.split(/[–—\-]/)[0].trim()}</span></div>
							<p class="schedule-live-card__next-title">${escapeHtml(nextInfo ? nextInfo.subject : nextItem.title)}</p>
							<p class="schedule-live-card__next-meta">${[nextInfo?.room, nextInfo?.teacher].filter(Boolean).map(escapeHtml).join(" • ") || "По расписанию"}</p>
						</div>
					` : `
						<div class="schedule-live-card__next">
							<div class="schedule-live-card__next-label"><span>Конец дня</span><span class="schedule-live-card__next-time">${endDisplay}</span></div>
							<p class="schedule-live-card__next-title">Завершение занятий</p>
							<p class="schedule-live-card__next-meta">Последний урок на сегодня</p>
						</div>
					`}
				`;
				return;
			}

			if (i + 1 < parsedBells.length) {
				const nextItem = parsedBells[i + 1];
				if (nowSec >= item.endSec && nowSec < nextItem.startSec) {
					const gapStart = item.endSec;
					const gapEnd = nextItem.startSec;
					const gapDur = gapEnd - gapStart;
					const remSec = gapEnd - nowSec;
					const progressPct = Math.min(100, Math.max(0, ((nowSec - gapStart) / gapDur) * 100));
					const durMin = Math.round(gapDur / 60);
					const nextInfo = getLessonInfo(nextItem);
					const startDisplay = item.time.split(/[–—\-]/)[1].trim();
					const endDisplay = nextItem.time.split(/[–—\-]/)[0].trim();

					const metaParts = [];
					if (classLabel) metaParts.push(`<span class="schedule-live-card__meta-tag">${escapeHtml(classLabel)}</span>`);
					metaParts.push(`<span>${escapeHtml(startDisplay)} – ${escapeHtml(endDisplay)}</span>`);

					widgetEl.className = "schedule-live-card schedule-live-card--break";
					widgetEl.innerHTML = `
						<div class="schedule-live-card__main">
							<div class="schedule-live-card__header">
								<span class="schedule-live-pill"><span class="schedule-live-pulser"></span>Перемена (${durMin} мин)</span>
								<div class="schedule-live-timer"><span>До звонка на урок:</span><span class="schedule-live-timer__digits">${formatLiveRemaining(remSec)}</span></div>
							</div>
							<div class="schedule-live-title-row">
								<h3 class="schedule-live-card__title">Перемена между уроками</h3>
								<div class="schedule-live-card__meta">${metaParts.join("")}</div>
							</div>
							<div class="schedule-live-progress">
								<div class="schedule-live-progress__track"><div class="schedule-live-progress__fill" style="width: ${progressPct.toFixed(1)}%;"></div></div>
								<div class="schedule-live-progress__labels"><span>${startDisplay}</span><span>Звонок через ${Math.ceil(remSec / 60)} мин</span><span>${endDisplay}</span></div>
							</div>
						</div>
						<div class="schedule-live-card__next">
							<div class="schedule-live-card__next-label"><span>Следующий: ${escapeHtml(nextItem.title)}</span><span class="schedule-live-card__next-time">${endDisplay}</span></div>
							<p class="schedule-live-card__next-title">${escapeHtml(nextInfo ? nextInfo.subject : nextItem.title)}</p>
							<p class="schedule-live-card__next-meta">${[nextInfo?.room, nextInfo?.teacher].filter(Boolean).map(escapeHtml).join(" • ") || "Приготовьте тетради"}</p>
						</div>
					`;
					return;
				}
			}
		}
	}

	async function ensureClassLessonsLoaded(classId) {
		if (!classId || lessonsCache.has(classId)) return;

		state.loadingLessons = true;
		state.errorMessage = "";
		renderLessons();

		try {
			const response = await fetch(`${SCHEDULE_API_URL}/?class_id=${classId}`);
			if (!response.ok) {
				throw new Error(`Ошибка сервера (${response.status})`);
			}
			const data = await response.json();
			lessonsCache.set(classId, Array.isArray(data) ? data : []);
		} catch (error) {
			console.warn("Backend API недоступен, загружаем уроки класса из локального резерва:", error);
			const fallbackLessons = window.FALLBACK_LESSONS_BY_CLASS?.[classId]
				|| window.FALLBACK_LESSONS_BY_CLASS?.[String(classId)];
			if (Array.isArray(fallbackLessons)) {
				lessonsCache.set(classId, fallbackLessons);
			} else {
				console.error(error);
				state.errorMessage = "Не удалось загрузить расписание уроков. Попробуйте обновить страницу.";
			}
		} finally {
			state.loadingLessons = false;
		}
	}

	async function initSchedule() {
		state.loadingClasses = true;
		state.errorMessage = "";
		lessonsCache.clear();
		renderClassTabs();
		renderBells();
		renderLessons();

		try {
			const response = await fetch(`${SCHEDULE_API_URL}/classes`);
			if (!response.ok) {
				throw new Error(`Ошибка сервера (${response.status})`);
			}
			allClasses = await response.json();

			const currentBuildingClasses = getClassesForBuilding(state.building);
			if (!currentBuildingClasses.length && allClasses.length) {
				state.building = allClasses[0].building;
			}
			renderCampusCardsState();
		} catch (error) {
			console.warn("Backend API недоступен, загружаем классы из локального резерва:", error);
			allClasses = Array.isArray(window.FALLBACK_CLASSES) ? window.FALLBACK_CLASSES : [];
			if (allClasses.length > 0) {
				const currentBuildingClasses = getClassesForBuilding(state.building);
				if (!currentBuildingClasses.length && allClasses.length) {
					state.building = allClasses[0].building;
				}
				renderCampusCardsState();
			} else {
				console.error(error);
				allClasses = [];
				state.errorMessage = "Не удалось загрузить список классов и расписание.";
			}
		} finally {
			state.loadingClasses = false;
		}

		renderClassTabs();
		if (state.classId) {
			await ensureClassLessonsLoaded(state.classId);
		}
		renderDayTabs();
		renderSchedule();
	}

	campusCards.forEach(card => {
		card.addEventListener("click", async () => {
			const building = card.dataset.building;
			if (!building) return;
			state.building = building;
			state.errorMessage = "";
			renderCampusCardsState();
			renderClassTabs();
			if (state.classId) {
				await ensureClassLessonsLoaded(state.classId);
			}
			renderDayTabs();
			renderSchedule();
		});
	});

	initSchedule();
	setInterval(updateScheduleLiveWidget, 1000);
});
