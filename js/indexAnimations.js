// ========================================
// REVEAL АНИМАЦИЯ СЕКЦИЙ
// ========================================

const revealElements = document.querySelectorAll(`
    .quick-actions,
    .about,
    .quote,
    .stats,
    .fresh-news,
    .teachers,
    .faq-feedback
`);

revealElements.forEach((element, index) => {
	element.classList.add("js-reveal");
	element.style.transitionDelay = `${index * 0.05}s`;
});


const revealObserver = new IntersectionObserver((entries, observer) => {

	entries.forEach(entry => {

		if (entry.isIntersecting) {
			entry.target.classList.add("is-visible");
			observer.unobserve(entry.target);
		}

	});

}, {
	threshold: 0.12
});


revealElements.forEach(element => {
	revealObserver.observe(element);
});


// ========================================
// АНИМАЦИЯ КАРТИНОК
// ========================================

const imageElements = document.querySelectorAll(`
    .about__image,
    .teachers__media
`);

imageElements.forEach(element => {
	element.classList.add("js-reveal-image");
	revealObserver.observe(element);
});


// ========================================
// АНИМАЦИЯ ЧИСЕЛ
// ========================================

const statNumbers = document.querySelectorAll(".stat-card__number");

const statsObserver = new IntersectionObserver((entries, observer) => {

	entries.forEach(entry => {

		if (!entry.isIntersecting) return;

		const element = entry.target;
		const text = element.textContent.trim();

		// 9+
		if (/^\d+\+$/.test(text)) {

			const number = parseInt(text);

			animateNumber(element, number, "+");
		}

		// 100%
		else if (/^\d+%$/.test(text)) {

			const number = parseInt(text);

			animateNumber(element, number, "%");
		}

		// 1-11
		else if (/^\d+-\d+$/.test(text)) {

			const [start, end] = text.split("-").map(Number);

			animateRange(element, start, end);
		}

		// 24/7
		else if (/^\d+\/\d+$/.test(text)) {

			const [number, total] = text.split("/").map(Number);

			animateNumber(element, number, `/${total}`);
		}

		observer.unobserve(element);
	});

}, {
	threshold: 0.7
});


statNumbers.forEach(number => {
	statsObserver.observe(number);
});


function animateNumber(element, target, suffix) {

	const duration = 1200;
	const startTime = performance.now();

	function update(currentTime) {

		const progress = Math.min(
			(currentTime - startTime) / duration,
			1
		);

		// Плавное ускорение/замедление
		const eased = 1 - Math.pow(1 - progress, 3);

		const currentNumber =
			Math.floor(target * eased);

		element.textContent =
			currentNumber + suffix;

		if (progress < 1) {

			requestAnimationFrame(update);

		} else {

			element.textContent =
				target + suffix;
		}
	}

	requestAnimationFrame(update);
}


function animateRange(element, start, target) {

	const duration = 1200;
	const startTime = performance.now();

	function update(currentTime) {

		const progress = Math.min(
			(currentTime - startTime) / duration,
			1
		);

		const eased =
			1 - Math.pow(1 - progress, 3);

		const currentNumber =
			Math.floor(
				start + (target - start) * eased
			);

		element.textContent =
			`${currentNumber}-${target}`;

		if (progress < 1) {

			requestAnimationFrame(update);

		} else {

			element.textContent =
				`${start}-${target}`;
		}
	}

	requestAnimationFrame(update);
}


// ========================================
// НОВОСТИ С BACKEND
// ========================================

const HOME_API_URL = "http://localhost:8000/api/news/";

const homeNewsList = document.getElementById("home-news-list");

let homeNews = [];
let homeNewsPosition = 0;

const HOME_NEWS_PER_VIEW = 3;


async function loadHomeNews() {

	if (!homeNewsList) return;

	try {

		const response = await fetch(HOME_API_URL);

		if (!response.ok) {
			throw new Error(
				`Ошибка загрузки новостей: ${response.status}`
			);
		}

		homeNews = await response.json();

		// Сначала самые новые
		homeNews.sort((a, b) => {

			const dateA = new Date(a.date);
			const dateB = new Date(b.date);

			return dateB - dateA;
		});

		renderHomeNews();

	} catch (error) {

		console.error("Не удалось загрузить новости:", error);

		homeNewsList.innerHTML = `
            <p class="news-error">
                Не удалось загрузить новости.
            </p>
        `;
	}
}


