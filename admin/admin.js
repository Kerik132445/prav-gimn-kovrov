let csrfToken = null;


async function loadCsrfToken() {

	const response = await fetch(
		`${AUTH_API_URL}/csrf`,
		{
			credentials: "include"
		}
	);

	if (!response.ok) {

		throw new Error(
			"Не удалось получить CSRF-токен"
		);
	}

	const data = await response.json();

	csrfToken = data.csrf_token;
}


const API_URL =
	`${window.API_BASE_URL}/api/news/`;

const AUTH_API_URL =
	`${window.API_BASE_URL}/api/auth`;


const newsList =
	document.querySelector("#news-list");

const modal =
	document.querySelector("#news-modal");

const modalTitle =
	document.querySelector("#modal-title");

const newsForm =
	document.querySelector("#news-form");

const newsIdInput =
	document.querySelector("#news-id");

const titleInput =
	document.querySelector("#news-title");

const descriptionInput =
	document.querySelector("#news-description");

const categoryInput =
	document.querySelector("#news-category");

const dateInput =
	document.querySelector("#news-date");

const contentInput =
	document.querySelector("#news-content");

const mainImageInput =
	document.querySelector("#news-main-image");

const imagesInput =
	document.querySelector("#news-images");

const imagePreview =
	document.querySelector("#image-preview");

const currentImages =
	document.querySelector("#current-images");

const saveButton =
	document.querySelector("#save-button");

const createButton =
	document.querySelector("#create-news-button");

const closeButton =
	document.querySelector("#modal-close");

const cancelButton =
	document.querySelector("#cancel-button");

const logoutButton =
	document.getElementById("logout-button");


let news = [];


// ========================================
// Проверка авторизации
// ========================================

async function checkAuth() {

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 2500);

	try {

		const response = await fetch(
			`${AUTH_API_URL}/me`,
			{
				method: "GET",
				credentials: "include",
				signal: controller.signal
			}
		);

		clearTimeout(timeoutId);

		if (!response.ok) {

			localStorage.removeItem("admin_session_active");
			window.location.replace("login.html");

			return false;
		}


		const admin =
			await response.json();


		console.log(
			`Авторизован: ${admin.username}`
		);

		localStorage.setItem("admin_session_active", "1");
		document.documentElement.classList.add("auth-ok");

		return true;

	} catch (error) {

		clearTimeout(timeoutId);

		console.error(
			"Ошибка проверки авторизации:",
			error
		);

		localStorage.removeItem("admin_session_active");
		window.location.replace("login.html");

		return false;
	}
}


// ========================================
// Выход
// ========================================

if (logoutButton) {

	logoutButton.addEventListener(
		"click",
		async () => {

			try {

				await apiFetch(
					`${AUTH_API_URL}/logout`,
					{
						method: "POST"
					}
				);

			} finally {

				localStorage.removeItem("admin_session_active");
				window.location.replace("login.html");
			}

		}
	);

}


// ========================================
// Загрузка новостей
// ========================================

async function loadNews() {

	try {

		const response =
			await fetch(API_URL);


		if (!response.ok) {

			throw new Error(
				`Ошибка сервера: ${response.status}`
			);
		}


		news =
			await response.json();


		renderNews();

	} catch (error) {

		console.error(error);


		newsList.innerHTML = `
            <div class="admin-empty">
                Не удалось загрузить новости.
            </div>
        `;
	}
}


// ========================================
// Отображение новостей
// ========================================

function renderNews() {

	if (!news.length) {

		newsList.innerHTML = `
            <div class="admin-empty">
                Новостей пока нет.
            </div>
        `;

		return;
	}


	newsList.innerHTML =
		news.map(item => {

			return `
                <article class="news-card">

                    <div class="news-card__info">

                        <h3 class="news-card__title">
                            ${escapeHtml(item.title)}
                        </h3>

                        <p class="news-card__meta">
                            ${escapeHtml(item.date)}
                            ·
                            ${getCategoryName(item.category)}
                        </p>

                    </div>


                    <div class="news-card__actions">

                        <button
                            class="admin-button"
                            data-edit="${item.id}"
                        >
                            Редактировать
                        </button>


                        <button
                            class="admin-button news-card__delete"
                            data-delete="${item.id}"
                        >
                            Удалить
                        </button>

                    </div>

                </article>
            `;

		}).join("");


	document
		.querySelectorAll("[data-edit]")
		.forEach(button => {

			button.addEventListener(
				"click",
				() => {

					const id =
						Number(
							button.dataset.edit
						);


					openEditModal(id);
				}
			);

		});


	document
		.querySelectorAll("[data-delete]")
		.forEach(button => {

			button.addEventListener(
				"click",
				() => {

					const id =
						Number(
							button.dataset.delete
						);


					deleteNews(id);
				}
			);

		});

}


