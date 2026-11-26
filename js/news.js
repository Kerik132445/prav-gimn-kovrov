(() => {
const API_URL = `${window.API_BASE_URL || ""}/api/news/`;
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

let allNewsCache = [];

function escapeHtml(str) {
	if (str === null || str === undefined) return "";
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function calculateReadTime(text) {
	const words = (text || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.ceil(words / 160));
	return `${minutes} мин чтения`;
}

const VK_ICONS = {
	clip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="3" ry="3"></rect><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>`,
	video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`,
	wall: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
	album: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
	photo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
	article: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
	poll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
	doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
	audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
	live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
	group: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="M15.684 0H8.316C2.992 0 0 2.992 0 8.316v7.368C0 21.008 2.992 24 8.316 24h7.368C21.008 24 24 21.008 24 15.684V8.316C24 2.992 21.008 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.05-1.714-1.037-1.01-1.498-1.143-1.753-1.143-.356 0-.457.102-.457.593v1.657c0 .423-.135.677-1.252.677-1.846 0-3.896-1.118-5.334-3.199-2.167-3.073-2.76-5.394-2.76-5.867 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.779.677.847 2.472 2.27 4.64 2.862 4.64.22 0 .322-.102.322-.66v-2.59c-.068-1.185-.694-1.286-.694-1.71 0-.203.169-.406.44-.406h2.743c.373 0 .508.203.508.643v3.504c0 .373.169.508.288.508.237 0 .44-.135.88-.576 1.355-1.524 2.32-3.894 2.32-3.894.135-.271.356-.474.796-.474h1.744c.525 0 .643.271.525.643-.22 1.016-2.353 4.047-2.455 4.2-.17.271-.237.39 0 .711.17.237.745.728 1.135 1.168.711.813 1.253 1.49 1.405 1.964.153.474-.085.711-.56.711z"/></svg>`
};

function getVkMeta(url) {
	const cleanUrl = String(url || "").toLowerCase();

	if (cleanUrl.includes("clip") || cleanUrl.includes("/clips")) {
		return {
			type: "clip",
			subtitle: "VK Клип",
			defaultTitle: "Смотреть короткое видео (Клип)",
			numberedTitle: "VK Клип",
			action: "Смотреть клип →"
		};
	}
	if (cleanUrl.includes("video") || cleanUrl.includes("vkvideo.ru")) {
		return {
			type: "video",
			subtitle: "Видео ВКонтакте",
			defaultTitle: "Смотреть видеозапись в высоком качестве",
			numberedTitle: "Видеозапись",
			action: "Смотреть видео →"
		};
	}
	if (cleanUrl.includes("/wall")) {
		return {
			type: "wall",
			subtitle: "Запись ВКонтакте",
			defaultTitle: "Читать публикацию на стене сообщества",
			numberedTitle: "Запись на стене",
			action: "Читать пост →"
		};
	}
	if (cleanUrl.includes("/album")) {
		return {
			type: "album",
			subtitle: "Фотоальбом ВКонтакте",
			defaultTitle: "Смотреть полный фотоальбом с мероприятия",
			numberedTitle: "Фотоальбом",
			action: "Открыть альбом →"
		};
	}
	if (cleanUrl.includes("/photo")) {
		return {
			type: "photo",
			subtitle: "Фотография ВКонтакте",
			defaultTitle: "Смотреть фотографию в высоком качестве",
			numberedTitle: "Фотография",
			action: "Открыть фото →"
		};
	}
	if (cleanUrl.includes("/@") || cleanUrl.includes("/article") || cleanUrl.includes("vk.com/article") || cleanUrl.includes("vk.ru/article")) {
		return {
			type: "article",
			subtitle: "Статья ВКонтакте",
			defaultTitle: "Читать иллюстрированную статью",
			numberedTitle: "Статья",
			action: "Читать статью →"
		};
	}
	if (cleanUrl.includes("/poll")) {
		return {
			type: "poll",
			subtitle: "Опрос ВКонтакте",
			defaultTitle: "Принять участие в голосовании",
			numberedTitle: "Опрос",
			action: "Голосовать →"
		};
	}
	if (cleanUrl.includes("/doc")) {
		return {
			type: "doc",
			subtitle: "Документ ВКонтакте",
			defaultTitle: "Открыть прикреплённый документ",
			numberedTitle: "Документ",
			action: "Открыть файл →"
		};
	}
	if (cleanUrl.includes("/audio") || cleanUrl.includes("/playlist") || cleanUrl.includes("/music")) {
		return {
			type: "audio",
			subtitle: "Аудиозапись ВКонтакте",
			defaultTitle: "Слушать аудио / плейлист",
			numberedTitle: "Аудиозапись",
			action: "Слушать запись →"
		};
	}
	if (cleanUrl.includes("/live") || cleanUrl.includes("/call")) {
		return {
			type: "live",
			subtitle: "Трансляция ВКонтакте",
			defaultTitle: "Смотреть прямой эфир / запись",
			numberedTitle: "Трансляция",
			action: "Смотреть эфир →"
		};
	}
	return {
		type: "group",
		subtitle: "Сообщество ВКонтакте",
		defaultTitle: "Официальная страница гимназии",
		numberedTitle: "Страница сообщества",
		action: "Перейти →"
	};
}

function cleanVkUrl(rawUrl) {
	if (!rawUrl) return "";
	let url = rawUrl.trim();
	url = url.replace(/[.,!?;:)>]+$/, "");
	if (!/^https?:\/\//i.test(url)) {
		url = "https://" + url;
	}
	return url;
}

function transformContent(rawHtml) {
	if (!rawHtml) return "";
	let html = rawHtml;

	const DOMAIN_RE = `(?:(?:m\\.)?(?:vk\\.com|vk\\.ru|vk\\.me|vk\\.link)|vkvideo\\.ru)`;

	// Шаг 1: Предварительный подсчет ссылок каждого типа без кастомного текста
	const typeCounts = {};
	const scanRegex = new RegExp(`(?:<a\\s+[^>]*href=["']((?:https?:\\/\\/)?${DOMAIN_RE}\\/[^"']+)["'][^>]*>(.*?)<\\/a>)|(?:(?:https?:\\/\\/)?${DOMAIN_RE}\\/[^\\s<"']+)`, "gi");
	let match;
	while ((match = scanRegex.exec(html)) !== null) {
		const fullUrl = cleanVkUrl(match[1] || match[0]);
		const text = match[2];
		const hasCustomLabel = Boolean(text && !text.trim().startsWith("http") && !text.trim().includes("vk."));
		if (!hasCustomLabel && fullUrl) {
			const meta = getVkMeta(fullUrl);
			typeCounts[meta.type] = (typeCounts[meta.type] || 0) + 1;
		}
	}

	const currentIndices = {};

	function makeVkCard(rawUrl, customLabel) {
		const url = cleanVkUrl(rawUrl);
		const meta = getVkMeta(url);
		const iconSvg = VK_ICONS[meta.type] || VK_ICONS.group;

		let label = customLabel;
		if (!label || label.trim().startsWith("http") || label.trim().includes("vk.")) {
			const totalForType = typeCounts[meta.type] || 0;
			if (totalForType > 1) {
				currentIndices[meta.type] = (currentIndices[meta.type] || 0) + 1;
				label = `${meta.numberedTitle} #${currentIndices[meta.type]}`;
			} else {
				label = meta.defaultTitle;
			}
		}

		return `
			<a href="${url}" target="_blank" rel="noopener noreferrer" class="vk-post-card vk-post-card--${meta.type}">
				<div class="vk-post-card__badge">
					${iconSvg}
				</div>
				<div class="vk-post-card__content">
					<span class="vk-post-card__subtitle">${meta.subtitle}</span>
					<span class="vk-post-card__title">${label}</span>
				</div>
				<span class="vk-post-card__action">
					${meta.action}
				</span>
			</a>
		`;
	}

	// 1. Заменяем теги <p> или <div>, содержащие ТОЛЬКО ссылку <a> на VK
	const blockWithLinkRegex = new RegExp(`<(?:p|div)[^>]*>\\s*<a\\s+[^>]*href=["']((?:https?:\\/\\/)?${DOMAIN_RE}\\/[^"']+)["'][^>]*>(.*?)<\\/a>\\s*<\\/(?:p|div)>`, "gi");
	html = html.replace(blockWithLinkRegex, (match, url, text) => {
		const label = text && !text.startsWith("http") && !text.includes("vk.") ? text.trim() : null;
		return makeVkCard(url, label);
	});

	// 2. Заменяем теги <p> или <div>, содержащие ТОЛЬКО голый URL VK
	const blockWithBareRegex = new RegExp(`<(?:p|div)[^>]*>\\s*((?:https?:\\/\\/)?${DOMAIN_RE}\\/[^\\s<"']+)\\s*<\\/(?:p|div)>`, "gi");
	html = html.replace(blockWithBareRegex, (match, url) => {
		return makeVkCard(url);
	});

	// 3. Заменяем любые оставшиеся ссылки <a> на VK внутри текста
	const inlineLinkRegex = new RegExp(`<a\\s+[^>]*href=["']((?:https?:\\/\\/)?${DOMAIN_RE}\\/[^"']+)["'][^>]*>(.*?)<\\/a>`, "gi");
	html = html.replace(inlineLinkRegex, (match, url, text) => {
		const label = text && !text.startsWith("http") && !text.includes("vk.") ? text.trim() : null;
		return makeVkCard(url, label);
	});

	// 4. Заменяем любые оставшиеся голые URL VK в тексте
	const inlineBareRegex = new RegExp(`(^|[\\s>])((?:https?:\\/\\/)?${DOMAIN_RE}\\/[^\\s<"']+)`, "gi");
	html = html.replace(inlineBareRegex, (match, prefix, url) => {
		return prefix + makeVkCard(url);
	});

	return html;
}

function setupShareButtons(title) {
	const shareVk = document.getElementById("share-vk");
	const shareWa = document.getElementById("share-wa");
	const shareCopy = document.getElementById("share-copy");
	const copyText = document.getElementById("share-copy-text");

	const currentUrl = window.location.href;
	const newsTitle = title || document.title;
	const shareComment = "Смотри, что интересного прошло в гимназии!";

	if (shareVk) {
		shareVk.onclick = () => {
			const vkShareUrl = `https://vk.com/share.php?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(newsTitle)}&comment=${encodeURIComponent(shareComment)}`;
			window.open(vkShareUrl, "_blank", "width=640,height=480");
		};
	}

	if (shareWa) {
		shareWa.onclick = () => {
			const waText = `${shareComment}\n«${newsTitle}»\n${currentUrl}`;
			const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
			window.open(waShareUrl, "_blank", "width=640,height=520");
		};
	}

	if (shareCopy) {
		shareCopy.onclick = async () => {
			try {
				await navigator.clipboard.writeText(currentUrl);
				if (copyText) {
					const orig = copyText.textContent;
					copyText.textContent = "Скопировано! ✓";
					copyText.style.color = "#15803d";
					setTimeout(() => {
						copyText.textContent = orig;
						copyText.style.color = "";
					}, 2000);
				}
			} catch (e) {
				prompt("Скопируйте ссылку:", currentUrl);
			}
		};
	}
}

function setupPrevNextNav(currentId, allNews) {
	const prevLink = document.getElementById("news-prev-link");
	const prevTitle = document.getElementById("news-prev-title");
	const nextLink = document.getElementById("news-next-link");
	const nextTitle = document.getElementById("news-next-title");

	if (!allNews || !allNews.length) return;

	const numId = Number(currentId);
	const idx = allNews.findIndex(n => Number(n.id) === numId);
	if (idx === -1) return;

	// В списке новостей по убыванию ID:
	// idx + 1 — более ранняя (Предыдущая)
	// idx - 1 — более свежая (Следующая)
	if (idx + 1 < allNews.length) {
		const prev = allNews[idx + 1];
		if (prevLink && prevTitle) {
			prevLink.style.display = "flex";
			prevLink.href = `news.html?id=${prev.id}`;
			prevTitle.textContent = prev.title;
		}
	} else if (prevLink) {
		prevLink.style.display = "none";
	}

	if (idx - 1 >= 0) {
		const next = allNews[idx - 1];
		if (nextLink && nextTitle) {
			nextLink.style.display = "flex";
			nextLink.href = `news.html?id=${next.id}`;
			nextTitle.textContent = next.title;
		}
	} else if (nextLink) {
		nextLink.style.display = "none";
	}
}

function renderSidebarRecent(currentId, allNews) {
	const container = document.getElementById("sidebar-recent-list");
	if (!container || !allNews || !allNews.length) return;

	const numId = Number(currentId);
	const filtered = allNews.filter(n => Number(n.id) !== numId).slice(0, 4);

	if (!filtered.length) {
		container.innerHTML = `<p style="font-size:13px; color:#94a3b8; margin:0;">Пока нет других событий.</p>`;
		return;
	}

	container.innerHTML = filtered.map(item => {
		const rawImg = item.image || (item.images && item.images[0]) || "assets/images/og-preview.jpg";
		const imgSrc = getImageUrl(rawImg);
		const dateStr = item.date || "";
		return `
			<a href="news.html?id=${item.id}" class="recent-news-item">
				<img src="${imgSrc}" alt="" class="recent-news-item__thumb" loading="lazy" decoding="async" onerror="this.src='assets/images/og-preview.jpg'">
				<div class="recent-news-item__body">
					<span class="recent-news-item__date">${escapeHtml(dateStr)}</span>
					<h4 class="recent-news-item__title">${escapeHtml(item.title)}</h4>
				</div>
			</a>
		`;
	}).join("");
}

async function loadNews() {
	// 1. Предзагрузка общего списка новостей для сайдбара и навигации Предыдущая/Следующая
	try {
		const listRes = await fetch(API_URL);
		if (listRes.ok) {
			const data = await listRes.json();
			if (Array.isArray(data) && data.length > 0) {
				allNewsCache = data;
			}
		}
	} catch (e) {
		console.warn("Не удалось загрузить общий список новостей с API:", e);
	}

	if (!allNewsCache || !allNewsCache.length) {
		allNewsCache = FALLBACK_NEWS;
	}

	// Сценарий 1: Пользователь перешёл на news.html без ID (берем самую свежую новость)
	if (!newsId) {
		const latestNews = allNewsCache[0];
		if (window.history && window.history.replaceState && latestNews) {
			window.history.replaceState({ id: latestNews.id }, "", `news.html?id=${latestNews.id}`);
		}
		if (latestNews) {
			displayNews(latestNews);
		} else {
			showNewsNotFound();
		}
		return;
	}

	// Сценарий 2: Запрошена конкретная новость по ID
	const cachedItem = allNewsCache.find(item => Number(item.id) === Number(newsId));
	if (cachedItem) {
		displayNews(cachedItem);
		return;
	}

	// Если новость не нашлась в кеше, пробуем точечный запрос к API
	try {
		const response = await fetch(`${API_URL}${newsId}`);
		if (response.ok) {
			const currentNews = await response.json();
			displayNews(currentNews);
			return;
		}
	} catch (e) {}

	const fallbackItem = FALLBACK_NEWS.find(item => Number(item.id) === Number(newsId));
	if (fallbackItem) {
		useLocalAssets = true;
		displayNews(fallbackItem);
	} else {
		showNewsNotFound();
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

function displayNews(currentNews) {

	currentNews.category = normalizeNewsCategory(currentNews);

	document.title =
		`${currentNews.title} | Православная гимназия г. Коврова`;

	setupBackNavigation(currentNews.id);


	// ----------------------------------------
	// Основная информация
	// ----------------------------------------

	if (titleElement) {
		titleElement.textContent = currentNews.title;
	}

	if (newsBreadcrumbTitle) {
		newsBreadcrumbTitle.textContent = currentNews.title;
	}

	if (categoryElement) {
		categoryElement.textContent = getCategoryName(currentNews.category);
		if (categoryElement.tagName === "A") {
			const cat = currentNews.category || "education";
			categoryElement.href = `life.html?category=${cat}#news`;
			categoryElement.onclick = () => {
				sessionStorage.setItem("active_news_category", cat);
			};
		}
	}

	if (dateElement) {
		dateElement.textContent = currentNews.date;
	}

	// ----------------------------------------
	// Время чтения
	// ----------------------------------------
	const readTimeEl = document.getElementById("read-time-text");
	if (readTimeEl) {
		readTimeEl.textContent = calculateReadTime(currentNews.content);
	}

	// ----------------------------------------
	// Текст новости с VK-карточками
	// ----------------------------------------

	if (contentElement) {
		contentElement.innerHTML = transformContent(currentNews.content);
	}

	// ----------------------------------------
	// Кнопки "Поделиться"
	// ----------------------------------------
	setupShareButtons(currentNews.title);

	// ----------------------------------------
	// Навигация Предыдущая / Следующая новость
	// ----------------------------------------
	setupPrevNextNav(currentNews.id, allNewsCache);

	// ----------------------------------------
	// Сайдбар: Свежие новости
	// ----------------------------------------
	renderSidebarRecent(currentNews.id, allNewsCache);

	// ----------------------------------------
	// Рубрики в сайдбаре: подсветка активной и сохранение фильтра
	// ----------------------------------------
	document.querySelectorAll(".news-cat-chip").forEach(chip => {
		const cat = chip.dataset.cat;
		chip.classList.toggle("news-cat-chip--active", cat === currentNews.category);
		if (chip.dataset.boundClick) return;
		chip.dataset.boundClick = "1";
		chip.addEventListener("click", () => {
			if (cat) {
				sessionStorage.setItem("active_news_category", cat);
			}
		});
	});


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

	const zoomBadge = document.getElementById("news-zoom-badge");
	if (zoomBadge) {
		zoomBadge.onclick = (e) => {
			e.stopPropagation();
			openLightbox();
		};
	}

	// Если фотографий нет

	if (!images.length) {

		if (imageElement) imageElement.style.display = "none";
		if (thumbnailsElement) thumbnailsElement.style.display = "none";
		if (zoomBadge) zoomBadge.style.display = "none";

		return;
	} else {
		if (imageElement) imageElement.style.display = "block";
		if (zoomBadge) zoomBadge.style.display = "inline-flex";
	}

	if (thumbnailsElement) {
		thumbnailsElement.innerHTML = "";
		thumbnailsElement.style.display = images.length > 1 ? "flex" : "none";
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
// Навигация назад к списку новостей
// ========================================

function setupBackNavigation(currentId) {
	const activeId = currentId || newsId;
	const backLinks = document.querySelectorAll(".news-page__back, .breadcrumbs a[href*='life.html']");
	const targetHash = activeId ? `#news-${activeId}` : "#news";
	const targetHref = `life.html${targetHash}`;

	backLinks.forEach(link => {
		link.setAttribute("href", targetHref);

		if (link.dataset.backHandlerInit) {
			return;
		}
		link.dataset.backHandlerInit = "1";

		link.addEventListener("click", (e) => {
			if (activeId) {
				sessionStorage.setItem("return_to_news_id", String(activeId));
			}

			// Если пользователь пришёл с life.html — history.back() сохранит точный скролл и фильтры
			if (document.referrer && document.referrer.includes("life.html")) {
				e.preventDefault();
				window.history.back();
			}
		});
	});
}

// Первичная инициализация ссылок возврата
setupBackNavigation(newsId);

// ========================================
// Запускаем загрузку
// ========================================

loadNews();
})();