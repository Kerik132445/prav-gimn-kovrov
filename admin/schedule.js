(() => {
	const SCHEDULE_API_URL = `${window.API_BASE_URL}/api/schedule`;
	const TEACHERS_API_URL = `${window.API_BASE_URL}/api/teachers/`;

	const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"];
	const DAY_LABELS = {
		mon: "Понедельник",
		tue: "Вторник",
		wed: "Среда",
		thu: "Четверг",
		fri: "Пятница",
		sat: "Суббота"
	};

	const BUILDING_LABELS = {
		spassky: "Спасский корпус (1–4)",
		pokrovsky: "Покровский корпус (5–11)"
	};

	const BELL_DEFAULTS = {
		regular: {
			1: ["08:20", "09:00"],
			2: ["09:10", "09:50"],
			3: ["10:00", "10:40"],
			4: ["10:50", "11:30"],
			5: ["11:45", "12:25"],
			6: ["12:40", "13:20"],
			7: ["13:30", "14:10"],
			8: ["14:20", "15:00"]
		},
		thu: {
			1: ["08:30", "09:10"],
			2: ["09:20", "10:00"],
			3: ["10:10", "10:50"],
			4: ["11:00", "11:40"],
			5: ["11:55", "12:35"],
			6: ["13:15", "13:55"],
			7: ["14:05", "14:45"],
			8: ["14:50", "15:30"]
		},
		sat: {
			1: ["08:20", "09:00"],
			2: ["09:10", "09:50"],
			3: ["10:00", "10:40"],
			4: ["10:50", "11:30"],
			5: ["11:40", "12:20"],
			6: ["12:30", "13:10"],
			7: ["13:20", "14:00"]
		}
	};

	const tabCountBadge = document.getElementById("schedule-tab-count");
	const classSelect = document.getElementById("schedule-class-select");
	const classBuildingBadge = document.getElementById("schedule-class-building-badge");
	const dayTabsContainer = document.getElementById("schedule-day-tabs");
	const lessonsListContainer = document.getElementById("schedule-lessons-list");

	const createClassButton = document.getElementById("create-class-button");
	const createLessonButton = document.getElementById("create-lesson-button");
	const openCopyDayButton = document.getElementById("open-copy-day-button");
	const openCopyClassButton = document.getElementById("open-copy-class-button");
	const clearDayButton = document.getElementById("clear-day-button");
	const clearClassButton = document.getElementById("clear-class-button");
	const deleteClassButton = document.getElementById("delete-class-button");

	// Class modal
	const classModal = document.getElementById("class-modal");
	const classModalOverlay = document.getElementById("class-modal-overlay");
	const classModalClose = document.getElementById("class-modal-close");
	const classCancelButton = document.getElementById("class-cancel-button");
	const classForm = document.getElementById("class-form");
	const classNameInput = document.getElementById("class-name-input");
	const classBuildingSelect = document.getElementById("class-building-select");
	const classFormError = document.getElementById("class-form-error");
	const classSaveButton = document.getElementById("class-save-button");

	// Lesson modal
	const lessonModal = document.getElementById("lesson-modal");
	const lessonModalOverlay = document.getElementById("lesson-modal-overlay");
	const lessonModalClose = document.getElementById("lesson-modal-close");
	const lessonCancelButton = document.getElementById("lesson-cancel-button");
	const lessonModalTitle = document.getElementById("lesson-modal-title");
	const lessonForm = document.getElementById("lesson-form");
	const lessonIdInput = document.getElementById("lesson-id");
	const lessonClassSelect = document.getElementById("lesson-class-select");
	const lessonDaySelect = document.getElementById("lesson-day-select");
	const lessonNumberInput = document.getElementById("lesson-number-input");
	const lessonSubjectInput = document.getElementById("lesson-subject-input");
	const lessonStartInput = document.getElementById("lesson-start-time");
	const lessonEndInput = document.getElementById("lesson-end-time");
	const lessonRoomInput = document.getElementById("lesson-room-input");
	const lessonTeacherSelect = document.getElementById("lesson-teacher-select");
	const lessonFormError = document.getElementById("lesson-form-error");
	const lessonSaveButton = document.getElementById("lesson-save-button");
	const lessonSaveNextButton = document.getElementById("lesson-save-next-button");

	// Copy day modal
	const copyDayModal = document.getElementById("copy-day-modal");
	const copyDayModalOverlay = document.getElementById("copy-day-modal-overlay");
	const copyDayModalClose = document.getElementById("copy-day-modal-close");
	const copyDayCancelButton = document.getElementById("copy-day-cancel-button");
	const copyDayForm = document.getElementById("copy-day-form");
	const copyDaySourceClass = document.getElementById("copy-day-source-class");
	const copyDaySourceDay = document.getElementById("copy-day-source-day");
	const copyDayTargetClass = document.getElementById("copy-day-target-class");
	const copyDayTargetDay = document.getElementById("copy-day-target-day");
	const copyDayIncludeTeachers = document.getElementById("copy-day-include-teachers");
	const copyDayOverwrite = document.getElementById("copy-day-overwrite");
	const copyDayError = document.getElementById("copy-day-error");
	const copyDaySubmitButton = document.getElementById("copy-day-submit-button");

	// Copy class modal
	const copyClassModal = document.getElementById("copy-class-modal");
	const copyClassModalOverlay = document.getElementById("copy-class-modal-overlay");
	const copyClassModalClose = document.getElementById("copy-class-modal-close");
	const copyClassCancelButton = document.getElementById("copy-class-cancel-button");
	const copyClassForm = document.getElementById("copy-class-form");
	const copyClassSource = document.getElementById("copy-class-source");
	const copyClassTarget = document.getElementById("copy-class-target");
	const copyClassIncludeTeachers = document.getElementById("copy-class-include-teachers");
	const copyClassOverwrite = document.getElementById("copy-class-overwrite");
	const copyClassError = document.getElementById("copy-class-error");
	const copyClassSubmitButton = document.getElementById("copy-class-submit-button");

	let classes = [];
	let lessons = [];
	let teachers = [];
	let selectedClassId = null;
	let selectedDay = "mon";
	let isTimeManuallyEdited = false;

	function escapeText(value) {
		return window.AdminApp.escapeHtml(value);
	}

	function showBannerError(bannerEl, message) {
		if (!bannerEl) return;
		if (!message) {
			bannerEl.hidden = true;
			bannerEl.textContent = "";
			return;
		}
		bannerEl.textContent = message;
		bannerEl.hidden = false;
	}

	function getDefaultTimesForSlot(dayCode, lessonNum) {
		const key = dayCode === "thu" ? "thu" : dayCode === "sat" ? "sat" : "regular";
		const preset = BELL_DEFAULTS[key][lessonNum];
		if (preset) return preset;
		return ["08:20", "09:00"];
	}

	function formatClassLabel(cls) {
		return `${cls.name} класс (${cls.lessons_count} ур.)`;
	}

	function formatTeacherOption(teacher) {
		const fullName = [teacher.last_name, teacher.first_name, teacher.middle_name].filter(Boolean).join(" ");
		return teacher.position ? `${fullName} — ${teacher.position}` : fullName;
	}

	function syncTeachersSelect(list) {
		teachers = Array.isArray(list) ? list : [];
		if (!lessonTeacherSelect) return;
		const currentVal = lessonTeacherSelect.value;
		const optionsHtml = [
			`<option value="">Не указан</option>`,
			...teachers.map(t => `<option value="${t.id}">${escapeText(formatTeacherOption(t))}</option>`)
		];
		lessonTeacherSelect.innerHTML = optionsHtml.join("");
		if (currentVal && teachers.some(t => String(t.id) === String(currentVal))) {
			lessonTeacherSelect.value = currentVal;
		}
	}

	function populateClassSelects() {
		const options = classes.map(cls => (
			`<option value="${cls.id}">${escapeText(formatClassLabel(cls))}</option>`
		)).join("");

		if (classSelect) {
			classSelect.innerHTML = classes.length
				? options
				: `<option value="">Нет классов</option>`;
			if (selectedClassId && classes.some(c => c.id === selectedClassId)) {
				classSelect.value = String(selectedClassId);
			} else if (classes.length) {
				selectedClassId = classes[0].id;
				classSelect.value = String(selectedClassId);
			} else {
				selectedClassId = null;
			}
		}

		const simpleOptions = classes.map(cls => (
			`<option value="${cls.id}">${escapeText(cls.name)} класс</option>`
		)).join("");

		[lessonClassSelect, copyDaySourceClass, copyDayTargetClass, copyClassSource, copyClassTarget].forEach(sel => {
			if (!sel) return;
			const prev = sel.value;
			sel.innerHTML = simpleOptions;
			if (prev && classes.some(c => String(c.id) === String(prev))) {
				sel.value = prev;
			}
		});

		updateControlsState();
	}

	function updateControlsState() {
		const activeClass = classes.find(c => c.id === selectedClassId) || null;
		if (classBuildingBadge) {
			if (activeClass) {
				classBuildingBadge.textContent = BUILDING_LABELS[activeClass.building] || activeClass.building;
				classBuildingBadge.hidden = false;
			} else {
				classBuildingBadge.hidden = true;
			}
		}

		const hasClass = Boolean(activeClass);
		if (createLessonButton) createLessonButton.disabled = !hasClass;
		if (openCopyDayButton) openCopyDayButton.disabled = !hasClass;
		if (openCopyClassButton) openCopyClassButton.disabled = classes.length < 2;
		if (clearDayButton) clearDayButton.disabled = !hasClass || selectedDay === "all";
		if (clearClassButton) clearClassButton.disabled = !hasClass;
		if (deleteClassButton) deleteClassButton.disabled = !hasClass;
	}

	async function loadClasses({ preserveSelection = true } = {}) {
		const response = await fetch(`${SCHEDULE_API_URL}/classes`);
		if (!response.ok) {
			throw new Error(`Не удалось загрузить классы: ${response.status}`);
		}
		classes = await response.json();
		if (tabCountBadge) {
			tabCountBadge.textContent = String(classes.length);
		}
		if (!preserveSelection || !classes.some(c => c.id === selectedClassId)) {
			selectedClassId = classes.length ? classes[0].id : null;
		}
		populateClassSelects();
	}

	async function loadLessonsForSelectedClass() {
		if (!selectedClassId) {
			lessons = [];
			renderLessons();
			return;
		}
		const response = await fetch(`${SCHEDULE_API_URL}/?class_id=${selectedClassId}`);
		if (!response.ok) {
			throw new Error(`Не удалось загрузить расписание: ${response.status}`);
		}
		lessons = await response.json();
		renderLessons();
	}

	async function refreshAll({ preserveSelection = true } = {}) {
		await loadClasses({ preserveSelection });
		await loadLessonsForSelectedClass();
	}

	function renderLessonCard(lesson, { index, total, showReorder }) {
		const metaParts = [];
		if (lesson.room) metaParts.push(`Кабинет: ${escapeText(lesson.room)}`);
		if (lesson.teacher_name) metaParts.push(`Преподаватель: ${escapeText(lesson.teacher_name)}`);
		const metaHtml = metaParts.length
			? `<p class="schedule-admin-card__meta">${metaParts.join(" · ")}</p>`
			: `<p class="schedule-admin-card__meta schedule-admin-card__meta--muted">Кабинет и преподаватель не указаны</p>`;

		const reorderButtons = showReorder
			? `
				<button
					type="button"
					class="admin-button teacher-order-btn"
					data-move-lesson="up"
					data-lesson-id="${lesson.id}"
					title="Поменять местами с предыдущим уроком"
					${index === 0 ? "disabled" : ""}
				>↑</button>
				<button
					type="button"
					class="admin-button teacher-order-btn"
					data-move-lesson="down"
					data-lesson-id="${lesson.id}"
					title="Поменять местами со следующим уроком"
					${index === total - 1 ? "disabled" : ""}
				>↓</button>
			`
			: "";

		return `
			<article class="schedule-admin-card" data-lesson-id="${lesson.id}">
				<div class="schedule-admin-card__main">
					<div class="schedule-admin-card__slot">
						<span class="schedule-admin-card__number">${lesson.lesson_number} урок</span>
						<span class="schedule-admin-card__time">${escapeText(lesson.start_time)} – ${escapeText(lesson.end_time)}</span>
					</div>
					<div class="schedule-admin-card__info">
						<h3 class="schedule-admin-card__subject">${escapeText(lesson.subject)}</h3>
						${metaHtml}
					</div>
				</div>
				<div class="schedule-admin-card__actions">
					${reorderButtons}
					<button type="button" class="admin-button" data-edit-lesson="${lesson.id}">Редактировать</button>
					<button type="button" class="admin-button news-card__delete" data-delete-lesson="${lesson.id}">Удалить</button>
				</div>
			</article>
		`;
	}

	function renderLessons() {
		if (!lessonsListContainer) return;

		if (!selectedClassId) {
			lessonsListContainer.innerHTML = `
				<div class="admin-empty">
					Классов пока нет. Нажмите «+ Добавить класс», чтобы создать первый класс.
				</div>
			`;
			return;
		}

		if (selectedDay === "all") {
			const groupedHtml = DAY_ORDER.map(dayCode => {
				const dayLessons = lessons
					.filter(item => item.day_of_week === dayCode)
					.sort((a, b) => a.lesson_number - b.lesson_number || a.start_time.localeCompare(b.start_time));
				const innerHtml = dayLessons.length
					? dayLessons.map((item, idx) => renderLessonCard(item, {
						index: idx,
						total: dayLessons.length,
						showReorder: false
					})).join("")
					: `<p class="schedule-week-group__empty">Занятий нет</p>`;

				return `
					<div class="schedule-week-group">
						<div class="schedule-week-group__header">
							<h3>${DAY_LABELS[dayCode]}</h3>
							<span class="teacher-badge">${dayLessons.length} ур.</span>
						</div>
						<div class="schedule-week-group__list">
							${innerHtml}
						</div>
					</div>
				`;
			}).join("");

			lessonsListContainer.innerHTML = groupedHtml;
			return;
		}

		const dayLessons = lessons
			.filter(item => item.day_of_week === selectedDay)
			.sort((a, b) => a.lesson_number - b.lesson_number || a.start_time.localeCompare(b.start_time));

		if (!dayLessons.length) {
			lessonsListContainer.innerHTML = `
				<div class="admin-empty">
					<p>На ${escapeText(DAY_LABELS[selectedDay] || selectedDay)} для этого класса уроков пока нет.</p>
					<button type="button" class="admin-button admin-button--primary" id="empty-add-lesson-button">
						+ Добавить первый урок
					</button>
				</div>
			`;
			return;
		}

		lessonsListContainer.innerHTML = dayLessons.map((item, idx) => renderLessonCard(item, {
			index: idx,
			total: dayLessons.length,
			showReorder: true
		})).join("");
	}

	function openModal(modalEl) {
		if (!modalEl) return;
		modalEl.classList.add("modal--active");
		document.body.style.overflow = "hidden";
	}

	function closeModal(modalEl) {
		if (!modalEl) return;
		modalEl.classList.remove("modal--active");
		document.body.style.overflow = "";
	}

	function openClassModal() {
		classForm.reset();
		showBannerError(classFormError, "");
		if (classSaveButton) classSaveButton.disabled = false;
		openModal(classModal);
		setTimeout(() => classNameInput?.focus(), 50);
	}

	function prepareCreateLessonDefaults(targetClassId, targetDay) {
		const classIdNum = Number(targetClassId);
		const dayLessons = lessons.filter(
			l => l.class_id === classIdNum && l.day_of_week === targetDay
		);
		const maxNum = dayLessons.reduce((acc, item) => Math.max(acc, item.lesson_number), 0);
		const nextNum = Math.min(20, maxNum + 1);
		const [defaultStart, defaultEnd] = getDefaultTimesForSlot(targetDay, nextNum);

		lessonNumberInput.value = String(nextNum);
		lessonStartInput.value = defaultStart;
		lessonEndInput.value = defaultEnd;
		isTimeManuallyEdited = false;
	}

	function openCreateLessonModal() {
		if (!selectedClassId) return;
		lessonForm.reset();
		lessonIdInput.value = "";
		showBannerError(lessonFormError, "");

		const initialDay = selectedDay === "all" ? "mon" : selectedDay;
		lessonClassSelect.value = String(selectedClassId);
		lessonDaySelect.value = initialDay;
		lessonTeacherSelect.value = "";

		prepareCreateLessonDefaults(selectedClassId, initialDay);

		lessonModalTitle.textContent = "Добавление урока";
		lessonSaveButton.textContent = "Добавить урок";
		lessonSaveButton.disabled = false;
		lessonSaveNextButton.disabled = false;
		lessonSaveNextButton.hidden = false;
		openModal(lessonModal);
		setTimeout(() => lessonSubjectInput?.focus(), 50);
	}

	function openEditLessonModal(lessonId) {
		const lesson = lessons.find(l => l.id === lessonId);
		if (!lesson) return;

		lessonForm.reset();
		showBannerError(lessonFormError, "");

		lessonIdInput.value = String(lesson.id);
		lessonClassSelect.value = String(lesson.class_id);
		lessonDaySelect.value = lesson.day_of_week;
		lessonNumberInput.value = String(lesson.lesson_number);
		lessonSubjectInput.value = lesson.subject;
		lessonStartInput.value = lesson.start_time;
		lessonEndInput.value = lesson.end_time;
		lessonRoomInput.value = lesson.room || "";
		lessonTeacherSelect.value = lesson.teacher_id ? String(lesson.teacher_id) : "";
		isTimeManuallyEdited = true;

		lessonModalTitle.textContent = "Редактирование урока";
		lessonSaveButton.textContent = "Сохранить изменения";
		lessonSaveButton.disabled = false;
		lessonSaveNextButton.disabled = false;
		lessonSaveNextButton.hidden = true;
		openModal(lessonModal);
	}

	function openCopyDayModal() {
		if (!selectedClassId) return;
		copyDayForm.reset();
		showBannerError(copyDayError, "");
		if (copyDaySubmitButton) copyDaySubmitButton.disabled = false;

		const sourceDay = selectedDay === "all" ? "mon" : selectedDay;
		const nextDayIdx = (DAY_ORDER.indexOf(sourceDay) + 1) % DAY_ORDER.length;

		copyDaySourceClass.value = String(selectedClassId);
		copyDaySourceDay.value = sourceDay;
		copyDayTargetClass.value = String(selectedClassId);
		copyDayTargetDay.value = DAY_ORDER[nextDayIdx];
		copyDayIncludeTeachers.checked = true;
		copyDayOverwrite.checked = false;

		openModal(copyDayModal);
	}

	function openCopyClassModal() {
		if (classes.length < 2) return;
		copyClassForm.reset();
		showBannerError(copyClassError, "");
		if (copyClassSubmitButton) copyClassSubmitButton.disabled = false;

		copyClassSource.value = String(selectedClassId || classes[0].id);
		const other = classes.find(c => String(c.id) !== String(copyClassSource.value));
		if (other) copyClassTarget.value = String(other.id);

		copyClassIncludeTeachers.checked = false;
		copyClassOverwrite.checked = false;
		openModal(copyClassModal);
	}

	async function handleSaveLesson({ addNext = false } = {}) {
		showBannerError(lessonFormError, "");

		const editId = lessonIdInput.value;
		const classId = Number(lessonClassSelect.value);
		const dayOfWeek = lessonDaySelect.value;
		const lessonNumber = Number(lessonNumberInput.value);
		const subject = lessonSubjectInput.value.trim();
		const startTime = lessonStartInput.value.trim();
		const endTime = lessonEndInput.value.trim();
		const room = lessonRoomInput.value.trim();
		const teacherRaw = lessonTeacherSelect.value;

		if (!classId || !dayOfWeek || !subject || !startTime || !endTime) {
			showBannerError(lessonFormError, "Заполните обязательные поля: класс, день, номер урока, предмет и время.");
			return;
		}
		if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 20) {
			showBannerError(lessonFormError, "Номер урока должен быть целым числом от 1 до 20.");
			return;
		}
		if (endTime <= startTime) {
			showBannerError(lessonFormError, "Время окончания урока должно быть позже времени начала.");
			return;
		}

		const payload = {
			class_id: classId,
			day_of_week: dayOfWeek,
			lesson_number: lessonNumber,
			subject,
			start_time: startTime,
			end_time: endTime,
			room: room || null,
			teacher_id: teacherRaw ? Number(teacherRaw) : null,
			period: "main",
			sort_order: lessonNumber
		};

		lessonSaveButton.disabled = true;
		lessonSaveNextButton.disabled = true;

		try {
			const url = editId
				? `${SCHEDULE_API_URL}/lessons/${editId}`
				: `${SCHEDULE_API_URL}/lessons`;

			const response = await window.AdminApp.apiFetch(url, {
				method: editId ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}

			selectedClassId = classId;
			if (selectedDay !== "all") {
				selectedDay = dayOfWeek;
				dayTabsContainer?.querySelectorAll("[data-schedule-day]").forEach(btn => {
					btn.classList.toggle("schedule-day-tab--active", btn.dataset.scheduleDay === selectedDay);
				});
			}

			await refreshAll({ preserveSelection: true });

			if (addNext && !editId) {
				lessonSubjectInput.value = "";
				lessonRoomInput.value = "";
				lessonTeacherSelect.value = "";
				prepareCreateLessonDefaults(classId, dayOfWeek);
				lessonSubjectInput.focus();
			} else {
				closeModal(lessonModal);
			}
		} catch (error) {
			showBannerError(lessonFormError, error.message || "Не удалось сохранить урок.");
		} finally {
			lessonSaveButton.disabled = false;
			lessonSaveNextButton.disabled = false;
		}
	}

	async function deleteLesson(lessonId) {
		const lesson = lessons.find(l => l.id === lessonId);
		const label = lesson
			? `${lesson.lesson_number} урок — ${lesson.subject} (${lesson.start_time}–${lesson.end_time})`
			: `#${lessonId}`;
		if (!confirm(`Удалить урок «${label}» из расписания?`)) {
			return;
		}
		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/lessons/${lessonId}`, {
				method: "DELETE"
			});
			if (!response.ok) {
				const err = await response.json().catch(() => null);
				throw new Error(err?.detail || "Не удалось удалить урок");
			}
			await refreshAll({ preserveSelection: true });
		} catch (error) {
			alert(error.message || "Не удалось удалить урок.");
		}
	}

	async function moveLesson(lessonId, direction) {
		const dayLessons = lessons
			.filter(l => l.day_of_week === selectedDay)
			.sort((a, b) => a.lesson_number - b.lesson_number || a.start_time.localeCompare(b.start_time));

		const idx = dayLessons.findIndex(l => l.id === lessonId);
		if (idx === -1) return;
		const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
		if (neighborIdx < 0 || neighborIdx >= dayLessons.length) return;

		const current = dayLessons[idx];
		const neighbor = dayLessons[neighborIdx];

		// Swap lesson numbers and time slots while keeping subjects/teachers/rooms attached to each lesson
		const payload = {
			items: [
				{
					id: current.id,
					lesson_number: neighbor.lesson_number,
					start_time: neighbor.start_time,
					end_time: neighbor.end_time,
					sort_order: neighbor.lesson_number
				},
				{
					id: neighbor.id,
					lesson_number: current.lesson_number,
					start_time: current.start_time,
					end_time: current.end_time,
					sort_order: current.lesson_number
				}
			]
		};

		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/reorder`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось изменить порядок уроков");
			}
			await loadLessonsForSelectedClass();
		} catch (error) {
			alert(error.message || "Не удалось изменить порядок уроков.");
		}
	}

	async function handleClear(dayOnly) {
		const activeClass = classes.find(c => c.id === selectedClassId);
		if (!activeClass) return;

		const msg = dayOnly
			? `Очистить расписание ${activeClass.name} класса на ${DAY_LABELS[selectedDay]}?`
			: `Полностью очистить ВСЁ расписание ${activeClass.name} класса? Сам класс останется в списке.`;

		if (!confirm(msg)) return;

		const params = new URLSearchParams({ class_id: String(activeClass.id), period: "main" });
		if (dayOnly) params.set("day_of_week", selectedDay);

		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/clear?${params.toString()}`, {
				method: "DELETE"
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось очистить расписание");
			}
			await refreshAll({ preserveSelection: true });
		} catch (error) {
			alert(error.message || "Не удалось очистить расписание.");
		}
	}

	async function handleDeleteClass() {
		const activeClass = classes.find(c => c.id === selectedClassId);
		if (!activeClass) return;

		if (!confirm(`Удалить ${activeClass.name} класс и все его уроки (${activeClass.lessons_count} шт.)?`)) {
			return;
		}

		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/classes/${activeClass.id}`, {
				method: "DELETE"
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || "Не удалось удалить класс");
			}
			await refreshAll({ preserveSelection: false });
		} catch (error) {
			alert(error.message || "Не удалось удалить класс.");
		}
	}

	// Event listeners
	classSelect?.addEventListener("change", async () => {
		selectedClassId = classSelect.value ? Number(classSelect.value) : null;
		updateControlsState();
		await loadLessonsForSelectedClass();
	});

	dayTabsContainer?.addEventListener("click", (event) => {
		const btn = event.target.closest("[data-schedule-day]");
		if (!btn) return;
		selectedDay = btn.dataset.scheduleDay || "mon";
		dayTabsContainer.querySelectorAll("[data-schedule-day]").forEach(el => {
			el.classList.toggle("schedule-day-tab--active", el === btn);
		});
		updateControlsState();
		renderLessons();
	});

	lessonsListContainer?.addEventListener("click", (event) => {
		const emptyAddBtn = event.target.closest("#empty-add-lesson-button");
		if (emptyAddBtn) {
			openCreateLessonModal();
			return;
		}
		const editBtn = event.target.closest("[data-edit-lesson]");
		if (editBtn) {
			openEditLessonModal(Number(editBtn.dataset.editLesson));
			return;
		}
		const delBtn = event.target.closest("[data-delete-lesson]");
		if (delBtn) {
			deleteLesson(Number(delBtn.dataset.deleteLesson));
			return;
		}
		const moveBtn = event.target.closest("[data-move-lesson]");
		if (moveBtn && !moveBtn.disabled) {
			moveLesson(Number(moveBtn.dataset.lessonId), moveBtn.dataset.moveLesson);
		}
	});

	createClassButton?.addEventListener("click", openClassModal);
	classModalClose?.addEventListener("click", () => closeModal(classModal));
	classCancelButton?.addEventListener("click", () => closeModal(classModal));
	classModalOverlay?.addEventListener("click", () => closeModal(classModal));

	classForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		showBannerError(classFormError, "");
		const name = classNameInput.value.trim();
		const building = classBuildingSelect.value || null;
		if (!name) {
			showBannerError(classFormError, "Введите название класса (например: 5А).");
			return;
		}

		classSaveButton.disabled = true;
		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/classes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, building })
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}
			selectedClassId = data.id;
			await refreshAll({ preserveSelection: true });
			closeModal(classModal);
		} catch (error) {
			showBannerError(classFormError, error.message || "Не удалось создать класс.");
		} finally {
			classSaveButton.disabled = false;
		}
	});

	createLessonButton?.addEventListener("click", openCreateLessonModal);
	lessonModalClose?.addEventListener("click", () => closeModal(lessonModal));
	lessonCancelButton?.addEventListener("click", () => closeModal(lessonModal));
	lessonModalOverlay?.addEventListener("click", () => closeModal(lessonModal));

	lessonStartInput?.addEventListener("input", () => { isTimeManuallyEdited = true; });
	lessonEndInput?.addEventListener("input", () => { isTimeManuallyEdited = true; });
	lessonNumberInput?.addEventListener("input", () => {
		if (!lessonIdInput.value && !isTimeManuallyEdited) {
			const num = Number(lessonNumberInput.value);
			if (Number.isInteger(num) && num >= 1) {
				const [s, e] = getDefaultTimesForSlot(lessonDaySelect.value, num);
				lessonStartInput.value = s;
				lessonEndInput.value = e;
			}
		}
	});

	lessonForm?.addEventListener("submit", (event) => {
		event.preventDefault();
		handleSaveLesson({ addNext: false });
	});
	lessonSaveNextButton?.addEventListener("click", () => {
		handleSaveLesson({ addNext: true });
	});

	openCopyDayButton?.addEventListener("click", openCopyDayModal);
	copyDayModalClose?.addEventListener("click", () => closeModal(copyDayModal));
	copyDayCancelButton?.addEventListener("click", () => closeModal(copyDayModal));
	copyDayModalOverlay?.addEventListener("click", () => closeModal(copyDayModal));

	copyDayForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		showBannerError(copyDayError, "");
		copyDaySubmitButton.disabled = true;

		const payload = {
			source_class_id: Number(copyDaySourceClass.value),
			source_day: copyDaySourceDay.value,
			target_class_id: Number(copyDayTargetClass.value),
			target_day: copyDayTargetDay.value,
			include_teachers: Boolean(copyDayIncludeTeachers.checked),
			overwrite: Boolean(copyDayOverwrite.checked),
			period: "main"
		};

		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/copy-day`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}
			selectedClassId = payload.target_class_id;
			selectedDay = payload.target_day;
			dayTabsContainer?.querySelectorAll("[data-schedule-day]").forEach(btn => {
				btn.classList.toggle("schedule-day-tab--active", btn.dataset.scheduleDay === selectedDay);
			});
			await refreshAll({ preserveSelection: true });
			closeModal(copyDayModal);
		} catch (error) {
			showBannerError(copyDayError, error.message || "Не удалось скопировать расписание дня.");
		} finally {
			copyDaySubmitButton.disabled = false;
		}
	});

	openCopyClassButton?.addEventListener("click", openCopyClassModal);
	copyClassModalClose?.addEventListener("click", () => closeModal(copyClassModal));
	copyClassCancelButton?.addEventListener("click", () => closeModal(copyClassModal));
	copyClassModalOverlay?.addEventListener("click", () => closeModal(copyClassModal));

	copyClassForm?.addEventListener("submit", async (event) => {
		event.preventDefault();
		showBannerError(copyClassError, "");
		copyClassSubmitButton.disabled = true;

		const payload = {
			source_class_id: Number(copyClassSource.value),
			target_class_id: Number(copyClassTarget.value),
			include_teachers: Boolean(copyClassIncludeTeachers.checked),
			overwrite: Boolean(copyClassOverwrite.checked),
			period: "main"
		};

		try {
			const response = await window.AdminApp.apiFetch(`${SCHEDULE_API_URL}/copy-class`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await response.json().catch(() => null);
			if (!response.ok) {
				throw new Error(data?.detail || `Ошибка сервера: ${response.status}`);
			}
			selectedClassId = payload.target_class_id;
			await refreshAll({ preserveSelection: true });
			closeModal(copyClassModal);
		} catch (error) {
			showBannerError(copyClassError, error.message || "Не удалось скопировать расписание класса.");
		} finally {
			copyClassSubmitButton.disabled = false;
		}
	});

	clearDayButton?.addEventListener("click", () => handleClear(true));
	clearClassButton?.addEventListener("click", () => handleClear(false));
	deleteClassButton?.addEventListener("click", handleDeleteClass);

	document.addEventListener("keydown", (event) => {
		if (event.key !== "Escape") return;
		[classModal, lessonModal, copyDayModal, copyClassModal].forEach(m => {
			if (m?.classList.contains("modal--active")) closeModal(m);
		});
	});

	window.AdminApp.onTeachersUpdatedCallbacks.push((updatedList) => {
		syncTeachersSelect(updatedList);
	});

	window.initScheduleAdmin = async function initScheduleAdmin() {
		try {
			if (window.AdminApp.teachersCache?.length) {
				syncTeachersSelect(window.AdminApp.teachersCache);
			} else {
				const tResp = await fetch(TEACHERS_API_URL);
				if (tResp.ok) {
					syncTeachersSelect(await tResp.json());
				}
			}
			await refreshAll({ preserveSelection: false });
		} catch (error) {
			console.error(error);
			if (lessonsListContainer) {
				lessonsListContainer.innerHTML = `
					<div class="admin-empty">Не удалось загрузить расписание.</div>
				`;
			}
		}
	};
})();
