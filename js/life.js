const API_URL = "http://localhost:8000/api/news/";


const filterButtons =
	document.querySelectorAll(".filters-block__btn");

const newsList =
	document.querySelector(".sub-news-list");

const loadMoreButton =
	document.querySelector(".load-more-btn");


const featuredNews =
	document.querySelector(".featured-news");

const featuredImage =
	document.getElementById("featured-news-image");

const featuredCategory =
	document.getElementById("featured-news-category");

const featuredDate =
	document.getElementById("featured-news-date");

const featuredTitle =
	document.getElementById("featured-news-title");

const featuredDescription =
	document.getElementById("featured-news-description");

const featuredLink =
	document.getElementById("featured-news-link");


let news = [];

let selectedCategory = "all";

let visibleCards = 6;


// ========================================
// Получение новостей с backend
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


		console.log(
			"Новости загружены:",
			news
		);


		updateNews();

	} catch (error) {

		console.error(
			"Не удалось загрузить новости:",
			error
		);


		newsList.innerHTML = `
			<p>
				Не удалось загрузить новости.
			</p>
		`;
	}
}


// ========================================
// Создание карточки новости
// ========================================

function createNewsCard(item) {

	return `
		<article
			class="sub-news-card"
			data-category="${item.category}"
		>

			<div class="sub-news-card__img-wrap">

				<img
					src="${getImageUrl(item.image)}"
					alt="${item.title}"
					class="sub-news-card__img"
				>

			</div>


			<div class="sub-news-card__content">

				<div class="sub-news-card__meta meta-group">

					<span
						class="meta-group__tag tag-${item.category}"
					>
						${getCategoryName(item.category)}
					</span>

					<time class="sub-news-card__date">
						${item.date}
					</time>

				</div>


				<h3 class="sub-news-card__title">

					<a href="news.html?id=${item.id}">
						${item.title}
					</a>

				</h3>


				<p class="sub-news-card__excerpt">
					${item.description}
				</p>


				<a
					href="news.html?id=${item.id}"
					class="sub-news-card__more-link link-with-arrow"
				>
					Читать далее
				</a>

			</div>

		</article>
	`;
}


// ========================================
// Название категории
// ========================================

function getCategoryName(category) {

	const categories = {

		education:
			"Учебная жизнь",

		holidays:
			"Праздники",

		pilgrimage:
			"Паломничество",

		sport:
			"Спорт и ВПК"

	};


	return categories[category] || category;
}


// ========================================
// Главная новость
// ========================================

function updateFeaturedNews(item) {

	if (!item) {

		featuredNews.style.display =
			"none";

		return;
	}


	featuredNews.style.display =
		"";


	featuredImage.src =
		getImageUrl(item.image);

	featuredImage.alt =
		item.title;


	featuredCategory.textContent =
		getCategoryName(item.category);

	featuredCategory.className =
		`meta-group__tag tag-${item.category}`;


	featuredDate.textContent =
		item.date;


	featuredTitle.textContent =
		item.title;


	featuredDescription.textContent =
		item.description;


	featuredLink.href =
		`news.html?id=${item.id}`;
}


// ========================================
// Обновление новостей
// ========================================

function updateNews() {

	const filteredNews =
		news.filter(item => {

			return (
				selectedCategory === "all" ||
				item.category === selectedCategory
			);

		});


	// Первая новость становится главной

	const featuredItem =
		filteredNews[0];


	updateFeaturedNews(
		featuredItem
	);


	// Остальные новости
	// идут в маленькие карточки

	const smallNews =
		filteredNews.slice(1);


	// Показываем нужное количество

	const visibleNews =
		smallNews.slice(
			0,
			visibleCards
		);


	newsList.innerHTML =
		visibleNews
			.map(item => createNewsCard(item))
			.join("");


	// Управление кнопкой
	// "Показать ещё"

	if (
		visibleCards >=
		smallNews.length
	) {

		loadMoreButton.style.display =
			"none";

	} else {

		loadMoreButton.style.display =
			"block";
	}
}


// ========================================
// Фильтры
// ========================================

filterButtons.forEach(button => {

	button.addEventListener(
		"click",
		() => {

			selectedCategory =
				button.dataset.filter;


			visibleCards =
				6;


			filterButtons.forEach(btn => {

				btn.classList.remove(
					"filters-block__btn--active"
				);

			});


			button.classList.add(
				"filters-block__btn--active"
			);


			updateNews();

		}
	);

});


// ========================================
// URL изображения
// ========================================

function getImageUrl(image) {

	if (!image) {

		return "";
	}


	// На случай,
	// если backend вернул объект

	if (
		typeof image === "object"
	) {

		image =
			image.image;
	}


	if (!image) {

		return "";
	}


	// Если уже полный URL

	if (
		image.startsWith("http")
	) {

		return image;
	}


	// Изображения нашего backend

	if (
		image.startsWith("/uploads")
	) {

		return `http://localhost:8000${image}`;
	}


	return image;
}


// ========================================
// Показать ещё
// ========================================

loadMoreButton.addEventListener(
	"click",
	() => {

		visibleCards += 6;

		updateNews();

	}
);


// ========================================
// Запуск
// ========================================

loadNews();