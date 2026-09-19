const API_URL = "http://127.0.0.1:8000/api/news/";

const params = new URLSearchParams(window.location.search);
const newsId = Number(params.get("id"));

function getImageUrl(image) {

	if (!image) {
		return "";
	}

	// Если API вернул объект изображения
	if (typeof image === "object") {
		image = image.image;
	}

	if (!image) {
		return "";
	}

	if (image.startsWith("http")) {
		return image;
	}

	if (image.startsWith("/uploads")) {
		return `http://127.0.0.1:8000${image}`;
	}

	return image;
}


// ========================================
// Элементы страницы
// ========================================

const titleElement = document.querySelector("#news-title");
const categoryElement = document.querySelector("#news-category");
const dateElement = document.querySelector("#news-date");
const imageElement = document.querySelector("#news-image");
const contentElement = document.querySelector("#news-content");

const thumbnailsElement =
	document.querySelector("#news-thumbnails");

const prevButton =
	document.querySelector(".news-gallery__arrow--prev");

const nextButton =
	document.querySelector(".news-gallery__arrow--next");


// ========================================
// Элементы lightbox
// ========================================

const lightbox =
	document.querySelector("#news-lightbox");

const lightboxImage =
	document.querySelector("#news-lightbox-image");

const lightboxClose =
	document.querySelector("#news-lightbox-close");

const lightboxPrev =
	document.querySelector("#news-lightbox-prev");

const lightboxNext =
	document.querySelector("#news-lightbox-next");

const lightboxCounter =
	document.querySelector("#news-lightbox-counter");


// ========================================
// Название категории
// ========================================

function getCategoryName(category) {

	const categories = {

		education: "Учебная жизнь",

		holidays: "Праздники",

		pilgrimage: "Паломничество",

		sport: "Спорт и ВПК"

	};

	return categories[category] || category;
}


// ========================================
// Загрузка новости
// ========================================

async function loadNews() {

	try {

		if (!newsId) {
			throw new Error("Не указан ID новости");
		}


		const response =
			await fetch(`${API_URL}${newsId}`);


		if (!response.ok) {

			if (response.status === 404) {
				showNewsNotFound();
				return;
			}

			throw new Error(
				`Ошибка сервера: ${response.status}`
			);

		}


		const currentNews =
			await response.json();


		console.log(
			"Новость загружена:",
			currentNews
		);


		displayNews(currentNews);


	} catch (error) {

		console.error(
			"Не удалось загрузить новость:",
			error
		);


		titleElement.textContent =
			"Не удалось загрузить новость";

		categoryElement.textContent = "";
		dateElement.textContent = "";

		contentElement.innerHTML = `
			<p>
				Произошла ошибка при загрузке новости.
			</p>
		`;

	}

}


// ========================================
// Новость не найдена
// ========================================

function showNewsNotFound() {

	titleElement.textContent =
		"Новость не найдена";

	categoryElement.textContent = "";
	dateElement.textContent = "";

	imageElement.style.display = "none";

	if (thumbnailsElement) {
		thumbnailsElement.style.display = "none";
	}

	contentElement.innerHTML = `
		<p>
			К сожалению, такой новости не существует.
		</p>
	`;

}


// ========================================
// Отображение новости
// ========================================

