const header = document.querySelector('header');

let lastScrollY = window.scrollY;
let upScrollAccumulator = 0;
let downScrollAccumulator = 0;
const SCROLL_UP_THRESHOLD = 30; // Намеренный свайп вверх минимум на 30px для показа меню
const SCROLL_DOWN_THRESHOLD = 15; // Порог для скрытия при скролле вниз
let ticking = false;

function setHeaderHeight() {
	if (!header) return;
	document.documentElement.style.setProperty(
		'--header-height',
		`${header.offsetHeight}px`
	);
}

setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
window.addEventListener('load', setHeaderHeight);

function handleHeaderScroll() {
	if (!header) {
		ticking = false;
		return;
	}

	if (document.body.classList.contains('mobile-drawer-open')) {
		ticking = false;
		return;
	}

	const currentScrollY = window.scrollY;
	const delta = currentScrollY - lastScrollY;

	// Максимальная возможная позиция прокрутки
	const maxScrollY =
		document.documentElement.scrollHeight - window.innerHeight;

	// Почти дошли до конца страницы — не дергаем шапку
	const isNearBottom = currentScrollY >= maxScrollY - 40;
	if (isNearBottom) {
		lastScrollY = currentScrollY;
		ticking = false;
		return;
	}

	// На самом верху (в пределах первых 60px) шапка всегда зафиксирована и видна
	if (currentScrollY <= 60) {
		header.classList.remove('header-hidden');
		document.body.classList.remove('header-is-hidden');
		upScrollAccumulator = 0;
		downScrollAccumulator = 0;
		lastScrollY = currentScrollY;
		ticking = false;
		return;
	}

	if (delta > 0) {
		// Скролл вниз
		downScrollAccumulator += delta;
		upScrollAccumulator = 0;

		if (downScrollAccumulator >= SCROLL_DOWN_THRESHOLD) {
			header.classList.add('header-hidden');
			document.body.classList.add('header-is-hidden');
		}
	} else if (delta < 0) {
		// Скролл вверх
		upScrollAccumulator += Math.abs(delta);
		downScrollAccumulator = 0;

		// Шапка вылазит ТОЛЬКО если пользователь уверенно протянул пальцем вверх больше порога
		if (upScrollAccumulator >= SCROLL_UP_THRESHOLD) {
			header.classList.remove('header-hidden');
			document.body.classList.remove('header-is-hidden');
		}
	}

	lastScrollY = currentScrollY;
	ticking = false;
}

window.addEventListener('scroll', () => {
	if (!ticking) {
		window.requestAnimationFrame(handleHeaderScroll);
		ticking = true;
	}
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
