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

window.addEventListener('scroll', () => {
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
});