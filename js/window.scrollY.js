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

	// На самом верху шапка всегда видна
	if (currentScrollY <= 10) {
		header.classList.remove('header-hidden');
		document.body.classList.remove('header-is-hidden');

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