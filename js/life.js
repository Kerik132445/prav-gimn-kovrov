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
    "category": "education",
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
    "category": "pilgrimage",
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
    "category": "education",
    "date": "19 сентября",
    "image": "/uploads/news/75c060d9-c29e-4055-992d-02ca360c8897.jpg",
    "images": [
      "/uploads/news/420541f1-a844-457a-bd95-854b5c9dc784.jpg",
      "/uploads/news/75c060d9-c29e-4055-992d-02ca360c8897.jpg"
    ]
  }
];

async function loadNews() {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			throw new Error(`Ошибка сервера: ${response.status}`);
		}
		news = await response.json();
		console.log("Новости загружены:", news);
		updateNews();
		animateInitialNews();
	} catch (error) {
		console.warn("Backend API недоступен, загружаем новости из встроенной базы данных:", error);
		news = FALLBACK_NEWS;
		updateNews();
		animateInitialNews();
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