import json

with open('scratch/db_news.json', encoding='utf-8') as f:
    db_news = json.load(f)

fallback_js = 'const FALLBACK_NEWS = ' + json.dumps(db_news, ensure_ascii=False, indent=2) + ';\n'

with open('js/news.js', encoding='utf-8') as f:
    orig = f.read()

# Replace params/newsId definition
target1 = '''const params = new URLSearchParams(window.location.search);
const newsId = Number(params.get("id"));'''

repl1 = '''const params = new URLSearchParams(window.location.search);
const defaultLatestId = 9;
const rawId = params.get("id");
const newsId = (rawId && !isNaN(Number(rawId))) ? Number(rawId) : defaultLatestId;'''

if target1 not in orig:
    print('ERROR: target1 not found')
orig = orig.replace(target1, repl1, 1)

# Replace getImageUrl
target_img = '''	if (image.startsWith("/uploads")) {
		return `${window.API_BASE_URL}${image}`;
	}'''

repl_img = '''	if (image.startsWith("/uploads")) {
		if (window.location.protocol === "file:" || !window.API_BASE_URL) {
			return image.replace(/^\\//, "");
		}
		return `${window.API_BASE_URL}${image}`;
	}'''

if target_img not in orig:
    print('ERROR: target_img not found')
orig = orig.replace(target_img, repl_img, 1)

# Replace loadNews
target_load = '''async function loadNews() {

	try {

		if (!newsId) {
			throw new Error("Не указан ID новости");
		}


		const response =
			await fetch(`${API_URL}${newsId}`);


		if (!response.ok) {

			if (response.status === 404) {
				showNewsNotFound();
				return;
			}

			throw new Error(
				`Ошибка сервера: ${response.status}`
			);

		}


		const currentNews =
			await response.json();


		console.log(
			"Новость загружена:",
			currentNews
		);


		displayNews(currentNews);


	} catch (error) {

		console.error(
			"Не удалось загрузить новость:",
			error
		);


		titleElement.textContent =
			"Не удалось загрузить новость";

		categoryElement.textContent = "";
		dateElement.textContent = "";

		contentElement.innerHTML = `
			<p>
				Произошла ошибка при загрузке новости.
			</p>
		`;

	}

}'''

repl_load = fallback_js + '''
async function loadNews() {
	const fallbackItem = FALLBACK_NEWS.find(item => item.id === newsId) || (rawId ? null : FALLBACK_NEWS[0]);

	try {
		const response = await fetch(`${API_URL}${newsId}`);

		if (!response.ok) {
			if (response.status === 404) {
				if (fallbackItem && fallbackItem.id === newsId) {
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
}'''

if target_load not in orig:
    print('ERROR: target_load not found')
orig = orig.replace(target_load, repl_load, 1)

with open('js/news.js', 'w', encoding='utf-8') as f:
    f.write(orig)

print('js/news.js successfully updated!')
