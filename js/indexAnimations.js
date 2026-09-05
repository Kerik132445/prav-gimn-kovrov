const revealElements = document.querySelectorAll(`
    .quick-actions,
    .about,
    .quote,
    .stats,
    .fresh-news,
    .teachers,
    .faq-feedback
`);

revealElements.forEach((element, index) => {
	element.classList.add('js-reveal');

	element.style.transitionDelay = `${index * 0.05}s`;
});


const revealObserver = new IntersectionObserver((entries, observer) => {

	entries.forEach(entry => {

		if (entry.isIntersecting) {
			entry.target.classList.add('is-visible');

			observer.unobserve(entry.target);
		}

	});

}, {
	threshold: 0.12
});


revealElements.forEach(element => {
	revealObserver.observe(element);
});


// ========================================
// АНИМАЦИЯ КАРТИНОК
// ========================================

const imageElements = document.querySelectorAll(`
    .about__image,
    .teachers__media
`);

imageElements.forEach(element => {
	element.classList.add('js-reveal-image');

	revealObserver.observe(element);
});


// ========================================
// АНИМАЦИЯ ЧИСЕЛ
// ========================================

const statNumbers = document.querySelectorAll('.stat-card__number');

const statsObserver = new IntersectionObserver((entries, observer) => {

	entries.forEach(entry => {

		if (!entry.isIntersecting) return;

		const element = entry.target;
		const text = element.textContent.trim();

		// 19+
		if (/^\d+\+$/.test(text)) {
			const number = parseInt(text);

			animateNumber(element, number, '+');
		}

		// 100%
		else if (/^\d+%$/.test(text)) {
			const number = parseInt(text);

			animateNumber(element, number, '%');
		}

		observer.unobserve(element);
	});

}, {
	threshold: 0.7
});


statNumbers.forEach(number => {
	statsObserver.observe(number);
});


function animateNumber(element, target, suffix) {

	const duration = 1200;
	const startTime = performance.now();

	function update(currentTime) {

		const progress = Math.min(
			(currentTime - startTime) / duration,
			1
		);

		// Плавное ускорение/замедление
		const eased = 1 - Math.pow(1 - progress, 3);

		const currentNumber = Math.floor(target * eased);

		element.textContent = currentNumber + suffix;

		if (progress < 1) {
			requestAnimationFrame(update);
		} else {
			element.textContent = target + suffix;
		}
	}

	requestAnimationFrame(update);
}


// ========================================
// АНИМАЦИЯ КАРТОЧЕК
// ========================================

const cards = document.querySelectorAll(`
    .quick-card,
    .stat-card,
    .news
`);

cards.forEach((card, index) => {

	card.style.transitionDelay = `${(index % 4) * 0.05}s`;

});


// ========================================
// ПЛАВНАЯ ПРОКРУТКА ПО ЯКОРЯМ
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

	link.addEventListener('click', event => {

		const targetId = link.getAttribute('href');

		if (!targetId || targetId === '#') {
			return;
		}

		const target = document.querySelector(targetId);

		if (!target) {
			return;
		}

		event.preventDefault();

		target.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});

	});

});