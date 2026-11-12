(() => {
	const TEACHERS_API_URL = `${window.API_BASE_URL}/api/teachers/`;
	const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 МБ
	const ALLOWED_MIME_TYPES = new Set([
		"image/jpeg",
		"image/png",
		"image/webp"
	]);
	const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

	const CATEGORY_LABELS = {
		admins: "Администрация",
		start_teachers: "Начальные классы",
		church: "Духовенство и основы веры",
		lang: "Филология и языки",
		accuracy: "Точные и естественные науки",
		naturally: "Общественные науки и история",
		work: "Труд, спорт, искусство",
		other: "Внеурочная деятельность"
	};

	const teachersCountBadge = document.getElementById("teachers-tab-count");
	const teachersList = document.getElementById("teachers-list");
	const searchInput = document.getElementById("teachers-admin-search");
	const categoryFilterSelect = document.getElementById("teachers-admin-category-filter");
	const createTeacherButton = document.getElementById("create-teacher-button");

	const teacherModal = document.getElementById("teacher-modal");
	const teacherModalOverlay = document.getElementById("teacher-modal-overlay");
	const teacherModalClose = document.getElementById("teacher-modal-close");
	const teacherCancelButton = document.getElementById("teacher-cancel-button");
	const teacherModalTitle = document.getElementById("teacher-modal-title");
	const teacherSaveButton = document.getElementById("teacher-save-button");
	const teacherForm = document.getElementById("teacher-form");
	const teacherFormError = document.getElementById("teacher-form-error");

	const teacherIdInput = document.getElementById("teacher-id");
	const lastNameInput = document.getElementById("teacher-last-name");
	const firstNameInput = document.getElementById("teacher-first-name");
	const middleNameInput = document.getElementById("teacher-middle-name");
	const positionInput = document.getElementById("teacher-position");
	const categoryInput = document.getElementById("teacher-category");
	const guidanceInput = document.getElementById("teacher-classroom-guidance");
	const experienceInput = document.getElementById("teacher-experience");
	const qualificationInput = document.getElementById("teacher-qualification");
	const sortOrderInput = document.getElementById("teacher-sort-order");

	const photoLabel = document.getElementById("teacher-photo-label");
	const photoInput = document.getElementById("teacher-photo-input");
	const photoError = document.getElementById("teacher-photo-error");
	const photoPreview = document.getElementById("teacher-photo-preview");
	const photoPreviewImg = document.getElementById("teacher-photo-preview-img");
	const photoCaption = document.getElementById("teacher-photo-caption");
	const photoResetButton = document.getElementById("teacher-photo-reset");

	let teachers = [];
	let currentEditPhotoUrl = "";
	let activePreviewObjectUrl = null;

	function escapeText(value) {
		return window.AdminApp.escapeHtml(value);
	}

	function resolvePhotoUrl(photo) {
		if (!photo) return "";
		if (photo.startsWith("http") || photo.startsWith("blob:") || photo.startsWith("data:")) {
			return photo;
		}
		if (photo.startsWith("/uploads")) {
			return window.AdminApp.getImageUrl(photo);
		}
		if (photo.startsWith("/")) {
			return `..${photo}`;
		}
		return `../${photo}`;
	}

	function formatExperience(years) {
		if (years === null || years === undefined || years === "") return "";
		const n = Math.abs(Number(years));
		if (!Number.isFinite(n)) return "";
		const mod100 = n % 100;
		const mod10 = n % 10;
		let unit = "лет";
		if (mod100 < 11 || mod100 > 14) {
			if (mod10 === 1) unit = "год";
			else if (mod10 >= 2 && mod10 <= 4) unit = "года";
		}
		return `Стаж ${n} ${unit}`;
	}

	function getFullName(teacher) {
		return [teacher.last_name, teacher.first_name, teacher.middle_name]
			.filter(Boolean)
			.join(" ");
	}

	function revokePreviewUrl() {
		if (activePreviewObjectUrl) {
			URL.revokeObjectURL(activePreviewObjectUrl);
			activePreviewObjectUrl = null;
		}
	}

	function showFormError(message) {
		if (!message) {
			teacherFormError.hidden = true;
			teacherFormError.textContent = "";
			return;
		}
		teacherFormError.textContent = message;
		teacherFormError.hidden = false;
	}

	function showPhotoError(message) {
		if (!message) {
			photoError.hidden = true;
			photoError.textContent = "";
			return;
		}
		photoError.textContent = message;
		photoError.hidden = false;
	}

	function renderPhotoPreview() {
		revokePreviewUrl();
		const selectedFile = photoInput.files && photoInput.files[0];

		if (selectedFile) {
			activePreviewObjectUrl = URL.createObjectURL(selectedFile);
			photoPreviewImg.src = activePreviewObjectUrl;
			const sizeMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
			photoCaption.textContent = `Новое фото: ${selectedFile.name} (${sizeMb} МБ)`;
			photoResetButton.hidden = false;
			photoPreview.hidden = false;
			return;
		}

		if (currentEditPhotoUrl) {
			photoPreviewImg.src = resolvePhotoUrl(currentEditPhotoUrl);
			photoCaption.textContent = "Текущая фотография. Выберите файл выше, если нужно заменить.";
			photoResetButton.hidden = true;
			photoPreview.hidden = false;
			return;
		}

		photoPreviewImg.removeAttribute("src");
		photoCaption.textContent = "";
		photoResetButton.hidden = true;
		photoPreview.hidden = true;
	}

	function validatePhotoFile(file) {
		if (!file) return "";
		const mimeOk = file.type ? ALLOWED_MIME_TYPES.has(file.type) : false;
		const extOk = ALLOWED_EXTENSIONS.test(file.name || "");
		if (!mimeOk && !extOk) {
			return "Неподдерживаемый формат файла. Разрешены только JPG, PNG и WEBP.";
		}
		if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
			return "Неподдерживаемый формат файла. Разрешены только JPG, PNG и WEBP.";
		}
		if (file.size <= 0) {
			return "Выбранный файл пустой.";
		}
		if (file.size > MAX_PHOTO_SIZE) {
			return "Размер фотографии превышает 10 МБ.";
		}
		return "";
	}

	async function loadTeachers() {
		try {
			const response = await fetch(TEACHERS_API_URL);
			if (!response.ok) {
				throw new Error(`Ошибка сервера: ${response.status}`);
			}
			teachers = await response.json();
			if (teachersCountBadge) {
				teachersCountBadge.textContent = String(teachers.length);
			}
			if (window.AdminApp?.notifyTeachersUpdated) {
				window.AdminApp.notifyTeachersUpdated(teachers);
			}
			renderTeachers();
		} catch (error) {
			console.error(error);
			teachersList.innerHTML = `
				<div class="admin-empty">
					Не удалось загрузить список учителей.
				</div>
			`;
		}
	}

	function getFilteredTeachers() {
		const query = (searchInput?.value || "").trim().toLowerCase();
		const category = categoryFilterSelect?.value || "all";

		return teachers.filter(teacher => {
			if (category !== "all" && teacher.category !== category) {
				return false;
			}
			if (!query) return true;
			const haystack = [
				getFullName(teacher),
				teacher.position,
				teacher.classroom_guidance,
				teacher.qualification,
				CATEGORY_LABELS[teacher.category] || ""
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return haystack.includes(query);
		});
	}

	function renderTeachers() {
		const filtered = getFilteredTeachers();

		if (!teachers.length) {
			teachersList.innerHTML = `
				<div class="admin-empty">
					Учителей пока нет. Нажмите «+ Добавить учителя», чтобы создать первую запись.
				</div>
			`;
			return;
		}

		if (!filtered.length) {
			teachersList.innerHTML = `
				<div class="admin-empty">
					По вашему запросу преподаватели не найдены.
				</div>
			`;
			return;
		}

		const isUnfiltered = (categoryFilterSelect?.value || "all") === "all" && !(searchInput?.value || "").trim();

		teachersList.innerHTML = filtered.map((teacher, idx) => {
			const fullName = escapeText(getFullName(teacher));
			const photoUrl = escapeText(resolvePhotoUrl(teacher.photo));
			const categoryLabel = escapeText(CATEGORY_LABELS[teacher.category] || teacher.category);
			const position = escapeText(teacher.position);
			const guidanceBadge = teacher.classroom_guidance
				? `<span class="teacher-badge teacher-badge--orange">${escapeText(teacher.classroom_guidance)}</span>`
				: "";
			const expText = formatExperience(teacher.experience_years);
			const expBadge = expText
				? `<span class="teacher-badge teacher-badge--blue">${escapeText(expText)}</span>`
				: "";
			const qualBadge = teacher.qualification
				? `<span class="teacher-badge teacher-badge--light">${escapeText(teacher.qualification)}</span>`
				: "";

			const disableUp = idx === 0 ? "disabled" : "";
			const disableDown = idx === filtered.length - 1 ? "disabled" : "";
			const moveTitle = isUnfiltered
				? "Изменить порядок отображения"
				: "Изменить порядок внутри выбранного фильтра";

			return `
				<article class="teacher-admin-card" data-teacher-id="${teacher.id}">
					<div class="teacher-admin-card__main">
						<img
							src="${photoUrl}"
							alt="${fullName}"
							class="teacher-admin-card__photo"
							loading="lazy"
						>
						<div class="teacher-admin-card__info">
							<div class="teacher-admin-card__top">
								<span class="teacher-admin-card__order" title="Порядок отображения">#${teacher.sort_order}</span>
								<h3 class="teacher-admin-card__name">${fullName}</h3>
							</div>
							<p class="teacher-admin-card__position">${position}</p>
							<div class="teacher-admin-card__badges">
								<span class="teacher-badge">${categoryLabel}</span>
								${guidanceBadge}
								${expBadge}
								${qualBadge}
							</div>
						</div>
					</div>

					<div class="teacher-admin-card__actions">
						<button
							type="button"
							class="admin-button teacher-order-btn"
							data-move-teacher="up"
							data-teacher-id="${teacher.id}"
							title="${moveTitle}"
							${disableUp}
						>↑</button>
						<button
							type="button"
							class="admin-button teacher-order-btn"
							data-move-teacher="down"
							data-teacher-id="${teacher.id}"
							title="${moveTitle}"
							${disableDown}
						>↓</button>
						<button
							type="button"
							class="admin-button"
							data-edit-teacher="${teacher.id}"
						>Редактировать</button>
						<button
							type="button"
							class="admin-button news-card__delete"
							data-delete-teacher="${teacher.id}"
						>Удалить</button>
					</div>
				</article>
			`;
		}).join("");
	}

	teachersList.addEventListener("click", (event) => {
		const editBtn = event.target.closest("[data-edit-teacher]");
		if (editBtn) {
			openEditTeacherModal(Number(editBtn.dataset.editTeacher));
			return;
		}

		const deleteBtn = event.target.closest("[data-delete-teacher]");
		if (deleteBtn) {
			deleteTeacher(Number(deleteBtn.dataset.deleteTeacher));
			return;
		}

		const moveBtn = event.target.closest("[data-move-teacher]");
		if (moveBtn && !moveBtn.disabled) {
			moveTeacher(Number(moveBtn.dataset.teacherId), moveBtn.dataset.moveTeacher);
		}
	});

	searchInput?.addEventListener("input", renderTeachers);
	categoryFilterSelect?.addEventListener("change", renderTeachers);

	function openCreateTeacherModal() {
		teacherForm.reset();
		teacherIdInput.value = "";
		currentEditPhotoUrl = "";
		showFormError("");
		showPhotoError("");

		const maxOrder = teachers.reduce((max, item) => Math.max(max, Number(item.sort_order) || 0), 0);
		sortOrderInput.value = String(maxOrder + 10);

		const currentFilterCategory = categoryFilterSelect?.value;
		if (currentFilterCategory && currentFilterCategory !== "all") {
			categoryInput.value = currentFilterCategory;
		} else {
			categoryInput.value = "start_teachers";
		}

		teacherModalTitle.textContent = "Добавление учителя";
		teacherSaveButton.textContent = "Добавить учителя";
		photoLabel.textContent = "Фотография *";
		renderPhotoPreview();

		teacherModal.classList.add("modal--active");
		document.body.style.overflow = "hidden";
	}

	async function openEditTeacherModal(id) {
		try {
			showFormError("");
			showPhotoError("");

			const response = await fetch(`${TEACHERS_API_URL}${id}`);
			if (!response.ok) {
				throw new Error("Не удалось загрузить данные преподавателя");
			}
			const teacher = await response.json();

			teacherForm.reset();
			teacherIdInput.value = String(teacher.id);
			lastNameInput.value = teacher.last_name || "";
			firstNameInput.value = teacher.first_name || "";
			middleNameInput.value = teacher.middle_name || "";
			positionInput.value = teacher.position || "";
			categoryInput.value = teacher.category || "other";
			guidanceInput.value = teacher.classroom_guidance || "";
			experienceInput.value = teacher.experience_years !== null && teacher.experience_years !== undefined
				? String(teacher.experience_years)
				: "";
			qualificationInput.value = teacher.qualification || "";
			sortOrderInput.value = String(teacher.sort_order ?? 0);

			currentEditPhotoUrl = teacher.photo || "";
			photoInput.value = "";

			teacherModalTitle.textContent = "Редактирование учителя";
			teacherSaveButton.textContent = "Сохранить изменения";
			photoLabel.textContent = "Фотография (выберите файл, чтобы заменить)";
			renderPhotoPreview();

			teacherModal.classList.add("modal--active");
			document.body.style.overflow = "hidden";
		} catch (error) {
			console.error(error);
			alert(error.message || "Не удалось открыть форму редактирования.");
		}
	}

	function closeTeacherModal() {
		teacherModal.classList.remove("modal--active");
		document.body.style.overflow = "";
		revokePreviewUrl();
	}

	photoInput.addEventListener("change", () => {
		const file = photoInput.files && photoInput.files[0];
		if (!file) {
			showPhotoError("");
			renderPhotoPreview();
			return;
		}

		const err = validatePhotoFile(file);
		if (err) {
			showPhotoError(err);
			photoInput.value = "";
			renderPhotoPreview();
			return;
		}

		showPhotoError("");
		showFormError("");
		renderPhotoPreview();
	});

	photoResetButton.addEventListener("click", () => {
		photoInput.value = "";
		showPhotoError("");
		renderPhotoPreview();
	});

	teacherForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		showFormError("");
		showPhotoError("");

		const id = teacherIdInput.value;
		const lastName = lastNameInput.value.trim();
		const firstName = firstNameInput.value.trim();
		const middleName = middleNameInput.value.trim();
		const position = positionInput.value.trim();
		const category = categoryInput.value || "other";
		const guidance = guidanceInput.value.trim();
		const experienceRaw = experienceInput.value.trim();
		const qualification = qualificationInput.value.trim();
		const sortOrderRaw = sortOrderInput.value.trim();

		if (!lastName || !firstName || !middleName || !position) {
			showFormError("Заполните обязательные поля: Фамилия, Имя, Отчество и Должность.");
			return;
		}

		if (experienceRaw !== "") {
			const expNum = Number(experienceRaw);
			if (!Number.isInteger(expNum) || expNum < 0 || expNum > 100) {
				showFormError("Педагогический стаж должен быть целым числом от 0 до 100.");
				return;
			}
		}

		if (sortOrderRaw !== "") {
			const orderNum = Number(sortOrderRaw);
			if (!Number.isInteger(orderNum) || orderNum < 0 || orderNum > 1000000) {
				showFormError("Порядок отображения должен быть целым неотрицательным числом.");
				return;
			}
		}

		const photoFile = photoInput.files && photoInput.files[0];
		if (!id && !photoFile) {
			showPhotoError("Загрузите фотографию преподавателя.");
			showFormError("Для нового преподавателя необходимо выбрать фотографию.");
			return;
		}

		if (photoFile) {
			const fileErr = validatePhotoFile(photoFile);
			if (fileErr) {
				showPhotoError(fileErr);
				return;
			}
		}

		const formData = new FormData();
		formData.append("last_name", lastName);
		formData.append("first_name", firstName);
		formData.append("middle_name", middleName);
		formData.append("position", position);
		formData.append("category", category);
		formData.append("classroom_guidance", guidance);
		formData.append("experience_years", experienceRaw);
		formData.append("qualification", qualification);
		if (sortOrderRaw !== "") {
			formData.append("sort_order", sortOrderRaw);
		}
		if (photoFile) {
			formData.append("photo", photoFile);
		}

		try {
			teacherSaveButton.disabled = true;
			teacherSaveButton.textContent = "Сохранение...";

			const response = await window.AdminApp.apiFetch(
				id ? `${TEACHERS_API_URL}${id}` : TEACHERS_API_URL,
				{
					method: id ? "PUT" : "POST",
					body: formData
				}
			);

			if (!response.ok) {
				const errData = await response.json().catch(() => null);
				throw new Error(errData?.detail || `Ошибка сервера: ${response.status}`);
			}

			closeTeacherModal();
			await loadTeachers();
		} catch (error) {
			console.error(error);
			showFormError(error.message || "Не удалось сохранить данные преподавателя.");
		} finally {
			teacherSaveButton.disabled = false;
			teacherSaveButton.textContent = id ? "Сохранить изменения" : "Добавить учителя";
		}
	});

	async function deleteTeacher(id) {
		const target = teachers.find(item => item.id === id);
		const label = target ? getFullName(target) : `#${id}`;
		const confirmed = confirm(
			`Удалить преподавателя «${label}»?\nЗапись исчезнет с публичной страницы, а загруженная фотография будет удалена, если она больше нигде не используется.`
		);
		if (!confirmed) return;

		try {
			const response = await window.AdminApp.apiFetch(`${TEACHERS_API_URL}${id}`, {
				method: "DELETE"
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => null);
				throw new Error(errData?.detail || `Ошибка сервера: ${response.status}`);
			}

			await loadTeachers();
		} catch (error) {
			console.error(error);
			alert(`Не удалось удалить преподавателя.\n\n${error.message}`);
		}
	}

	async function moveTeacher(id, direction) {
		const filtered = getFilteredTeachers();
		const index = filtered.findIndex(item => item.id === id);
		if (index === -1) return;

		const neighborIndex = direction === "up" ? index - 1 : index + 1;
		if (neighborIndex < 0 || neighborIndex >= filtered.length) return;

		const currentItem = filtered[index];
		const neighborItem = filtered[neighborIndex];

		// If two items share identical sort_order, assign clean sequential orders first so swap is persistent
		let payloadItems;
		if (currentItem.sort_order !== neighborItem.sort_order) {
			payloadItems = [
				{ id: currentItem.id, sort_order: neighborItem.sort_order },
				{ id: neighborItem.id, sort_order: currentItem.sort_order }
			];
		} else {
			const reorderedAll = [...teachers];
			const fullA = reorderedAll.findIndex(item => item.id === currentItem.id);
			const fullB = reorderedAll.findIndex(item => item.id === neighborItem.id);
			[reorderedAll[fullA], reorderedAll[fullB]] = [reorderedAll[fullB], reorderedAll[fullA]];
			payloadItems = reorderedAll.map((item, idx) => ({
				id: item.id,
				sort_order: (idx + 1) * 10
			}));
		}

		try {
			const response = await window.AdminApp.apiFetch(`${TEACHERS_API_URL}reorder`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ items: payloadItems })
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => null);
				throw new Error(errData?.detail || "Не удалось обновить порядок");
			}

			teachers = await response.json();
			renderTeachers();
		} catch (error) {
			console.error(error);
			alert(`Не удалось изменить порядок.\n\n${error.message}`);
		}
	}

	createTeacherButton?.addEventListener("click", openCreateTeacherModal);
	teacherModalClose?.addEventListener("click", closeTeacherModal);
	teacherCancelButton?.addEventListener("click", closeTeacherModal);
	teacherModalOverlay?.addEventListener("click", closeTeacherModal);

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && teacherModal.classList.contains("modal--active")) {
			closeTeacherModal();
		}
	});

	window.initTeachersAdmin = loadTeachers;
})();
