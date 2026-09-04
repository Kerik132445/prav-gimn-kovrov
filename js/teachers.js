document.addEventListener('DOMContentLoaded', () => {
	const filterBtns = document.querySelectorAll('.filter-pills .pill-btn');
	const sections = document.querySelectorAll('.teachers-group');
	const container = document.querySelector('.teachers-container');

	filterBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			if (btn.classList.contains('pill-btn--active')) return;

			// 1. FIRST: Запоминаем текущие позиции всех блоков (First)
			const firstPositions = new Map();
			sections.forEach(sec => {
				firstPositions.set(sec, sec.getBoundingClientRect().top);
			});

			// 2. Меняем активную кнопку
			filterBtns.forEach(b => b.classList.remove('pill-btn--active'));
			btn.classList.add('pill-btn--active');

			const category = btn.dataset.category;

			// 3. LAST: Меняем order у элементов (Last)
			sections.forEach(section => {
				if (!category) {
					section.style.order = '0';
					section.style.opacity = '1';
				} else if (section.dataset.category === category) {
					section.style.order = '-1';
					section.style.opacity = '1';
				} else {
					section.style.order = '0';
				}
			});

			// 4. INVERT & PLAY: Вычисляем разницу и запускаем анимацию сдвига
			sections.forEach(sec => {
				const firstTop = firstPositions.get(sec);
				const lastTop = sec.getBoundingClientRect().top;
				const deltaY = firstTop - lastTop;

				if (deltaY !== 0) {
					sec.animate([
						{ transform: `translateY(${deltaY}px)` },
						{ transform: 'translateY(0)' }
					], {
						duration: 450,
						easing: 'cubic-bezier(0.2, 0, 0, 1)' // Плавный выезд
					});
				}
			});

			// Плавный подскролл к началу списка
			if (container) {
				container.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		});
	});
});

const filterPills = document.querySelector('.filter-pills');

if (filterPills) {
	filterPills.addEventListener('wheel', (e) => {
		// Перехватываем вертикальный скролл колеса
		if (e.deltaY !== 0) {
			e.preventDefault();

			// Используем нативный плавающий скролл браузера
			filterPills.scrollBy({
				left: e.deltaY * 2.5, // Коэффициент скорости (можно настроить под себя)
				behavior: 'smooth'
			});
		}
	}, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
	const searchInput = document.querySelector('.search-box__input');
	const sections = document.querySelectorAll('.teachers-group');

	if (!searchInput) return;

	searchInput.addEventListener('input', (e) => {
		const query = e.target.value.toLowerCase().trim();

		sections.forEach(section => {
			const cards = section.querySelectorAll('.teacher-card');
			let hasVisibleCards = false;

			cards.forEach(card => {
				const name = card.querySelector('.teacher-card__name')?.textContent.toLowerCase() || '';
				const position = card.querySelector('.teacher-card__position')?.textContent.toLowerCase() || '';
				const tags = card.querySelector('.teacher-card__tags')?.textContent.toLowerCase() || '';

				const isMatch = name.includes(query) || position.includes(query) || tags.includes(query);

				if (isMatch) {
					hasVisibleCards = true;

					// Показываем элемент в DOM и плавно проявляем
					card.style.display = '';
					requestAnimationFrame(() => {
						card.classList.remove('teacher-card--hidden');
					});
				} else {
					// Плавно скрываем, а затем убираем из потока
					card.classList.add('teacher-card--hidden');

					// Ожидаем завершения CSS-анимации (300ms) перед display: none
					setTimeout(() => {
						if (card.classList.contains('teacher-card--hidden')) {
							card.style.display = 'none';
						}
					}, 300);
				}
			});

			// Показываем/скрываем всю секцию
			if (hasVisibleCards) {
				section.style.display = '';
			} else {
				// Небольшая задержка для скрытия пустой секции
				setTimeout(() => {
					if (!section.querySelector('.teacher-card:not(.teacher-card--hidden)')) {
						section.style.display = 'none';
					}
				}, 300);
			}
		});
	});
});