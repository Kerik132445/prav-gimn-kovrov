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



const animatedElements = document.querySelectorAll(
	'.teachers-group, .feedback, .faq, footer'
);

const observer = new IntersectionObserver(
	(entries, observer) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				observer.unobserve(entry.target);
			}
		});
	},
	{
		threshold: 0.1
	}
);

animatedElements.forEach(element => {
	element.classList.add('animate-on-scroll');
	observer.observe(element);
});

// =========================================================
// ПЛАВАЮЩАЯ НАВИГАЦИЯ ПО КАТЕГОРИЯМ ПРЕПОДАВАТЕЛЕЙ
// =========================================================
(function initTeachersQuickNav() {
	const quickNav = document.getElementById('teachersQuickNav');
	const toggleBtn = document.getElementById('teachersNavToggle');
	const closeBtn = document.getElementById('teachersNavClose');
	const panel = document.getElementById('teachersNavMenu');
	const navItems = document.querySelectorAll('.teachers-quick-nav__item');
	const sections = document.querySelectorAll('.teachers-group');

	if (!quickNav || !toggleBtn || !panel || sections.length === 0) return;

	let isOpen = false;

	function openNav() {
		isOpen = true;
		panel.classList.add('teachers-quick-nav__panel--open');
		toggleBtn.classList.add('teachers-quick-nav__toggle--active');
		toggleBtn.setAttribute('aria-expanded', 'true');
	}

	function closeNav() {
		isOpen = false;
		panel.classList.remove('teachers-quick-nav__panel--open');
		toggleBtn.classList.remove('teachers-quick-nav__toggle--active');
		toggleBtn.setAttribute('aria-expanded', 'false');
	}

	toggleBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (isOpen) {
			closeNav();
		} else {
			openNav();
		}
	});

	if (closeBtn) {
		closeBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			closeNav();
		});
	}

	// Закрытие при клике вне панели
	document.addEventListener('click', (e) => {
		if (isOpen && !quickNav.contains(e.target)) {
			closeNav();
		}
	});

	// Закрытие по клавише Escape
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && isOpen) {
			closeNav();
			toggleBtn.focus();
		}
	});

	// Клик по пункту навигации
	navItems.forEach(item => {
		item.addEventListener('click', () => {
			const category = item.dataset.navCategory;
			const targetSection = document.querySelector(`.teachers-group[data-category="${category}"]`);

			if (!targetSection) return;

			// Если ранее был выбран фильтр, сбрасываем его на "Все учителя"
			const allPill = document.querySelector('.filter-pills .pill-btn:first-child');
			const activePill = document.querySelector('.filter-pills .pill-btn--active');
			if (activePill && activePill !== allPill && activePill.dataset.category !== category) {
				allPill.click();
			}

			// Расчёт точной позиции с учётом фиксированной шапки
			const header = document.querySelector('header');
			const headerH = header ? header.offsetHeight : 100;
			const rect = targetSection.getBoundingClientRect();
			const targetY = rect.top + window.scrollY - headerH - 24;

			window.scrollTo({
				top: Math.max(0, targetY),
				behavior: 'smooth'
			});

			// На мобильных экранах закрываем меню после выбора
			if (window.innerWidth <= 768) {
				closeNav();
			}
		});
	});

	// Автоматическое обновление активной категории при скролле (Scrollspy)
	let ticking = false;

	function updateActiveCategory() {
		const scrollY = window.scrollY;
		const header = document.querySelector('header');
		const headerH = (header ? header.offsetHeight : 100) + 60;
		let currentCategory = null;

		sections.forEach(sec => {
			const top = sec.offsetTop - headerH;
			const height = sec.offsetHeight;
			if (scrollY >= top && scrollY < top + height) {
				currentCategory = sec.dataset.category;
			}
		});

		// Если долистали до самого низа страницы — активируем последнюю категорию
		const isBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
		if (isBottom && sections.length > 0) {
			currentCategory = sections[sections.length - 1].dataset.category;
		}

		if (currentCategory) {
			navItems.forEach(item => {
				if (item.dataset.navCategory === currentCategory) {
					item.classList.add('teachers-quick-nav__item--active');
				} else {
					item.classList.remove('teachers-quick-nav__item--active');
				}
			});
		}

		ticking = false;
	}

	window.addEventListener('scroll', () => {
		if (!ticking) {
			requestAnimationFrame(updateActiveCategory);
			ticking = true;
		}
	}, { passive: true });

	// Первичный вызов для установки активного пункта
	updateActiveCategory();
})();
