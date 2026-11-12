const header = document.querySelector('header');

let lastScrollY = window.scrollY;

function setHeaderHeight() {
	document.documentElement.style.setProperty(
		'--header-height',
		`${header.offsetHeight}px`
	);
}

setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('load', setHeaderHeight);

window.addEventListener('scroll', () => {
	if (document.body.classList.contains('mobile-drawer-open')) {
		return;
	}

	const currentScrollY = window.scrollY;

	// Максимальная возможная позиция прокрутки
	const maxScrollY =
		document.documentElement.scrollHeight - window.innerHeight;

	// Почти дошли до конца страницы
	const isNearBottom = currentScrollY >= maxScrollY - 30;

	// На самом верху шапка всегда видна
	if (currentScrollY <= 10) {
		header.classList.remove('header-hidden');
		document.body.classList.remove('header-is-hidden');

		lastScrollY = currentScrollY;
		return;
	}

	// В самом низу ничего не переключаем,
	// чтобы страница не дёргалась
	if (isNearBottom) {
		lastScrollY = currentScrollY;
		return;
	}

	// Вниз
	if (currentScrollY > lastScrollY) {
		header.classList.add('header-hidden');
		document.body.classList.add('header-is-hidden');
	}

	// Вверх
	else if (currentScrollY < lastScrollY) {
		header.classList.remove('header-hidden');
		document.body.classList.remove('header-is-hidden');
	}

	lastScrollY = currentScrollY;
}, { passive: true });

// =========================================================
// КНОПКА «НАВЕРХ» (BACK TO TOP) ДЛЯ ВСЕХ СТРАНИЦ
// =========================================================
(function initBackToTop() {
	function setup() {
		let btn = document.getElementById('backToTopBtn');
		if (!btn) {
			btn = document.createElement('button');
			btn.id = 'backToTopBtn';
			btn.className = 'back-to-top';
			btn.type = 'button';
			btn.setAttribute('aria-label', 'Вернуться наверх страницы');
			btn.title = 'Наверх';
			btn.innerHTML = `
				<svg class="back-to-top__icon" viewBox="0 0 24 24" aria-hidden="true">
					<line x1="12" y1="19" x2="12" y2="5"></line>
					<polyline points="5 12 12 5 19 12"></polyline>
				</svg>
			`;
			document.body.appendChild(btn);
		}

		btn.addEventListener('click', () => {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		});

		function onScroll() {
			if (window.scrollY > 350) {
				btn.classList.add('back-to-top--visible');
			} else {
				btn.classList.remove('back-to-top--visible');
			}
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setup);
	} else {
		setup();
	}
})();
