document.addEventListener('DOMContentLoaded', () => {
	const tagButtons = document.querySelectorAll('.tag-btn');
	const searchInput = document.querySelector('.container-search input');
	const accordions = document.querySelectorAll('.accordion-document');

	// 1. Фильтрация/сортировка по тегам
	tagButtons.forEach(button => {
		button.addEventListener('click', () => {
			const category = button.dataset.category;

			// Переключение активной кнопки
			tagButtons.forEach(btn => btn.classList.remove('tag-btn--active'));
			button.classList.add('tag-btn--active');

			accordions.forEach(accordion => {
				const accordionCategory = accordion.dataset.category;

				if (category === 'all') {
					accordion.style.order = '0';
					accordion.classList.remove('accordion-document--active');
				} else if (accordionCategory === category) {
					accordion.style.order = '-1'; // Поднимаем наверх
					accordion.classList.add('accordion-document--active'); // Открываем аккордеон
				} else {
					accordion.style.order = '0';
					accordion.classList.remove('accordion-document--active'); // Закрываем остальные
				}
			});
		});
	});

	// 2. Логика аккордеонов (чистая переключалка класса, без смены src)
	accordions.forEach(accordion => {
		const title = accordion.querySelector('.document-title');

		if (title) {
			title.addEventListener('click', () => {
				accordion.classList.toggle('accordion-document--active');
			});
		}
	});

	// 3. Поиск по файлам
	if (searchInput) {
		searchInput.addEventListener('input', (e) => {
			const query = e.target.value.toLowerCase().trim();

			accordions.forEach(accordion => {
				const items = accordion.querySelectorAll('.documents-item');
				let hasMatch = false;

				items.forEach(item => {
					const titleText = item.querySelector('.documents-item__title')?.textContent.toLowerCase() || '';

					if (query === '' || titleText.includes(query)) {
						item.style.display = '';
						if (query !== '') hasMatch = true;
					} else {
						item.style.display = 'none';
					}
				});

				if (query.length > 0) {
					if (hasMatch) {
						accordion.style.display = '';
						accordion.classList.add('accordion-document--active');
					} else {
						// Прячем весь аккордеон, если в нем нет подходящих файлов
						accordion.style.display = 'none';
						accordion.classList.remove('accordion-document--active');
					}
				} else {
					// Сброс поиска
					accordion.style.display = '';
					accordion.classList.remove('accordion-document--active');
				}
			});
		});
	}
});