(() => {
const API_URL = `${window.API_BASE_URL}/api/news/`;

const searchForm = document.getElementById("site-search-form");
const searchInput = document.getElementById("site-search-input");

const resultsContainer = document.getElementById("search-results");
const queryText = document.getElementById("search-query-text");
const emptyMessage = document.getElementById("search-empty");


// ========================================
// Форма поиска в шапке
// ========================================

if (searchForm && searchInput) {

	searchForm.addEventListener("submit", event => {

		event.preventDefault();

		const query = searchInput.value.trim();

		if (!query) {
			return;
		}

		const inSveden = window.location.pathname.includes("/sveden/");
		window.location.href =
			`${inSveden ? "../" : ""}search.html?q=${encodeURIComponent(query)}`;

	});

}


// ========================================
// Страницы сайта
// ========================================

const pages = [

	{
		title: "Главная",
		url: "index.html",
		description: "Православная гимназия г. Коврова"
	},

	{
		title: "История гимназии",
		url: "story_school.html",
		description: "История и развитие Православной гимназии"
	},

	{
		title: "Жизнь гимназии",
		url: "life.html",
		description: "Новости и события гимназии"
	},

	{
		title: "Учителя",
		url: "teachers.html",
		description: "Педагогический состав гимназии"
	},

	{
		title: "Расписание",
		url: "class_schedule.html",
		description: "Расписание занятий и уроков"
	},

	{
		title: "Школьное питание",
		url: "food.html",
		description: "Информация о школьном питании и меню"
	},

	{
		title: "Документы",
		url: "documents.html",
		description: "Нормативные документы гимназии"
	},

	{
		title: "Контакты",
		url: "contact.html",
		description: "Контактная информация гимназии"
	},

	{
		title: "Поступающим",
		url: "apply.html",
		description: "Информация для поступающих в гимназию"
	},

	{
		title: "Электронный дневник",
		url: "diary.html",
		description: "Электронный дневник и успеваемость"
	}

];


// ========================================
// Получаем запрос
// ========================================

const params = new URLSearchParams(window.location.search);

const query = params.get("q")?.trim() || "";


// ========================================
// Нормализация текста
// ========================================

function normalizeText(text) {

	return String(text)
		.toLowerCase()
		.replace(/ё/g, "е")
		.replace(/\s+/g, " ")
		.trim();

}


// ========================================
// Получаем слова запроса
// ========================================

function getQueryWords(searchQuery) {

	return normalizeText(searchQuery)
		.split(" ")
		.filter(Boolean);

}


// ========================================
// Проверяем частичное совпадение
// ========================================

function matchesQuery(text, searchQuery) {

	const normalizedText = normalizeText(text);
	const queryWords = getQueryWords(searchQuery);

	if (!queryWords.length) {
		return false;
	}

	return queryWords.every(word =>
		normalizedText.includes(word)
	);

}


// ========================================
// Экранируем HTML
// ========================================

function escapeHTML(value) {

	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

}


// ========================================
// Подсветка найденного текста
// ========================================

function highlightText(text, searchQuery) {

	if (!searchQuery) {
		return escapeHTML(text);
	}

	let result = escapeHTML(text);

	const queryWords = getQueryWords(searchQuery);

	queryWords.sort((a, b) => b.length - a.length);

	for (const word of queryWords) {

		const escapedWord = escapeHTML(word);

		const regex = new RegExp(
			`(${escapedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
			"gi"
		);

		result = result.replace(
			regex,
			"<mark>$1</mark>"
		);

	}

	return result;

}


// ========================================
// Создание сниппета
// ========================================

function createSnippet(text, searchQuery, maxLength = 180) {

	if (!text) {
		return "";
	}

	const originalText = String(text);

	const normalizedText = normalizeText(originalText);

	const queryWords = getQueryWords(searchQuery);

	if (!queryWords.length) {
		return escapeHTML(
			originalText.slice(0, maxLength)
		);
	}


	// Ищем первое найденное слово
	let matchPosition = -1;
	let matchedWord = "";

	for (const word of queryWords) {

		const position =
			normalizedText.indexOf(word);

		if (
			position !== -1 &&
			(
				matchPosition === -1 ||
				position < matchPosition
			)
		) {

			matchPosition = position;
			matchedWord = word;

		}

	}


	// Если совпадение не найдено
	if (matchPosition === -1) {

		return escapeHTML(
			originalText.slice(0, maxLength)
		);

	}


	// Сколько символов показываем
	const contextBefore = 70;
	const contextAfter = 110;

	let start =
		Math.max(
			0,
			matchPosition - contextBefore
		);

	let end =
		Math.min(
			originalText.length,
			matchPosition +
			matchedWord.length +
			contextAfter
		);


	// Берём кусок текста
	let snippet =
		originalText.slice(start, end);


	// Красивые многоточия
	if (start > 0) {
		snippet = "..." + snippet;
	}

	if (end < originalText.length) {
		snippet += "...";
	}


	return highlightText(
		snippet,
		searchQuery
	);

}


// ========================================
// Поиск по HTML страницы
// ========================================

async function searchPageContent(page, searchQuery) {

	try {

		const response = await fetch(page.url);

		if (!response.ok) {
			return null;
		}

		const html = await response.text();

		const parser = new DOMParser();

		const documentPage =
			parser.parseFromString(
				html,
				"text/html"
			);


		const bodyText =
			normalizeText(
				documentPage.body?.innerText || ""
			);


		const normalizedQuery =
			normalizeText(searchQuery);

		const normalizedTitle =
			normalizeText(page.title);

		const normalizedDescription =
			normalizeText(page.description);


		// Страница не содержит все слова запроса
		if (
			!matchesQuery(
				bodyText,
				searchQuery
			)
		) {

			return null;

		}


		let score = 0;

		const queryWords =
			getQueryWords(searchQuery);


		// ========================================
		// Совпадение с названием
		// ========================================

		if (
			normalizedTitle === normalizedQuery
		) {

			score += 100;

		} else if (
			normalizedTitle.startsWith(
				normalizedQuery
			)
		) {

			score += 70;

		} else if (
			normalizedTitle.includes(
				normalizedQuery
			)
		) {

			score += 50;

		}


		// Частичные совпадения слов
		for (const word of queryWords) {

			if (normalizedTitle.includes(word)) {
				score += 40;
			}

		}


		// ========================================
		// Описание
		// ========================================

		if (
			matchesQuery(
				normalizedDescription,
				searchQuery
			)
		) {

			score += 30;

		}


		// ========================================
		// Основной текст
		// ========================================

		if (
			matchesQuery(
				bodyText,
				searchQuery
			)
		) {

			score += 10;

		}


		// ========================================
		// Создаём сниппет
		// ========================================

		const snippetSource =
			documentPage.body?.innerText || "";


		const snippet =
			createSnippet(
				snippetSource,
				searchQuery
			);


		return {

			...page,

			score,

			snippet

		};


	} catch (error) {

		console.error(
			`Ошибка поиска на странице ${page.url}:`,
			error
		);

		return null;

	}

}


// ========================================
// Поиск по новостям
// ========================================

async function searchNews(searchQuery) {

	try {

		const response =
			await fetch(API_URL);


		if (!response.ok) {

			throw new Error(
				`Ошибка загрузки новостей: ${response.status}`
			);

		}


		const news =
			await response.json();


		const normalizedQuery =
			normalizeText(searchQuery);


		const results = [];


		for (const item of news) {

			const title =
				normalizeText(
					item.title || ""
				);

			const description =
				normalizeText(
					item.description || ""
				);

			const content =
				normalizeText(
					item.content || ""
				);

			const category =
				normalizeText(
					item.category || ""
				);

			const date =
				normalizeText(
					item.date || ""
				);


			const fullText = `
				${title}
				${description}
				${content}
				${category}
				${date}
			`;


			// Все слова запроса должны встретиться
			if (
				!matchesQuery(
					fullText,
					searchQuery
				)
			) {

				continue;

			}


			let score = 0;

			const queryWords =
				getQueryWords(searchQuery);


			// ========================================
			// Название
			// ========================================

			if (
				title === normalizedQuery
			) {

				score += 100;

			} else if (
				title.startsWith(
					normalizedQuery
				)
			) {

				score += 70;

			} else if (
				title.includes(
					normalizedQuery
				)
			) {

				score += 50;

			}


			// Частичные совпадения
			for (const word of queryWords) {

				if (title.includes(word)) {
					score += 40;
				}

			}


			// ========================================
			// Описание
			// ========================================

			if (
				matchesQuery(
					description,
					searchQuery
				)
			) {

				score += 30;

			}


			// ========================================
			// Категория
			// ========================================

			if (
				matchesQuery(
					category,
					searchQuery
				)
			) {

				score += 20;

			}


			// ========================================
			// Основной текст
			// ========================================

			if (
				matchesQuery(
					content,
					searchQuery
				)
			) {

				score += 10;

			}


			// ========================================
			// Выбираем источник сниппета
			// ========================================

			let snippetSource = "";


			if (
				matchesQuery(
					description,
					searchQuery
				)
			) {

				snippetSource =
					item.description || "";

			} else {

				snippetSource =
					item.content || "";

			}


			const snippet =
				createSnippet(
					snippetSource,
					searchQuery
				);


			results.push({

				...item,

				score,

				snippet

			});

		}


		// Сортировка по релевантности
		results.sort(
			(a, b) => b.score - a.score
		);


		return results;


	} catch (error) {

		console.error(
			"Ошибка поиска по новостям:",
			error
		);

		return [];

	}

}


// ========================================
// Отрисовка результата страницы
// ========================================

function renderPageResult(page) {

	const article =
		document.createElement("article");

	article.className =
		"search-result";


	article.innerHTML = `

		<div class="search-result__type">
			Страница
		</div>

		<h2 class="search-result__title">

			<a href="${page.url}">
				${highlightText(
		page.title,
		query
	)}
			</a>

		</h2>

		<p class="search-result__description">

			${page.snippet}

		</p>

		<a
			class="search-result__link"
			href="${page.url}"
		>

			Перейти на страницу →

		</a>

	`;


	resultsContainer.appendChild(article);

}


// ========================================
// Отрисовка результата новости
// ========================================

function renderNewsResult(news) {

	const article =
		document.createElement("article");


	article.className =
		"search-result search-result--news";


	article.innerHTML = `

		<div class="search-result__type">

			${highlightText(
		news.category,
		query
	)}

		</div>

		<h2 class="search-result__title">

			<a href="news.html?id=${news.id}">

				${highlightText(
		news.title,
		query
	)}

			</a>

		</h2>

		<p class="search-result__date">

			${escapeHTML(news.date)}

		</p>

		<p class="search-result__description">

			${news.snippet}

		</p>

		<a
			class="search-result__link"
			href="news.html?id=${news.id}"
		>

			Читать новость →

		</a>

	`;


	resultsContainer.appendChild(article);

}


// ========================================
// Основной поиск
// ========================================

async function performSearch() {

	if (!resultsContainer) {
		return;
	}


	// ========================================
	// Пустой запрос
	// ========================================

	if (!query) {

		if (queryText) {

			queryText.textContent =
				"Введите запрос для поиска";

		}

		return;

	}


	// ========================================
	// Заголовок
	// ========================================

	if (queryText) {

		queryText.textContent =
			`Результаты поиска для «${query}»`;

	}


	// ========================================
	// Загрузка
	// ========================================

	resultsContainer.innerHTML = `

		<div class="search-loading">

			Ищем по сайту...

		</div>

	`;


	if (emptyMessage) {
		emptyMessage.hidden = true;
	}


	// ========================================
	// Поиск по страницам
	// ========================================

	const pageResults = [];


	for (const page of pages) {

		const result =
			await searchPageContent(
				page,
				query
			);


		if (result) {
			pageResults.push(result);
		}

	}


	pageResults.sort(
		(a, b) => b.score - a.score
	);


	// ========================================
	// Поиск по новостям
	// ========================================

	const newsResults =
		await searchNews(query);


	// ========================================
	// Вывод
	// ========================================

	resultsContainer.innerHTML = "";


	for (const page of pageResults) {

		renderPageResult(page);

	}


	for (const news of newsResults) {

		renderNewsResult(news);

	}


	// ========================================
	// Ничего не найдено
	// ========================================

	if (
		pageResults.length === 0 &&
		newsResults.length === 0
	) {

		if (emptyMessage) {
			emptyMessage.hidden = false;
		}

	}

}


// ========================================
// Запускаем поиск
// ========================================

performSearch();
})();