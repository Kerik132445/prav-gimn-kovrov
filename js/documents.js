document.addEventListener('DOMContentLoaded', () => {
	const tagButtons = document.querySelectorAll('.pill-btn, .tag-btn');
	const searchInput = document.querySelector('.search-box__input, .container-search input');
	const accordions = document.querySelectorAll('.accordion-document');

	// 1. Фильтрация по категориям
	tagButtons.forEach(button => {
		button.addEventListener('click', () => {
			const category = button.dataset.category || 'all';

			// Переключение активной кнопки
			tagButtons.forEach(btn => {
				btn.classList.remove('pill-btn--active', 'tag-btn--active');
			});
			button.classList.add(button.classList.contains('pill-btn') ? 'pill-btn--active' : 'tag-btn--active');

			// Сброс поля поиска при смене категории
			if (searchInput) {
				searchInput.value = '';
			}

			accordions.forEach(accordion => {
				const accordionCategory = accordion.dataset.category;
				const items = accordion.querySelectorAll('.documents-item');
				items.forEach(item => {
					item.style.display = '';
				});

				if (category === 'all') {
					accordion.style.display = '';
					// Все видны в исходном порядке
				} else if (accordionCategory === category) {
					accordion.style.display = '';
					accordion.classList.add('accordion-document--active'); // Разворачиваем выбранную категорию
				} else {
					accordion.style.display = 'none';
					accordion.classList.remove('accordion-document--active');
				}
			});
		});
	});

	// 2. Логика аккордеонов (открытие/закрытие при клике на заголовок)
	accordions.forEach(accordion => {
		const title = accordion.querySelector('.document-title');

		if (title) {
			title.addEventListener('click', () => {
				accordion.classList.toggle('accordion-document--active');
			});
		}
	});

	// 3. Поиск по названию документов
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
						accordion.style.display = 'none';
						accordion.classList.remove('accordion-document--active');
					}
				} else {
					// Сброс поиска: возвращаем состояние текущего фильтра
					const activeBtn = document.querySelector('.pill-btn--active, .tag-btn--active');
					const activeCat = activeBtn?.dataset.category || 'all';
					if (activeCat === 'all') {
						accordion.style.display = '';
					} else {
						accordion.style.display = (accordion.dataset.category === activeCat) ? '' : 'none';
					}
				}
			});
		});
	}
});