// ========================================
// Категории
// ========================================

function getCategoryName(category) {
	const categories = {
		education: "Учебная жизнь",
		spiritual: "Духовная жизнь",
		creativity: "Творчество и театр",
		holidays: "Традиции и праздники",
		pilgrimage: "Паломничество и экскурсии",
		sport: "Спорт и ВПК",
		camp: "Лагерь и практика"
	};

	return categories[category] || category;
}


// ========================================
// Безопасный текст
// ========================================

function escapeHtml(text) {

	return String(text ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}


// ========================================
// Открытие создания
// ========================================

function openCreateModal() {

	newsForm.reset();


	newsIdInput.value = "";


	modalTitle.textContent =
		"Создание новости";


	saveButton.textContent =
		"Создать новость";


	currentImages.innerHTML =
		"";


	imagePreview.innerHTML =
		"";


	modal.classList.add(
		"modal--active"
	);


	document.body.style.overflow =
		"hidden";
}


// ========================================
// Открытие редактирования
// ========================================

async function openEditModal(id) {

	try {

		const response =
			await fetch(
				`${API_URL}${id}`
			);


		if (!response.ok) {

			throw new Error(
				"Не удалось загрузить новость"
			);
		}


		const item =
			await response.json();


		newsIdInput.value =
			item.id;


		titleInput.value =
			item.title;


		descriptionInput.value =
			item.description;


		categoryInput.value =
			item.category;


		dateInput.value =
			item.date;


		contentInput.innerHTML =
			item.content || "";


		modalTitle.textContent =
			"Редактирование новости";


		saveButton.textContent =
			"Сохранить изменения";


		mainImageInput.value =
			"";


		imagesInput.value =
			"";


		imagePreview.innerHTML =
			"";


		renderCurrentImages(
			item.images || []
		);


		modal.classList.add(
			"modal--active"
		);


		document.body.style.overflow =
			"hidden";

	} catch (error) {

		console.error(error);


		alert(
			"Не удалось загрузить новость."
		);
	}
}


// ========================================
// Текущие фотографии
// ========================================

function renderCurrentImages(images) {

	currentImages.innerHTML = "";


	if (!images || images.length === 0) {

		currentImages.innerHTML = `
            <p class="form-hint">
                У этой новости пока нет фотографий.
            </p>
        `;

		return;
	}


	const currentMainImage =
		getImageUrl(
			news.find(
				item =>
					item.id ===
					Number(newsIdInput.value)
			)?.image
		);


	images.forEach(image => {

		const imageUrl =
			getImageUrl(image.image);


		const isMain =
			imageUrl === currentMainImage;


		const card =
			document.createElement("div");


		card.className =
			`current-image-card ${isMain
				? "current-image-card--main"
				: ""
			}`;


		card.innerHTML = `

            ${isMain
				? `
                        <div class="current-image-card__main-label">
                            Главная
                        </div>
                    `
				: ""
			}

            <img
                src="${imageUrl}"
                alt="Фотография новости"
                class="current-image-card__image"
            >

            <div class="current-image-card__actions">

                ${isMain
				? `
                            <button
                                type="button"
                                disabled
                            >
                                Главная
                            </button>
                        `
				: `
                            <button
                                type="button"
                                class="set-main-image"
                                data-image-id="${image.id}"
                            >
                                Сделать главной
                            </button>
                        `
			}


                <button
                    type="button"
                    class="delete-image"
                    data-image-id="${image.id}"
                >
                    Удалить
                </button>

            </div>
        `;


		currentImages.appendChild(card);

	});


	currentImages
		.querySelectorAll(".set-main-image")
		.forEach(button => {

			button.addEventListener(
				"click",
				() => {

					setMainImage(
						Number(newsIdInput.value),
						Number(button.dataset.imageId)
					);

				}
			);

		});


	currentImages
		.querySelectorAll(".delete-image")
		.forEach(button => {

			button.addEventListener(
				"click",
				() => {

					deleteImage(
						Number(newsIdInput.value),
						Number(button.dataset.imageId)
					);

				}
			);

		});
}


// ========================================
// URL изображения
// ========================================

function getImageUrl(image) {

	if (!image) {

		return "";
	}


	if (image.startsWith("http")) {

		return image;
	}


	if (image.startsWith("/uploads")) {

		return `${window.API_BASE_URL}${image}`;
	}


	return image;
}


// ========================================
// Предпросмотр новых фотографий
// ========================================

// ========================================
// Предпросмотр новых фотографий
// ========================================

imagesInput.addEventListener(
	"change",
	() => {

		imagePreview.innerHTML = "";


		const files =
			Array.from(imagesInput.files);


		files.forEach(file => {

			const url =
				URL.createObjectURL(file);


			const wrapper =
				document.createElement("div");


			wrapper.className =
				"image-preview__item";


			wrapper.innerHTML = `
				<img
					src="${url}"
					alt="Предпросмотр фотографии"
				>
			`;


			imagePreview.appendChild(
				wrapper
			);


			const image =
				wrapper.querySelector("img");


			image.addEventListener(
				"load",
				() => {
					URL.revokeObjectURL(url);
				},
				{ once: true }
			);

		});

	}
);


// ========================================
// Закрытие модального окна
// ========================================

function closeModal() {

	modal.classList.remove(
		"modal--active"
	);


	document.body.style.overflow =
		"";
}


closeButton.addEventListener(
	"click",
	closeModal
);


cancelButton.addEventListener(
	"click",
	closeModal
);


document
	.querySelector(".modal__overlay")
	.addEventListener(
		"click",
		closeModal
	);


// ========================================
// Создание / редактирование
// ========================================

newsForm.addEventListener(
	"submit",
	async event => {

		event.preventDefault();


		const id =
			newsIdInput.value;


		const newsData = {

			title:
				titleInput.value.trim(),

			description:
				descriptionInput.value.trim(),

			content:
				contentInput.innerHTML,

			category:
				categoryInput.value,

			date:
				dateInput.value.trim(),

			image:
				null
		};


		try {

			saveButton.disabled =
				true;


			saveButton.textContent =
				"Сохранение...";


			let response;


			// ========================================
			// Редактирование
			// ========================================

			if (id) {

				response = await apiFetch(
					`${API_URL}${id}`,
					{
						method: "PUT",

						headers: {
							"Content-Type":
								"application/json"
						},

						body:
							JSON.stringify(newsData)
					}
				);

			}


			// ========================================
			// Создание
			// ========================================

			else {

				response = await apiFetch(
					API_URL,
					{
						method: "POST",

						headers: {
							"Content-Type":
								"application/json"
						},

						body:
							JSON.stringify(newsData)
					}
				);
			}


			if (!response.ok) {

				const errorData =
					await response.json()
						.catch(() => null);


				throw new Error(
					errorData?.detail ||
					`Ошибка: ${response.status}`
				);
			}


			const savedNews =
				await response.json();


			// ========================================
			// Загружаем фотографии
			// ========================================

			const files =
				Array.from(
					imagesInput.files
				);


			const mainImage =
				mainImageInput.files[0];


			if (mainImage) {

				await uploadImage(
					savedNews.id,
					mainImage
				);
			}


			for (const file of files) {

				await uploadImage(
					savedNews.id,
					file
				);
			}


			closeModal();


			await loadNews();

		} catch (error) {

			console.error(error);


			alert(
				`Не удалось сохранить новость.\n\n${error.message}`
			);

		} finally {

			saveButton.disabled =
				false;


			saveButton.textContent =
				id
					? "Сохранить изменения"
					: "Создать новость";
		}

	}
);


// ========================================
// Загрузка одного изображения
// ========================================

async function uploadImage(
	newsId,
	file
) {

	const formData =
		new FormData();


	formData.append(
		"file",
		file
	);


	const response =
		await apiFetch(
			`${API_URL}${newsId}/images`,
			{
				method: "POST",

				body:
					formData
			}
		);


	if (!response.ok) {

		const errorData =
			await response.json()
				.catch(() => null);


		throw new Error(
			errorData?.detail ||
			"Не удалось загрузить фотографию"
		);
	}
}


// ========================================
// Удаление новости
// ========================================

async function deleteNews(id) {

	const confirmed =
		confirm(
			"Удалить эту новость?"
		);


	if (!confirmed) {

		return;
	}


	try {

		const response =
			await apiFetch(
				`${API_URL}${id}`,
				{
					method: "DELETE"
				}
			);


		if (!response.ok) {

			const errorData =
				await response.json()
					.catch(() => null);


			throw new Error(
				errorData?.detail ||
				"Не удалось удалить новость"
			);
		}


		await loadNews();

	} catch (error) {

		console.error(error);


		alert(
			`Не удалось удалить новость.\n\n${error.message}`
		);
	}
}


// ========================================
// Сделать главной
// ========================================

async function setMainImage(
	newsId,
	imageId
) {

	try {

		const response =
			await apiFetch(
				`${API_URL}${newsId}/images/${imageId}/main`,
				{
					method: "PUT"
				}
			);


		if (!response.ok) {

			const errorData =
				await response.json()
					.catch(() => null);


			throw new Error(
				errorData?.detail ||
				"Не удалось изменить главную фотографию"
			);
		}


		await loadNews();


		await openEditModal(
			newsId
		);

	} catch (error) {

		console.error(error);


		alert(
			`Не удалось изменить главную фотографию.\n\n${error.message}`
		);
	}
}


// ========================================
// Удаление фотографии
// ========================================

async function deleteImage(
	newsId,
	imageId
) {

	const confirmed =
		confirm(
			"Удалить эту фотографию?"
		);


	if (!confirmed) {

		return;
	}


	try {

		const response =
			await apiFetch(
				`${API_URL}${newsId}/images/${imageId}`,
				{
					method: "DELETE"
				}
			);


		if (!response.ok) {

			const errorData =
				await response.json()
					.catch(() => null);


			throw new Error(
				errorData?.detail ||
				"Не удалось удалить фотографию"
			);
		}


		await loadNews();


		await openEditModal(
			newsId
		);

	} catch (error) {

		console.error(error);


		alert(
			`Не удалось удалить фотографию.\n\n${error.message}`
		);
	}
}


// ========================================
// Создание новости
// ========================================

createButton.addEventListener(
	"click",
	openCreateModal
);


// ========================================
// Запуск
// ========================================

async function initAdmin() {

	try {

		const authorized =
			await checkAuth();

		if (!authorized) {
			return;
		}

		await loadCsrfToken();

		await loadNews();

		if (typeof window.initTeachersAdmin === "function") {
			await window.initTeachersAdmin();
		}

		if (typeof window.initScheduleAdmin === "function") {
			await window.initScheduleAdmin();
		}

		if (typeof window.initMenuAdmin === "function") {
			await window.initMenuAdmin();
		}

	} catch (error) {

		console.error(error);

		window.location.href =
			"login.html";
	}
}
// ========================================
// Редактор текста новости
// ========================================

const editorButtons =
	document.querySelectorAll(
		".editor__button"
	);


editorButtons.forEach(button => {

	button.addEventListener(
		"mousedown",
		event => {

			// Не даём кнопке забрать фокус
			// у редактора
			event.preventDefault();

		}
	);


	button.addEventListener(
		"click",
		() => {

			const command =
				button.dataset.command;

			const value =
				button.dataset.value ||
				null;


			if (command === "createLink") {

				const url =
					prompt(
						"Введите адрес ссылки:"
					);


				if (!url) {
					return;
				}


				document.execCommand(
					"createLink",
					false,
					url
				);


				return;
			}


			document.execCommand(
				command,
				false,
				value
			);

		}
	);

});


async function apiFetch(
	url,
	options = {}
) {

	options.credentials = "include";

	options.headers = {
		...(options.headers || {}),
		"X-CSRF-Token": csrfToken
	};

	return fetch(
		url,
		options
	);
}


const ADMIN_TABS = {
	news: { sectionId: "news-section", siteHref: "../life.html#news" },
	gym_life: { sectionId: "gym-life-section", siteHref: "../life.html" },
	teachers: { sectionId: "teachers-section", siteHref: "../teachers.html" },
	schedule: { sectionId: "schedule-section", siteHref: "../class_schedule.html" },
	menu: { sectionId: "menu-section", siteHref: "../food.html" },
	feedback: { sectionId: "feedback-section", siteHref: "../contact.html" },
	documents: { sectionId: "documents-section", siteHref: "../documents.html" }
};

function switchAdminTab(tabName) {
	const activeKey = Object.prototype.hasOwnProperty.call(ADMIN_TABS, tabName) ? tabName : "news";

	document.querySelectorAll("[data-admin-tab]").forEach(btn => {
		btn.classList.toggle("admin-tab--active", btn.dataset.adminTab === activeKey);
	});

	Object.entries(ADMIN_TABS).forEach(([key, cfg]) => {
		const section = document.getElementById(cfg.sectionId);
		if (!section) return;
		const isActive = key === activeKey;
		section.classList.toggle("admin-section--active", isActive);
		section.hidden = !isActive;
	});

	const siteLink = document.querySelector(".admin-header__site-link");
	if (siteLink) {
		siteLink.href = ADMIN_TABS[activeKey].siteHref;
	}

	if (window.location.hash !== `#${activeKey}`) {
		history.replaceState(null, "", `#${activeKey}`);
	}
}

document.querySelectorAll("[data-admin-tab]").forEach(btn => {
	btn.addEventListener("click", () => {
		switchAdminTab(btn.dataset.adminTab || "news");
	});
});

if (window.location.hash) {
	const hashTab = window.location.hash.slice(1);
	if (Object.prototype.hasOwnProperty.call(ADMIN_TABS, hashTab)) {
		switchAdminTab(hashTab);
	}
}

window.AdminApp = {
	apiFetch,
	escapeHtml,
	getImageUrl,
	switchTab: switchAdminTab,
	teachersCache: [],
	onTeachersUpdatedCallbacks: [],
	notifyTeachersUpdated(list) {
		this.teachersCache = Array.isArray(list) ? list : [];
		this.onTeachersUpdatedCallbacks.forEach(cb => {
			try {
				cb(this.teachersCache);
			} catch (e) {
				console.error(e);
			}
		});
	}
};


initAdmin();