function displayNews(currentNews) {

	document.title =
		`${currentNews.title} | Православная гимназия г. Коврова`;


	// ----------------------------------------
	// Основная информация
	// ----------------------------------------

	titleElement.textContent =
		currentNews.title;


	categoryElement.textContent =
		getCategoryName(currentNews.category);


	dateElement.textContent =
		currentNews.date;


	// ----------------------------------------
	// Текст новости
	// ----------------------------------------

	contentElement.innerHTML =
		currentNews.content;


	// ----------------------------------------
	// Галерея
	// ----------------------------------------

	const images =
		currentNews.images?.length
			? currentNews.images
			: currentNews.image
				? [currentNews.image]
				: [];


	let currentImageIndex = 0;


	// Если фотографий нет

	if (!images.length) {

		imageElement.style.display = "none";

		thumbnailsElement.style.display = "none";

		return;
	}


	// ========================================
	// Показать фотографию
	// ========================================

	function showImage(index) {

		if (!images.length) {
			return;
		}


		currentImageIndex = index;


		imageElement.src =
			getImageUrl(
				images[currentImageIndex]
			);


		imageElement.alt =
			currentNews.title;


		// Обновляем активную миниатюру

		const thumbnails =
			document.querySelectorAll(
				".news-gallery__thumbnail"
			);


		thumbnails.forEach(
			(thumbnail, thumbnailIndex) => {

				thumbnail.classList.toggle(
					"news-gallery__thumbnail--active",
					thumbnailIndex === currentImageIndex
				);

			}
		);

	}


	// ========================================
	// Lightbox
	// ========================================

	function updateLightbox() {

		lightboxImage.src =
			getImageUrl(
				images[currentImageIndex]
			);


		lightboxImage.alt =
			currentNews.title;


		lightboxCounter.textContent =
			`${currentImageIndex + 1} / ${images.length}`;
	}


	function openLightbox() {

		updateLightbox();


		lightbox.classList.add(
			"news-lightbox--active"
		);


		document.body.style.overflow =
			"hidden";

	}


	function closeLightbox() {

		lightbox.classList.remove(
			"news-lightbox--active"
		);


		document.body.style.overflow =
			"";

	}


	function showLightboxImage(index) {

		if (!images.length) {
			return;
		}


		currentImageIndex = index;


		showImage(
			currentImageIndex
		);


		updateLightbox();

	}


	// ========================================
	// Создание миниатюр
	// ========================================

	images.forEach(
		(image, index) => {

			const thumbnail =
				document.createElement("button");


			thumbnail.type = "button";


			thumbnail.className =
				"news-gallery__thumbnail";


			thumbnail.setAttribute(
				"aria-label",
				`Открыть фотографию ${index + 1}`
			);


			const thumbnailImage =
				document.createElement("img");


			thumbnailImage.src =
				getImageUrl(image);


			thumbnailImage.alt =
				`${currentNews.title} ${index + 1}`;


			thumbnail.appendChild(
				thumbnailImage
			);


			thumbnail.addEventListener(
				"click",
				() => {

					showImage(index);

				}
			);


			thumbnailsElement.appendChild(
				thumbnail
			);

		}
	);


	// ========================================
	// Первая фотография
	// ========================================

	showImage(0);


	// ========================================
	// Нажатие на большую фотографию
	// ========================================

	imageElement.addEventListener(
		"click",
		openLightbox
	);


	// ========================================
	// Закрытие lightbox
	// ========================================

	lightboxClose.addEventListener(
		"click",
		closeLightbox
	);


	// Закрытие по клику на фон

	lightbox.addEventListener(
		"click",
		(event) => {

			if (event.target === lightbox) {
				closeLightbox();
			}

		}
	);


	// ========================================
	// Стрелки lightbox
	// ========================================

	lightboxPrev.addEventListener(
		"click",
		(event) => {

			event.stopPropagation();


			let newIndex =
				currentImageIndex - 1;


			if (newIndex < 0) {
				newIndex =
					images.length - 1;
			}


			showLightboxImage(
				newIndex
			);

		}
	);


	lightboxNext.addEventListener(
		"click",
		(event) => {

			event.stopPropagation();


			let newIndex =
				currentImageIndex + 1;


			if (
				newIndex >= images.length
			) {
				newIndex = 0;
			}


			showLightboxImage(
				newIndex
			);

		}
	);


	// ========================================
	// Закрытие по Escape
	// ========================================

	document.addEventListener(
		"keydown",
		(event) => {

			if (
				!lightbox.classList.contains(
					"news-lightbox--active"
				)
			) {
				return;
			}


			if (event.key === "Escape") {

				closeLightbox();

			}


			if (event.key === "ArrowLeft") {

				lightboxPrev.click();

			}


			if (event.key === "ArrowRight") {

				lightboxNext.click();

			}

		}
	);


	// ========================================
	// Если фотография одна
	// ========================================

	if (images.length <= 1) {

		prevButton.style.display =
			"none";

		nextButton.style.display =
			"none";

		lightboxPrev.style.display =
			"none";

		lightboxNext.style.display =
			"none";

	} else {

		// ----------------------------------------
		// Предыдущая фотография
		// ----------------------------------------

		prevButton.addEventListener(
			"click",
			() => {

				let newIndex =
					currentImageIndex - 1;


				if (newIndex < 0) {

					newIndex =
						images.length - 1;

				}


				showImage(newIndex);

			}
		);


		// ----------------------------------------
		// Следующая фотография
		// ----------------------------------------

		nextButton.addEventListener(
			"click",
			() => {

				let newIndex =
					currentImageIndex + 1;


				if (
					newIndex >= images.length
				) {

					newIndex = 0;

				}


				showImage(newIndex);

			}
		);

	}

}


// ========================================
// Запускаем загрузку
// ========================================

loadNews();