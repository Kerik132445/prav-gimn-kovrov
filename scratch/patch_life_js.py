import json

with open('scratch/db_news.json', encoding='utf-8') as f:
    db_news = json.load(f)

fallback_js = 'const FALLBACK_NEWS = ' + json.dumps(db_news, ensure_ascii=False, indent=2) + ';\n'

with open('js/life.js', encoding='utf-8') as f:
    orig = f.read()

target_load = '''async function loadNews() {

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
}'''

repl_load = fallback_js + '''
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
}'''

if target_load in orig:
    orig = orig.replace(target_load, repl_load, 1)
    with open('js/life.js', 'w', encoding='utf-8') as f:
        f.write(orig)
    print('js/life.js successfully updated!')
else:
    print('target_load not found in js/life.js')
