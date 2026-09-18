const filterButtons = document.querySelectorAll(".filters-block__btn");

const newsList = document.querySelector(".sub-news-list");

const loadMoreButton = document.querySelector(".load-more-btn");

const featuredNews = document.querySelector(".featured-news");


// ==================================================
// НАСТРОЙКИ
// ==================================================

let selectedCategory = "all";

let visibleCards = 6;


// ==================================================
// СОЗДАНИЕ КАРТОЧКИ
// ==================================================

function createNewsCard(item) {
	return `
		<article class="sub-news-card" data-category="${item.category}">

			<div class="sub-news-card__img-wrap">
				<img
					src="${item.image}"
					alt="${item.alt}"
					class="sub-news-card__img"
				>
			</div>

			<div class="sub-news-card__content">

				<div class="sub-news-card__meta meta-group">

					<span class="meta-group__tag tag-${item.category}">
						${item.categoryName}
					</span>

					<time class="meta-group__date">
						${item.date}
					</time>

				</div>

				<h3 class="sub-news-card__title">
					<a href="news.html?id=${item.id}">
						${item.title}
					</a>
				</h3>

				<p class="sub-news-card__excerpt">
					${item.excerpt}
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


// ==================================================
// ОБНОВЛЕНИЕ НОВОСТЕЙ
// ==================================================

function updateNews() {

	// Получаем новости выбранной категории

	const filteredNews = news.filter(item => {

		return (
			selectedCategory === "all" ||
			item.category === selectedCategory
		);

	});


	// Берём только нужное количество

	const visibleNews = filteredNews.slice(0, visibleCards);


	// Создаём карточки

	newsList.innerHTML = visibleNews
		.map(item => createNewsCard(item))
		.join("");


	// ==================================================
	// ГЛАВНАЯ НОВОСТЬ
	// ==================================================

	if (
		selectedCategory === "all" ||
		featuredNews.dataset.category === selectedCategory
	) {

		featuredNews.style.display = "";

	} else {

		featuredNews.style.display = "none";

	}


	// ==================================================
	// КНОПКА «ПОКАЗАТЬ ЕЩЁ»
	// ==================================================

	if (visibleCards >= filteredNews.length) {

		loadMoreButton.style.display = "none";

	} else {

		loadMoreButton.style.display = "block";

	}

}


// ==================================================
// ФИЛЬТРЫ
// ==================================================

filterButtons.forEach(button => {

	button.addEventListener("click", () => {

		// Запоминаем выбранную категорию

		selectedCategory = button.dataset.filter;


		// При смене категории
		// снова показываем первые 6 новостей

		visibleCards = 6;


		// Убираем active у всех кнопок

		filterButtons.forEach(btn => {

			btn.classList.remove(
				"filters-block__btn--active"
			);

		});


		// Добавляем active выбранной кнопке

		button.classList.add(
			"filters-block__btn--active"
		);


		// Обновляем новости

		updateNews();

	});

});


// ==================================================
// ПОКАЗАТЬ ЕЩЁ
// ==================================================

loadMoreButton.addEventListener("click", () => {

	// Добавляем ещё 6 карточек

	visibleCards += 6;


	updateNews();

});


// ==================================================
// ПЕРВЫЙ ЗАПУСК
// ==================================================

updateNews();