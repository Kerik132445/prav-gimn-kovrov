const API_URL = "http://127.0.0.1:8000/api/news/";

const filterButtons = document.querySelectorAll(".filters-block__btn");
const newsList = document.querySelector(".sub-news-list");
const loadMoreButton = document.querySelector(".load-more-btn");

const featuredNews = document.querySelector(".featured-news");
const featuredImage = document.getElementById("featured-news-image");
const featuredCategory = document.getElementById("featured-news-category");
const featuredDate = document.getElementById("featured-news-date");
const featuredTitle = document.getElementById("featured-news-title");
const featuredDescription = document.getElementById("featured-news-description");
const featuredLink = document.getElementById("featured-news-link");

let news = [];
let selectedCategory = "all";
let visibleCards = 6;


// ========================================
// Получение новостей с backend
// ========================================

async function loadNews() {

	try {

		const response = await fetch(API_URL);

		if (!response.ok) {
			throw new Error(
				`Ошибка сервера: ${response.status}`
			);
		}

		news = await response.json();

		console.log(
			"Новости загружены:",
			news
		);

		console.log("ПЕРВАЯ НОВОСТЬ:", news[0]);
		console.log("КАРТИНКА:", news[0]?.image);
		console.log("ГАЛЕРЕЯ:", news[0]?.images);

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

		education: "Учебная жизнь",

		holidays: "Праздники",

		pilgrimage: "Паломничество",

		sport: "Спорт и ВПК"

	};

	return categories[category] || category;
}


// ========================================
// Главная новость
// ========================================

function updateFeaturedNews(item) {

	if (!item) {

		featuredNews.style.display = "none";

		return;
	}

	featuredNews.style.display = "";

	featuredImage.src = getImageUrl(item.image) || "";
	featuredImage.alt = item.title;

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

	const filteredNews = news.filter(item => {

		return (
			selectedCategory === "all" ||
			item.category === selectedCategory
		);

	});


	const visibleNews =
		filteredNews.slice(0, visibleCards);


	newsList.innerHTML =
		visibleNews
			.map(item => createNewsCard(item))
			.join("");


	const featuredItem =
		filteredNews[0];


	updateFeaturedNews(
		featuredItem
	);


	if (
		visibleCards >= filteredNews.length
	) {

		loadMoreButton.style.display = "none";

	} else {

		loadMoreButton.style.display = "block";

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


			visibleCards = 6;


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

function getImageUrl(image) {

	if (!image) {
		return "";
	}

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
// Запускаем загрузку
// ========================================

loadNews();