// ========================================
// СОЗДАНИЕ КАРТОЧКИ НОВОСТИ
// ========================================

function createHomeNewsCard(news) {

	const article = document.createElement("article");

	article.className = "news";

	const image = news.image
		? `http://localhost:8000${news.image}`
		: "assets/icons/news1.png";

	article.innerHTML = `
        <div class="news__image">
            <img
                src="${image}"
                alt="${escapeHTML(news.title)}"
                loading="lazy"
            >
        </div>

        <div class="news__content">

            <div class="news__date">
                ${escapeHTML(news.date)}
            </div>

            <h3 class="news__title">
                ${escapeHTML(news.title)}
            </h3>

            <p class="news__description">
                ${escapeHTML(news.description)}
            </p>

            <a
                href="news.html?id=${news.id}"
                class="news__link"
            >
                Читать далее
            </a>

        </div>
    `;

	return article;
}


// ========================================
// ОТОБРАЖЕНИЕ НОВОСТЕЙ
// ========================================

function renderHomeNews() {

	if (!homeNewsList) return;

	homeNewsList.innerHTML = "";

	if (!homeNews.length) {

		homeNewsList.innerHTML = `
            <p class="news-empty">
                Пока новостей нет.
            </p>
        `;

		return;
	}

	const visibleNews = homeNews.slice(
		homeNewsPosition,
		homeNewsPosition + HOME_NEWS_PER_VIEW
	);

	visibleNews.forEach((news, index) => {

		const card = createHomeNewsCard(news);

		homeNewsList.appendChild(card);

		animateHomeNewsCard(
			card,
			index * 80
		);
	});

	updateHomeSliderButtons();
}


// ========================================
// АНИМАЦИЯ НОВОСТЕЙ
// ========================================

function animateHomeNewsCard(element, delay = 0) {

	if (!element) return;

	const prefersReducedMotion =
		window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

	if (prefersReducedMotion) return;

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
			delay,
			easing: "cubic-bezier(0.22, 1, 0.36, 1)",
			fill: "forwards"
		}
	);
}


// ========================================
// СЛАЙДЕР НОВОСТЕЙ
// ========================================

const prevNewsButton = document.querySelector(
	".slider-btn--prev"
);

const nextNewsButton = document.querySelector(
	".slider-btn--next"
);


if (prevNewsButton) {

	prevNewsButton.addEventListener("click", () => {

		if (homeNewsPosition <= 0) return;

		homeNewsPosition -= HOME_NEWS_PER_VIEW;

		renderHomeNews();
	});
}


if (nextNewsButton) {

	nextNewsButton.addEventListener("click", () => {

		if (
			homeNewsPosition + HOME_NEWS_PER_VIEW
			>= homeNews.length
		) {
			return;
		}

		homeNewsPosition += HOME_NEWS_PER_VIEW;

		renderHomeNews();
	});
}


function updateHomeSliderButtons() {

	if (prevNewsButton) {

		prevNewsButton.disabled =
			homeNewsPosition <= 0;
	}

	if (nextNewsButton) {

		nextNewsButton.disabled =
			homeNewsPosition + HOME_NEWS_PER_VIEW
			>= homeNews.length;
	}
}


// ========================================
// БЕЗОПАСНЫЙ ВЫВОД ТЕКСТА
// ========================================

function escapeHTML(value) {

	if (value === null || value === undefined) {
		return "";
	}

	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}


// ========================================
// АНИМАЦИЯ КАРТОЧЕК
// ========================================

const cards = document.querySelectorAll(`
    .quick-card,
    .stat-card
`);

cards.forEach((card, index) => {

	card.style.transitionDelay =
		`${(index % 4) * 0.05}s`;

});


// ========================================
// ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

	link.addEventListener("click", event => {

		const targetId =
			link.getAttribute("href");

		if (!targetId || targetId === "#") {
			return;
		}

		const target =
			document.querySelector(targetId);

		if (!target) {
			return;
		}

		event.preventDefault();

		target.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});

	});

});


// ========================================
// ЗАПУСК
// ========================================

loadHomeNews();