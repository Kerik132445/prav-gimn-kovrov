(() => {
const API_URL = `${window.API_BASE_URL}/api/news/`;
let useLocalAssets = false;


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

const FALLBACK_NEWS = [
  {
    "id": 9,
    "title": "Воздвижение Креста Господня",
    "description": "27 сентября наши гимназисты приняли участие в Патриаршей Литургии, проходившей в Воскресенском храме г.Суздаля.",
    "content": "<p>27 сентября — день, который для учащихся нашей гимназии стал особенным и благодатным. Нам выпала великая честь — в Воскресенском храме города Суздаля встретить Святейшего Патриарха Московского и всея Руси Кирилла.<br>Ребята затаив дыхание внимали добрым словам наставления, обращённым к ним. Святейший Владыка благословил всех присутствующих в храме, и это благословение мы унесли с собой в сердцах.</p><p><a href=\"https://vkvideo.ru/video-94423439_456242208\">https://vkvideo.ru/video-94423439_456242208</a></p>",
    "category": "pilgrimage",
    "date": "27 сентября 2026",
    "image": "/uploads/news/e180699e-5c7f-4f30-a8e6-f14681f70717.jpg",
    "images": [
      "/uploads/news/e180699e-5c7f-4f30-a8e6-f14681f70717.jpg",
      "/uploads/news/1a538333-70d2-40a2-8615-a5319f045c5c.jpg"
    ]
  },
  {
    "id": 8,
    "title": "Школьный этап предметных олимпиад",
    "description": "В сентябре проходит школьный этап олимпиады по различным предметам. Желаем нашим ученикам успехов!",
    "content": "Продолжаем писать предметные олимпиады. Олимпиады – это отличная возможность объективной оценки твоих знаний. Тут нет грозного учителя или субъективного отношения, все зависит от твоих сил. А еще такие соревнования заставляют мозг думать чуть-чуть иначе. Они учат смотреть на обыденные вещи с разных ракурсов, копать глубже, погружаться в знания.",
    "category": "education",
    "date": "Сентябрь 2026",
    "image": "/uploads/news/7e2467b3-b931-498e-88c4-234bc3eb5550.jpg",
    "images": [
      "/uploads/news/7e2467b3-b931-498e-88c4-234bc3eb5550.jpg",
      "/uploads/news/4d0555d0-3193-439f-839a-3c3743341cb3.jpg"
    ]
  },
  {
    "id": 7,
    "title": "Уроки физкультуры на свежем воздухе",
    "description": "Пока стоит хорошая погода уроки физкультуры проходят на нашей спортплощадке на территории гимназии.",
    "content": "<p><a href=\"https://vkvideo.ru/video-178231686_456239688\">https://vkvideo.ru/video-178231686_456239688</a></p><p><a href=\"https://vkvideo.ru/video-178231686_456239689\">https://vkvideo.ru/video-178231686_456239689</a></p><p>Уроки физкультуры у нас в такую прекрасную погоду проходят на спортплощадке или в парке. Закаляйся,если хочешь быть здоров!</p>",
    "category": "sport",
    "date": "10 сентября 2026",
    "image": "/uploads/news/699cf18c-8052-4c27-a881-a79fc15b3762.jpg",
    "images": [
      "/uploads/news/699cf18c-8052-4c27-a881-a79fc15b3762.jpg",
      "/uploads/news/2d24b4b4-b83b-4736-9243-8e9250aec05d.jpg"
    ]
  },
  {
    "id": 6,
    "title": "Встреча друзей на Сретенском бульваре",
    "description": "Традиционная творческая гостиная под названием «Встреча друзей на Сретенском бульваре»",
    "content": "<p>4 октября в гимназии прошла традиционная творческая гостиная под названием «Встреча друзей на Сретенском бульваре». Тёплая, уютная обстановка, караоке и песни под гитару, осенние мультики и вкусный травяной чай, приобретённый на благотворительной ярмарке и теперь согревший друзей - в актовом зале собрались не просто ученики и педагоги, а большая дружная семья.<br>Неожиданным подарком для всех стало потрясающее исполнение романса духовником нашей гимназии о. Иоанном под аккомпанемент матушки Анны.<br>Творческий вечер стал не просто мероприятием, а настоящим праздником общения, тепла и взаимной благодарности.</p><p>\"Дорогие ребята!</p><div>Зрители и гости до сих пор под огромным впечатлением от вчерашней Творческой гостиной! Прошёл уже целый день, а эмоции не утихают — этот вечер по-прежнему живёт в сердце.&nbsp;</div><div>Вы не просто выступили — вы создали настоящее чудо. Было видно, сколько души, сил и старания вы вложили в каждую минуту. Каждый жест, каждое слово, каждая пауза — всё было наполнено смыслом и искренностью.</div><div>Спасибо вам за ваш талант, за смелость и за те глубокие эмоции, которые вы подарили нам. Именно благодаря таким моментам по-настоящему понимаешь, что значит слово «любовь».&nbsp;</div><div>От всей души благодарим всех участников и организаторов!\"</div><div><br></div><a href=\"https://vkvideo.ru/video-178231686_456239712\">ПОСТ В ВК</a>",
    "category": "creativity",
    "date": "4 октября 2026",
    "image": "/uploads/news/0cc93002-c759-4b36-bdd4-9db6f2b7c881.jpg",
    "images": [
      "/uploads/news/0cc93002-c759-4b36-bdd4-9db6f2b7c881.jpg",
      "/uploads/news/60889ee2-8a95-4c47-903b-6ff03c01579d.jpg"
    ]
  },
  {
    "id": 5,
    "title": "Память прп. Сергия Радонежского",
    "description": "Небесный покровитель третьеклассников",
    "content": "<p>Небесный покровитель третьеклассников</p><div>8 сентября, в день памяти преподобного Сергия Радонежского, в гимназическом храме для учащихся 3 класса прошла Божественная литургия.</div><div>Этот день для ребят особенный: преподобный Сергий Радонежский — их небесный покровитель. Именно ему они доверяют свои молитвы, у него просят помощи в учёбе и добрых делах.</div><div>К сожалению, не все третьеклассники смогли прийти в храм: у ребят каникулы, и многие уехали из города. Но, несмотря на это, праздник состоялся — тёплый, светлый и по-настоящему объединяющий.</div><div>Такие моменты напоминают: даже в разгар каникул есть место для главного — для молитвы, встречи с Богом и памяти о своём небесном заступнике.</div>",
    "category": "spiritual",
    "date": "8 сентября 2026 год",
    "image": "/uploads/news/4cdfebd5-ddb0-4132-80db-9eb6f6af56e5.jpg",
    "images": [
      "/uploads/news/4cdfebd5-ddb0-4132-80db-9eb6f6af56e5.jpg",
      "/uploads/news/de60225b-504e-431f-9860-be30212da692.jpg"
    ]
  },
  {
    "id": 4,
    "title": "Мы рады за наших выпускников!",
    "description": "Наши выпускники в вузах!",
    "content": "Вот и наступил новый учебный год… Но в коридорах и классах стало заметно тише. Уже без наших дорогих выпускников, бывших одиннадцатиклассников, привычная жизнь кажется немного другой.\n\nНам искренне не хватает их радостного смеха, кипучей активности, той особой теплоты и заботы, которые они привносили в каждый день. Это были не просто ученики - это были старшие друзья и помощники для младших, гордость и опора для учителей.\nНо грусть расставания светла, ведь они отправились в большое плавание. Наши ребята поступили в замечательные ВУЗы! Мы от всей души желаем им помощи Божией на этом новом пути. Пусть знания даются легко, пусть встречаются добрые наставники и верные друзья. Пусть всё у них будет хорошо!\nМы гордимся вами и всегда ждем в гости. В добрый путь!\n Наши ребята поступили:\n• Андреева Анастасия — Православный Свято-Тихоновский гуманитарный университет, факультет — теология;\n• Вещина Ульяна — Нижегородский государственный педагогический университет имени К. Минина, факультет — иностранный язык (английский) и русский, как иностранный;\n• Киселев Артем — Ковровский государственный технологический университет им.В.А.Дегтярева — информатика и вычислительная техника;\n• Малышева Варвара —Ивановский государственный университет — отечественная филология;\n• Мочалова Варвара — Шуйский филиал «Ивановского государственного университета» — педагогическое образование (с профилями подготовки — история, география);\n• Платанная Софья — Православный Свято-Тихоновский гуманитарный университет — экономика;\n• Шердиц Дарья — Российская академия народного хозяйства и государственной службы при Президенте РФ (Владимирский филиал) — управление персоналом;\n• Щеткина Ульяна — Православный Свято-Тихоновский гуманитарный университет — филология;\n• Хамитова Валерия — Православный Свято-Тихоновский гуманитарный университет — история",
    "category": "holidays",
    "date": "19 сентября",
    "image": "/uploads/news/1c03a998-e18c-4857-8a54-6fea18e0cfd6.jpg",
    "images": [
      "/uploads/news/1c03a998-e18c-4857-8a54-6fea18e0cfd6.jpg"
    ]
  },
  {
    "id": 3,
    "title": "Наши спортивные перемены",
    "description": "На переменах гимназисты любят размяться и поиграть в веселые игры.",
    "content": "На уроках ребята устают сидеть за партой. Поэтому на переменках гимназисты любят размяться и поиграть в спортивные веселые игры. А учителя и руководство всячески это поддерживают.",
    "category": "sport",
    "date": "19 сентября",
    "image": "/uploads/news/75c060d9-c29e-4055-992d-02ca360c8897.jpg",
    "images": [
      "/uploads/news/420541f1-a844-457a-bd95-854b5c9dc784.jpg",
      "/uploads/news/75c060d9-c29e-4055-992d-02ca360c8897.jpg"
    ]
  },
  {
    "id": 2,
    "title": "Летний лагерь в Троицко-Никольском",
    "description": "8 июня стартовал летний лагерь «Оркестр» при Свято-Никольском храме.",
    "content": "<p>Летний лагерь — это время радости, открытий и крепкой дружбы. Ребята участвуют в творческих мастерских, походах, спортивных играх и совместных молитвах на свежем воздухе.</p>",
    "category": "camp",
    "date": "8 июня 2026",
    "image": "assets/images/news/troickoe-camp.webp",
    "images": [
      "assets/images/news/troickoe-camp.webp"
    ]
  },
  {
    "id": 1,
    "title": "Награждение победителей фестиваля «Шатёр Андрея Боголюбского»",
    "description": "В гимназии состоялось торжественное награждение победителей и участников творческого фестиваля.",
    "content": "<p>В гимназии состоялось торжественное награждение победителей и призёров фестиваля «Шатёр Андрея Боголюбского». Гимназисты представили сценические зарисовки, хоровые композиции и художественные работы.</p>",
    "category": "creativity",
    "date": "15 мая 2026",
    "image": "assets/images/news/award-festival.webp",
    "images": [
      "assets/images/news/award-festival.webp"
    ]
  }
];

function normalizeNewsCategory(item) {
	if (!item) return "education";
	const id = Number(item.id);
	const title = String(item.title || "").toLowerCase();
	const cat = String(item.category || "").toLowerCase();

	if (id === 11 || id === 5 || title.includes("духовник") || title.includes("литурги") || title.includes("сергия радонежского") || title.includes("храм") || title.includes("чин прощения") || title.includes("память святит") || title.includes("молебен")) {
		return "spiritual";
	}
	if (id === 6 || id === 1 || title.includes("сретенском бульваре") || title.includes("театр") || title.includes("хор") || title.includes("фестивал") || title.includes("чтецов") || title.includes("гостиная")) {
		return "creativity";
	}
	if (id === 2 || title.includes("лагерь") || title.includes("практика") || title.includes("субботник")) {
		return "camp";
	}
	if (cat && ["education", "spiritual", "creativity", "holidays", "pilgrimage", "sport", "camp"].includes(cat)) {
		return cat;
	}
	return "education";
}

async function loadNews() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			throw new Error(`Ошибка сервера: ${response.status}`);
		}
		news = await response.json();
		news.forEach(item => {
			item.category = normalizeNewsCategory(item);
		});
		console.log("Новости загружены:", news);
		updateNews();
		animateInitialNews();
		handleNewsScrollReturn();
	} catch (error) {
		console.warn("Backend API недоступен, загружаем новости из встроенной базы данных:", error);
		useLocalAssets = true;
		news = FALLBACK_NEWS;
		news.forEach(item => {
			item.category = normalizeNewsCategory(item);
		});
		updateNews();
		animateInitialNews();
		handleNewsScrollReturn();
	}
}


