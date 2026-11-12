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
			console.error(error);
			state.errorMessage = "Не удалось загрузить расписание уроков. Попробуйте обновить страницу.";
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
			console.error(error);
			allClasses = [];
			state.errorMessage = "Не удалось загрузить список классов и расписание.";
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
});
