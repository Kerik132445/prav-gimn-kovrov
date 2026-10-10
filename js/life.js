const API_URL = `${window.API_BASE_URL}/api/news/`;


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
// Настройки анимаций
// ========================================

const prefersReducedMotion =
	window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	).matches;


// ========================================
// Анимация появления элемента
// ========================================

function animateNewsCard(element, delay = 0) {

	if (!element) {
		return;
	}


	if (prefersReducedMotion) {
		return;
	}


	element.style.opacity = "0";


	const animation =
		element.animate(
			[
				{
					opacity: 0,
					transform: "translateY(24px)"
				},
				{
					opacity: 1,
					transform: "translateY(0)"
				}
			],
			{
				duration: 550,
				delay: delay,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)",
				fill: "forwards"
			}
		);


	animation.addEventListener(
		"finish",
		() => {

			element.style.opacity = "";

		}
	);
}


// ========================================
// Анимация главной новости
// ========================================

function animateFeaturedNews() {

	if (!featuredNews) {
		return;
	}


	if (prefersReducedMotion) {
		return;
	}


	featuredNews.style.opacity = "0";


	const animation =
		featuredNews.animate(
			[
				{
					opacity: 0,
					transform: "translateY(20px)"
				},
				{
					opacity: 1,
					transform: "translateY(0)"
				}
			],
			{
				duration: 650,
				easing: "cubic-bezier(0.22, 1, 0.36, 1)",
				fill: "forwards"
			}
		);


	animation.addEventListener(
		"finish",
		() => {

			featuredNews.style.opacity = "";

		}
	);
}


// ========================================
// Анимация карточек при прокрутке
// ========================================

function initScrollAnimations() {

	if (!newsList) {
		return;
	}


	const cards =
		newsList.querySelectorAll(
			".sub-news-card"
		);


	if (prefersReducedMotion) {
		return;
	}


	const observer =
		new IntersectionObserver(
			(entries, observer) => {

				entries.forEach(entry => {

					if (!entry.isIntersecting) {
						return;
					}


					const card =
						entry.target;


					const delay =
						Number(
							card.dataset.animationDelay || 0
						);


					animateNewsCard(
						card,
						delay
					);


					observer.unobserve(card);

				});

			},
			{
				threshold: 0.12
			}
		);


	cards.forEach(
		(card, index) => {

			card.dataset.animationDelay =
				Math.min(index * 80, 400);


			observer.observe(card);

		}
	);
}


// ========================================
// Анимация новых карточек
// ========================================

function animateNewCards() {

	if (!newsList) {
		return;
	}


	const cards =
		newsList.querySelectorAll(
			".sub-news-card"
		);


	if (prefersReducedMotion) {
		return;
	}


	cards.forEach(
		(card, index) => {

			animateNewsCard(
				card,
				Math.min(index * 70, 420)
			);

		}
	);
}


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
		animateInitialNews();


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


	animateFeaturedNews();
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
// Анимация первого рендера
// ========================================

function animateInitialNews() {

	if (!newsList) {
		return;
	}


	if (prefersReducedMotion) {
		return;
	}


	const cards =
		newsList.querySelectorAll(
			".sub-news-card"
		);


	const observer =
		new IntersectionObserver(
			(entries, observer) => {

				entries.forEach(entry => {

					if (!entry.isIntersecting) {
						return;
					}


					const card =
						entry.target;


					const delay =
						Number(
							card.dataset.animationDelay || 0
						);


					animateNewsCard(
						card,
						delay
					);


					observer.unobserve(card);

				});

			},
			{
				threshold: 0.12
			}
		);


	cards.forEach(
		(card, index) => {

			card.dataset.animationDelay =
				Math.min(index * 80, 400);


			observer.observe(card);

		}
	);
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

			animateFilteredNews();

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

		return `${window.API_BASE_URL}${image}`;
	}


	return image;
}


// ========================================
// Показать ещё
// ========================================

loadMoreButton.addEventListener(
	"click",
	() => {

		const previousVisibleCards =
			visibleCards;


		visibleCards += 6;


		updateNews();


		if (prefersReducedMotion) {
			return;
		}


		const cards =
			newsList.querySelectorAll(
				".sub-news-card"
			);


		const newCards =
			Array.from(cards).slice(
				previousVisibleCards
			);


		newCards.forEach(
			(card, index) => {

				animateNewsCard(
					card,
					index * 80
				);

			}
		);

	}
);


function animateFilteredNews() {

	if (!newsList) {
		return;
	}


	if (prefersReducedMotion) {
		return;
	}


	const cards =
		newsList.querySelectorAll(
			".sub-news-card"
		);


	cards.forEach(
		(card, index) => {

			animateNewsCard(
				card,
				Math.min(index * 80, 400)
			);

		}
	);
}


// ========================================
// Запуск
// ========================================

loadNews();