// ========================================
// Создание карточки новости
// ========================================

function createNewsCard(item) {
	const newsUrl = `news.html?id=${item.id}`;

	return `
		<article
			class="sub-news-card"
			id="news-${item.id}"
			data-category="${item.category}"
			data-id="${item.id}"
		>

			<a href="${newsUrl}" class="sub-news-card__img-wrap" tabindex="-1" aria-hidden="true">

				<img
					src="${getImageUrl(item.image)}"
					alt="${item.title}"
					class="sub-news-card__img"
					loading="lazy"
					decoding="async"
				>

			</a>


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

					<a href="${newsUrl}">
						${item.title}
					</a>

				</h3>


				<p class="sub-news-card__excerpt">
					${item.description}
				</p>


				<a
					href="${newsUrl}"
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

		spiritual:
			"Духовная жизнь",

		creativity:
			"Творчество и театр",

		holidays:
			"Традиции и праздники",

		pilgrimage:
			"Паломничество и экскурсии",

		sport:
			"Спорт и ВПК",

		camp:
			"Лагерь и практика"

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

	featuredNews.id = `news-${item.id}`;
	featuredNews.dataset.id = String(item.id);


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

	if (featuredTitle.tagName === "A") {
		featuredTitle.href = `news.html?id=${item.id}`;
	}


	featuredDescription.textContent =
		item.description;


	featuredLink.href =
		`news.html?id=${item.id}`;

	const featuredImgLink =
		document.getElementById("featured-news-img-link");
	if (featuredImgLink) {
		featuredImgLink.href = `news.html?id=${item.id}`;
	}


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
			"inline-flex";
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
		if (useLocalAssets || window.location.protocol === "file:" || !window.API_BASE_URL) {
			return image.replace(/^\//, "");
		}

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
// Переход к новости по клику на любую область карточки
// ========================================

// Фиксируем ID просматриваемой новости при любом клике на карточку или ссылку внутри неё
document.addEventListener("click", (e) => {
	const card = e.target.closest(".sub-news-card, .featured-news");
	if (card && card.dataset.id) {
		sessionStorage.setItem("return_to_news_id", String(card.dataset.id));
	}
}, { capture: true });

function handleCardNavigation(card, e) {
	// Если пользователь выделяет текст — не переходим (чтобы можно было скопировать текст)
	const selection = window.getSelection();
	if (selection && selection.toString().trim().length > 0) {
		return;
	}

	if (card.dataset.id) {
		sessionStorage.setItem("return_to_news_id", String(card.dataset.id));
	}

	// Если клик пришёлся непосредственно по ссылке <a>, браузер перейдёт нативно
	if (e.target.closest("a")) {
		return;
	}

	const link = card.querySelector(".sub-news-card__more-link") || card.querySelector("a");
	const url = link ? link.getAttribute("href") : (card.dataset.id ? `news.html?id=${card.dataset.id}` : null);

	if (url && url !== "#") {
		if (e.ctrlKey || e.metaKey || e.button === 1) {
			window.open(url, "_blank");
		} else {
			window.location.href = url;
		}
	}
}

if (newsList) {
	newsList.addEventListener("click", (e) => {
		const card = e.target.closest(".sub-news-card");
		if (card) {
			handleCardNavigation(card, e);
		}
	});

	newsList.addEventListener("auxclick", (e) => {
		if (e.button !== 1) return; // Средняя кнопка мыши (колесико)
		if (e.target.closest("a")) return;

		const card = e.target.closest(".sub-news-card");
		if (card) {
			const link = card.querySelector(".sub-news-card__more-link") || card.querySelector("a");
			const url = link ? link.getAttribute("href") : (card.dataset.id ? `news.html?id=${card.dataset.id}` : null);
			if (url && url !== "#") {
				window.open(url, "_blank");
			}
		}
	});
}

if (featuredNews) {
	featuredNews.addEventListener("click", (e) => {
		const selection = window.getSelection();
		if (selection && selection.toString().trim().length > 0) {
			return;
		}

		if (e.target.closest("a")) {
			return;
		}

		const url = featuredLink ? featuredLink.getAttribute("href") : null;
		if (url && url !== "#") {
			if (e.ctrlKey || e.metaKey || e.button === 1) {
				window.open(url, "_blank");
			} else {
				window.location.href = url;
			}
		}
	});

	featuredNews.addEventListener("auxclick", (e) => {
		if (e.button !== 1) return;
		if (e.target.closest("a")) return;

		const url = featuredLink ? featuredLink.getAttribute("href") : null;
		if (url && url !== "#") {
			window.open(url, "_blank");
		}
	});
}


// ========================================
// Возврат к новости при переходе со страницы новостей
// ========================================

function handleNewsScrollReturn() {
	let returnId = sessionStorage.getItem("return_to_news_id");
	const hash = window.location.hash;

	if (!returnId && hash && hash.startsWith("#news-")) {
		returnId = hash.replace("#news-", "");
	}

	sessionStorage.removeItem("return_to_news_id");

	let targetElement = null;

	if (returnId) {
		const targetId = Number(returnId);
		if (!isNaN(targetId)) {
			// Если новость находится дальше visibleCards, разворачиваем список
			const filteredNews = news.filter(item => selectedCategory === "all" || item.category === selectedCategory);
			const itemIndex = filteredNews.findIndex(item => item.id === targetId);
			if (itemIndex > 0 && itemIndex >= visibleCards) {
				visibleCards = Math.ceil((itemIndex + 1) / 3) * 3;
				updateNews();
			}
			targetElement = document.getElementById(`news-${targetId}`);
		}
	}

	if (!targetElement && hash) {
		try {
			targetElement = document.querySelector(hash);
		} catch (e) {
			targetElement = null;
		}
	}

	if (targetElement) {
		setTimeout(() => {
			targetElement.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});

			targetElement.classList.add("news-card--highlighted");
			setTimeout(() => {
				targetElement.classList.remove("news-card--highlighted");
			}, 2200);
		}, 180);
	}
}

// Восстановление позиции при возврате через bfcache браузера
window.addEventListener("pageshow", (event) => {
	const returnId = sessionStorage.getItem("return_to_news_id");
	if (returnId) {
		sessionStorage.removeItem("return_to_news_id");
		const targetElement = document.getElementById(`news-${returnId}`);
		if (targetElement) {
			setTimeout(() => {
				targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
				targetElement.classList.add("news-card--highlighted");
				setTimeout(() => targetElement.classList.remove("news-card--highlighted"), 2200);
			}, 100);
		}
	}
});

// ========================================
// Запуск
// ========================================

loadNews();

// ========================================
// Утилиты медиа и экранирования
// ========================================
function resolvePublicMediaUrl(url) {
	if (!url) return "";
	if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
		return url;
	}
	if (url.startsWith("/uploads") || url.startsWith("uploads/")) {
		const clean = url.startsWith("/") ? url : `/${url}`;
		const base = window.API_BASE_URL || "";
		return `${base}${clean}`;
	}
	return url;
}

function escapeHtml(str) {
	if (str === null || str === undefined) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

// ========================================
// Интерактивная студия и репертуар театра «Встреча»
// ========================================
async function initTheatreRepertoire() {
	const list = document.getElementById("theatre-plays-list") || document.querySelector(".theatre-plays__list");
	const thumbsContainer = document.getElementById("theatre-gallery-thumbs") || document.querySelector(".theatre-gallery__thumbs");
	const mainImg = document.getElementById("theatre-main-img");
	const mainCaption = document.getElementById("theatre-main-caption");
	const videoLink = document.getElementById("theatre-video-link") || document.querySelector(".theatre-video-link");

	if (!list) return;

	try {
		const res = await fetch(`${window.API_BASE_URL || ""}/api/life/theatre-plays`);
		if (!res.ok) throw new Error("HTTP " + res.status);
		const plays = await res.json();
		if (!Array.isArray(plays) || !plays.length) throw new Error("Empty plays");

		// 1. Выводим плашки репертуара из базы данных
		list.innerHTML = "";
		plays.forEach((play, index) => {
			const span = document.createElement("span");
			span.className = `theatre-play-pill ${index === 0 ? "active" : ""}`;
			span.textContent = `🎭 «${play.title}»${play.year ? ` (${play.year})` : ""}`;
			if (play.awards) {
				span.title = `Награда: ${play.awards}`;
			}
			span.style.cursor = "pointer";

			span.addEventListener("click", () => {
				list.querySelectorAll(".theatre-play-pill").forEach((p) => p.classList.remove("active"));
				span.classList.add("active");
				selectTheatrePlay(play);
				if (thumbsContainer) {
					thumbsContainer.querySelectorAll(".theatre-gallery__thumb").forEach((t) => {
						const match = t.getAttribute("data-play-id") == play.id;
						t.classList.toggle("active", match);
					});
				}
			});

			list.appendChild(span);
		});

		// 2. Если у спектаклей есть фото, динамически обновляем миниатюры галереи
		const playsWithPhotos = plays.filter((p) => Boolean(p.photo_url));
		if (thumbsContainer && playsWithPhotos.length > 0) {
			thumbsContainer.innerHTML = "";
			playsWithPhotos.forEach((play, index) => {
				const resolvedPhoto = resolvePublicMediaUrl(play.photo_url);
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `theatre-gallery__thumb ${index === 0 ? "active" : ""}`;
				btn.setAttribute("data-src", resolvedPhoto);
				btn.setAttribute("data-play-id", play.id);
				let cap = `Спектакль «${play.title}»`;
				if (play.year) cap += ` (${play.year} г.)`;
				if (play.awards) cap += ` — 🏆 ${play.awards}`;
				btn.setAttribute("data-caption", cap);
				btn.setAttribute("aria-label", `Спектакль «${play.title}»`);

				btn.innerHTML = `<img src="${resolvedPhoto}" alt="${escapeHtml(play.title)}" loading="lazy">`;

				btn.addEventListener("click", () => {
					thumbsContainer.querySelectorAll(".theatre-gallery__thumb").forEach((t) => t.classList.remove("active"));
					btn.classList.add("active");
					selectTheatrePlay(play);
					list.querySelectorAll(".theatre-play-pill").forEach((p, pIdx) => {
						p.classList.toggle("active", plays[pIdx] && plays[pIdx].id === play.id);
					});
				});

				thumbsContainer.appendChild(btn);
			});
		}

		function selectTheatrePlay(play) {
			const photoUrl = resolvePublicMediaUrl(play.photo_url);
			if (mainImg && photoUrl) {
				mainImg.style.opacity = "0.4";
				setTimeout(() => {
					mainImg.src = photoUrl;
					mainImg.alt = `Спектакль «${play.title}»`;
					mainImg.style.opacity = "1";
				}, 130);
			}
			if (mainCaption) {
				let cap = `Спектакль «${play.title}»`;
				if (play.year) cap += ` (${play.year} г.)`;
				if (play.awards) cap += ` — 🏆 ${play.awards}`;
				mainCaption.textContent = cap;
			}
			if (videoLink) {
				if (play.video_url) {
					videoLink.href = play.video_url;
					videoLink.style.display = "inline-flex";
				} else {
					videoLink.href = "https://vkvideo.ru/video-178231686_456239608?t=16m";
				}
			}
		}

		if (plays.length > 0) {
			selectTheatrePlay(plays[0]);
		}
	} catch (e) {
		// Оффлайн фоллбэк: сохраняем интерактивность статических миниатюр
		initStaticTheatreGallery();
	}
}

function initStaticTheatreGallery() {
	const thumbs = document.querySelectorAll(".theatre-gallery__thumb");
	const mainImg = document.getElementById("theatre-main-img");
	const caption = document.getElementById("theatre-main-caption");
	if (!thumbs.length || !mainImg || !caption) return;

	thumbs.forEach((thumb) => {
		thumb.addEventListener("click", () => {
			if (thumb.classList.contains("active")) return;
			thumbs.forEach((t) => t.classList.remove("active"));
			thumb.classList.add("active");

			const nextSrc = thumb.getAttribute("data-src");
			const nextCaption = thumb.getAttribute("data-caption");

			mainImg.style.opacity = "0.4";
			setTimeout(() => {
				mainImg.src = nextSrc;
				mainImg.alt = nextCaption || "";
				caption.textContent = nextCaption || "";
				mainImg.style.opacity = "1";
			}, 130);
		});
	});
}

initTheatreRepertoire();


// ========================================
// Медиа-архив газеты «Доброе слово» и просмотрщик PDF
// ========================================
async function initNewspaperArchive() {
	const grid = document.getElementById("newspaper-grid");
	const tabsContainer = document.getElementById("newspaper-tabs") || document.querySelector(".newspaper-tabs");
	const countIndicator = document.getElementById("newspaper-visible-count");
	const loadMoreWrap = document.getElementById("newspaper-load-more-wrap");
	const loadMoreBtn = document.getElementById("newspaper-load-more-btn");
	const loadMoreText = document.getElementById("newspaper-load-more-text");
	const statCountEl = document.getElementById("newspaper-stat-count") || document.querySelector(".newspaper-stat-badge");

	const modal = document.getElementById("newspaper-modal");
	const backdrop = document.getElementById("newspaper-modal-backdrop");
	const closeBtn = document.getElementById("newspaper-modal-close");
	const iframe = document.getElementById("newspaper-modal-iframe");
	const titleEl = document.getElementById("newspaper-modal-title");
	const openNewBtn = document.getElementById("newspaper-modal-open-new");
	const downloadBtn = document.getElementById("newspaper-modal-download");

	if (!grid) return;

	const BATCH_SIZE = 4;
	let currentLimit = BATCH_SIZE;
	let activeYear = "all";
	let allIssues = [];

	// Пробуем загрузить свежие выпуски из API базы данных
	try {
		const res = await fetch(`${window.API_BASE_URL || ""}/api/life/newspapers`);
		if (res.ok) {
			const data = await res.json();
			if (Array.isArray(data) && data.length > 0) {
				allIssues = data;
			}
		}
	} catch (e) {
		console.warn("Оффлайн-режим: используем статический архив газеты");
	}

	// Если получены данные из API — пересоздаем карточки и вкладки по годам
	if (allIssues.length > 0) {
		if (statCountEl) {
			statCountEl.textContent = `📑 ${allIssues.length} оцифрованных выпусков`;
		}

		// Считаем выпуски по годам
		const yearCounts = {};
		allIssues.forEach((issue) => {
			const y = String(issue.year || "").trim();
			if (!y) return;
			yearCounts[y] = (yearCounts[y] || 0) + 1;
		});

		const sortedYears = Object.keys(yearCounts).sort((a, b) => {
			const na = parseInt(a, 10) || 0;
			const nb = parseInt(b, 10) || 0;
			return nb - na;
		});

		if (tabsContainer) {
			let tabsHtml = `<button type="button" class="newspaper-tab active" data-year="all">Все выпуски (${allIssues.length})</button>`;
			sortedYears.forEach((y) => {
				const count = yearCounts[y];
				const isSpecial = allIssues.some((i) => String(i.year) === y && i.is_special);
				const label = isSpecial ? `${y} (Спецвыпуск)` : `${y} год (${count})`;
				tabsHtml += `<button type="button" class="newspaper-tab" data-year="${y}">${escapeHtml(label)}</button>`;
			});
			tabsContainer.innerHTML = tabsHtml;
		}

		let gridHtml = "";
		allIssues.forEach((issue) => {
			const isSpec = Boolean(issue.is_special);
			const specClass = isSpec ? "newspaper-card--special" : "";
			const badgeText = isSpec ? "Спецвыпуск" : `${escapeHtml(String(issue.year))} год`;
			const fileSizeText = issue.file_size ? `${escapeHtml(issue.file_size)} • PDF` : "PDF документ";
			const fileUrl = resolvePublicMediaUrl(issue.file_url);
			const downloadFilename = issue.file_url ? issue.file_url.split("/").pop() : "gazeta.pdf";
			const subText = issue.subtitle ? escapeHtml(issue.subtitle) : "";
			const descText = issue.description ? escapeHtml(issue.description) : "";

			gridHtml += `
				<article class="newspaper-card ${specClass}" data-year="${escapeHtml(String(issue.year))}" data-issue-id="${issue.id}">
					<a href="${escapeHtml(fileUrl)}" target="_blank" class="newspaper-card__cover" title="Открыть выпуск ${escapeHtml(issue.title)}">
						<div class="cover-masthead">
							<span class="cover-school">Православная гимназия</span>
							<span class="cover-name">ДОБРОЕ СЛОВО</span>
							<div class="cover-rule"></div>
						</div>
						<div class="cover-meta">
							<span class="cover-num">${escapeHtml(issue.number)}</span>
							${subText ? `<span class="cover-badge-tag">${subText}</span>` : ""}
						</div>
						<div class="cover-preview-lines">
							<div class="cover-line"></div>
							<div class="cover-line short"></div>
							<div class="cover-line"></div>
						</div>
					</a>

					<div class="newspaper-card__body">
						<div class="newspaper-card__header">
							<span class="newspaper-card__year-badge">${badgeText}</span>
							<span class="newspaper-card__filesize">${fileSizeText}</span>
						</div>
						<h4 class="newspaper-card__title">
							<a href="${escapeHtml(fileUrl)}" target="_blank" style="color:inherit; text-decoration:none;">${escapeHtml(issue.title)}</a>
						</h4>
						${descText ? `<p class="newspaper-card__desc">${descText}</p>` : ""}
						<div class="newspaper-card__actions">
							<a href="${escapeHtml(fileUrl)}" target="_blank" class="btn-read-issue"
								data-pdf="${escapeHtml(fileUrl)}"
								data-title="Газета «Доброе слово» — ${escapeHtml(issue.title)}">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
									<circle cx="12" cy="12" r="3"></circle>
								</svg>
								Читать онлайн
							</a>
							<a href="${escapeHtml(fileUrl)}" download="${escapeHtml(downloadFilename)}" target="_blank"
								class="btn-download-icon" title="Скачать PDF (${fileSizeText})" aria-label="Скачать PDF">
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
									<polyline points="7 10 12 15 17 10"></polyline>
									<line x1="12" y1="15" x2="12" y2="3"></line>
								</svg>
							</a>
						</div>
					</div>
				</article>
			`;
		});
		grid.innerHTML = gridHtml;
	}

	const cards = Array.from(grid.querySelectorAll(".newspaper-card"));
	const tabs = tabsContainer ? Array.from(tabsContainer.querySelectorAll(".newspaper-tab")) : [];

	function updateDisplay(isLoadMoreClick) {
		const matchingCards = cards.filter((card) => {
			const cardYear = card.getAttribute("data-year");
			return activeYear === "all" || cardYear === activeYear;
		});

		const totalMatching = matchingCards.length;

		cards.forEach((card) => {
			const cardYear = card.getAttribute("data-year");
			if (activeYear !== "all" && cardYear !== activeYear) {
				card.style.display = "none";
				card.classList.add("newspaper-card--hidden");
				card.classList.remove("newspaper-card--revealed");
			}
		});

		matchingCards.forEach((card, index) => {
			if (index < currentLimit) {
				const wasHidden = card.classList.contains("newspaper-card--hidden") || card.style.display === "none";
				card.style.display = "";
				card.classList.remove("newspaper-card--hidden");
				if (wasHidden && isLoadMoreClick) {
					card.classList.add("newspaper-card--revealed");
				}
			} else {
				card.style.display = "none";
				card.classList.add("newspaper-card--hidden");
				card.classList.remove("newspaper-card--revealed");
			}
		});

		const currentlyVisible = Math.min(currentLimit, totalMatching);

		if (countIndicator) {
			countIndicator.textContent = `${currentlyVisible} из ${totalMatching}`;
		}

		if (loadMoreWrap && loadMoreBtn) {
			if (currentLimit < totalMatching) {
				loadMoreWrap.style.display = "flex";
				loadMoreBtn.style.display = "inline-flex";
				const remaining = totalMatching - currentLimit;
				const nextBatch = Math.min(BATCH_SIZE, remaining);
				if (loadMoreText) {
					loadMoreText.textContent = `Показать ещё выпуски (+${nextBatch})`;
				}
			} else {
				loadMoreWrap.style.display = "none";
			}
		}
	}

	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			activeYear = tab.getAttribute("data-year") || "all";
			tabs.forEach((t) => t.classList.remove("active"));
			tab.classList.add("active");
			currentLimit = BATCH_SIZE;
			updateDisplay(false);
		});
	});

	if (loadMoreBtn) {
		loadMoreBtn.onclick = () => {
			currentLimit += BATCH_SIZE;
			updateDisplay(true);
		};
	}

	function openPdf(pdfUrl, title) {
		if (!pdfUrl) return;
		const isFileProtocol = window.location.protocol === "file:";

		if (isFileProtocol || !modal || !iframe) {
			window.open(pdfUrl, "_blank");
			return;
		}

		if (titleEl) titleEl.textContent = title || "Просмотр газеты";
		if (openNewBtn) openNewBtn.href = pdfUrl;
		if (downloadBtn) {
			downloadBtn.href = pdfUrl;
			const fname = pdfUrl.split("/").pop();
			if (fname) downloadBtn.setAttribute("download", decodeURIComponent(fname));
		}

		iframe.src = pdfUrl;
		modal.style.display = "flex";
		modal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}

	function closePdfModal() {
		if (!modal) return;
		modal.style.display = "none";
		modal.setAttribute("aria-hidden", "true");
		if (iframe) iframe.src = "";
		document.body.style.overflow = "";
	}

	grid.onclick = (e) => {
		const readBtn = e.target.closest(".btn-read-issue, .btn-read-pdf");
		if (readBtn) {
			const pdfUrl = readBtn.getAttribute("data-pdf") || readBtn.getAttribute("href");
			const title = readBtn.getAttribute("data-title");
			if (pdfUrl && window.location.protocol !== "file:") {
				e.preventDefault();
				openPdf(pdfUrl, title);
			}
		}
	};

	if (closeBtn) closeBtn.onclick = closePdfModal;
	if (backdrop) backdrop.onclick = closePdfModal;

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal && modal.style.display === "flex") {
			closePdfModal();
		}
	});

	updateDisplay(false);
}

initNewspaperArchive();


// ========================================
// Интерактивные смены пришкольного лагеря
// ========================================
async function initCampShifts() {
	const pillsContainer = document.getElementById("camp-shifts-pills");
	const activeDetails = document.getElementById("camp-active-details");
	const activeTitle = document.getElementById("camp-active-title");
	const activeDates = document.getElementById("camp-active-dates");
	const activeDesc = document.getElementById("camp-active-desc");
	const albumBtn = document.getElementById("camp-active-album-btn");
	const albumBtnText = document.getElementById("camp-album-btn-text");
	const mediaImg = document.getElementById("camp-media-img");
	const mediaCaption = document.getElementById("camp-media-caption");

	if (!pillsContainer) return;

	try {
		const res = await fetch(`${window.API_BASE_URL || ""}/api/life/camp-shifts`);
		if (!res.ok) return;
		const shifts = await res.json();
		if (!Array.isArray(shifts) || !shifts.length) return;

		pillsContainer.innerHTML = "";

		shifts.forEach((shift, index) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `camp-shift-pill ${index === 0 ? "active" : ""}`;
			btn.setAttribute("data-year", shift.year);

			let badgeText = "";
			if (shift.status === "upcoming") badgeText = "Запись";
			else if (shift.vk_album_url) badgeText = "Альбом";

			btn.innerHTML = `<span>${shift.year} год</span>${badgeText ? `<span class="camp-shift-pill__badge">${badgeText}</span>` : ""}`;

			btn.addEventListener("click", () => {
				pillsContainer.querySelectorAll(".camp-shift-pill").forEach((p) => p.classList.remove("active"));
				btn.classList.add("active");
				renderShiftDetails(shift);
			});

			pillsContainer.appendChild(btn);
		});

		function renderShiftDetails(shift) {
			if (activeDetails) {
				activeDetails.style.display = "block";
				if (activeTitle) activeTitle.textContent = shift.title || `Летняя смена ${shift.year} года`;
				if (activeDates) activeDates.textContent = shift.dates ? `📅 Сроки проведения: ${shift.dates}` : "";
				if (activeDesc) activeDesc.textContent = shift.description || "";
			}
			if (albumBtn) {
				if (shift.vk_album_url) {
					albumBtn.href = shift.vk_album_url;
					albumBtn.style.display = "inline-flex";
					if (albumBtnText) albumBtnText.textContent = `Фотоальбом смены ${shift.year} года в VK`;
				} else {
					albumBtn.href = "https://vk.com/album-178231686_295083175";
					if (albumBtnText) albumBtnText.textContent = `Фотоальбом лагеря в VK (${shift.year} г.)`;
				}
			}
			const photoUrl = resolvePublicMediaUrl(shift.photo_url);
			if (mediaImg && photoUrl) {
				mediaImg.src = photoUrl;
			}
			if (mediaCaption) {
				mediaCaption.textContent = shift.title || `Летний отдых воспитанников гимназии (${shift.year} г.)`;
			}
		}

		renderShiftDetails(shifts[0]);
	} catch (e) {
		// Оффлайн фоллбэк: оставляем статическую разметку
	}
}

initCampShifts();

})();
