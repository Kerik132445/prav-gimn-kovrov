(() => {
const API_URL = `${window.API_BASE_URL}/api/news/`;
let useLocalAssets = false;

const params = new URLSearchParams(window.location.search);
const rawId = params.get("id");
// Если указан конкретный числовой ID — используем его, иначе null (загружаем последнюю новость динамически)
const newsId = (rawId && !isNaN(Number(rawId))) ? Number(rawId) : null;

const newsBreadcrumbTitle =
	document.getElementById("news-breadcrumb-title");

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
		if (useLocalAssets || window.location.protocol === "file:" || !window.API_BASE_URL) {
			return image.replace(/^\//, "");
		}
		return `${window.API_BASE_URL}${image}`;
	}

	return image;
}

function applyLocalImageFallback(imgElement, rawSource) {
	if (!imgElement || imgElement.dataset.localFallbackApplied) {
		return;
	}
	const raw = typeof rawSource === "object" && rawSource ? rawSource.image : rawSource;
	const localPath = String(raw || "").replace(/^\//, "");
	if (localPath) {
		imgElement.dataset.localFallbackApplied = "1";
		imgElement.src = localPath;
	}
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
	// Сценарий 1: Пользователь перешёл на news.html без ID (например, из футера или меню)
	// В этом случае динамически запрашиваем самую свежую новость на текущий момент времени
	if (!newsId) {
		try {
			const listResponse = await fetch(API_URL);
			if (listResponse.ok) {
				const allNews = await listResponse.json();
				if (Array.isArray(allNews) && allNews.length > 0) {
					// На бэкенде новости отсортированы по id.desc(), то есть allNews[0] — самая свежая
					const latestNews = allNews[0];
					console.log("Динамически получена последняя новость на данный момент:", latestNews);

					if (window.history && window.history.replaceState) {
						window.history.replaceState({ id: latestNews.id }, "", `news.html?id=${latestNews.id}`);
					}

					displayNews(latestNews);
					return;
				}
			}
			throw new Error("Не удалось получить список новостей с сервера");
		} catch (error) {
			console.warn("Backend API недоступен, загружаем последнюю новость из встроенного резерва:", error);
			useLocalAssets = true;
			const fallbackLatest = FALLBACK_NEWS[0];
			if (window.history && window.history.replaceState) {
				window.history.replaceState({ id: fallbackLatest.id }, "", `news.html?id=${fallbackLatest.id}`);
			}
			displayNews(fallbackLatest);
			return;
		}
	}

	// Сценарий 2: Запрошена конкретная новость по ID
	const fallbackItem = FALLBACK_NEWS.find(item => item.id === newsId);

	try {
		const response = await fetch(`${API_URL}${newsId}`);

		if (!response.ok) {
			if (response.status === 404) {
				if (fallbackItem) {
					useLocalAssets = true;
					displayNews(fallbackItem);
					return;
				}
				showNewsNotFound();
				return;
			}
			throw new Error(`Ошибка сервера: ${response.status}`);
		}

		const currentNews = await response.json();
		console.log("Новость загружена:", currentNews);
		displayNews(currentNews);

	} catch (error) {
		console.warn("Backend API недоступен, загружаем новость из встроенной базы данных:", error);

		if (fallbackItem) {
			useLocalAssets = true;
			displayNews(fallbackItem);
		} else {
			titleElement.textContent = "Не удалось загрузить новость";
			categoryElement.textContent = "";
			dateElement.textContent = "";
			contentElement.innerHTML = `
				<p>
					Произошла ошибка при загрузке новости.
				</p>
			`;
		}
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


	titleElement.textContent =
		currentNews.title;

	if (newsBreadcrumbTitle) {
		newsBreadcrumbTitle.textContent =
			currentNews.title;
	}

	if (newsBreadcrumbTitle) {
		newsBreadcrumbTitle.textContent =
			currentNews.title;
	}


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


		delete imageElement.dataset.localFallbackApplied;
		imageElement.src =
			getImageUrl(
				images[currentImageIndex]
			);

		imageElement.onerror = function() {
			applyLocalImageFallback(this, images[currentImageIndex]);
		};


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

		delete lightboxImage.dataset.localFallbackApplied;
		lightboxImage.src =
			getImageUrl(
				images[currentImageIndex]
			);

		lightboxImage.onerror = function() {
			applyLocalImageFallback(this, images[currentImageIndex]);
		};


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

			thumbnailImage.onerror = function() {
				applyLocalImageFallback(this, image);
			};


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
})();