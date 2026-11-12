(() => {
// ========================================
// ПОЯВЛЕНИЕ СЕКЦИЙ
// ========================================

const sections = document.querySelectorAll(`

    .canteen-menu,
    .benefits,
    .statement,
    .faq

`);


sections.forEach(section => {

	section.classList.add('js-reveal');

});


const revealObserver = new IntersectionObserver(

	(entries, observer) => {

		entries.forEach(entry => {

			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add('is-visible');

			observer.unobserve(entry.target);

		});

	},

	{
		threshold: 0.12
	}

);


sections.forEach(section => {

	revealObserver.observe(section);

});



// ========================================
// ПОЯВЛЕНИЕ КАРТОЧЕК
// ========================================

const cards = document.querySelectorAll(`

    .card-canteen,
    .building-card,
    .meal-card,
    .benefits-card,
    .statement-btn__privilege,
    .statement-btn__family

`);


cards.forEach((card, index) => {

	card.classList.add('js-card');

	card.style.transitionDelay =
		`${(index % 5) * 0.07}s`;

});


const cardObserver = new IntersectionObserver(

	(entries, observer) => {

		entries.forEach(entry => {

			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add('is-visible');

			observer.unobserve(entry.target);

		});

	},

	{
		threshold: 0.12
	}

);


cards.forEach(card => {

	cardObserver.observe(card);

});



// ========================================
// АНИМАЦИЯ МЕНЮ
// ========================================

const mealCards = document.querySelectorAll('.meal-card');

const mealObserver = new IntersectionObserver(

	(entries, observer) => {

		entries.forEach(entry => {

			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add('is-menu-visible');

			observer.unobserve(entry.target);

		});

	},

	{
		threshold: 0.3
	}

);


mealCards.forEach(card => {

	mealObserver.observe(card);

});



// ========================================
// ПЕРЕКЛЮЧАТЕЛИ
// ========================================

const tabButtons = document.querySelectorAll('.tab-btn');

tabButtons.forEach(button => {

	button.addEventListener('click', () => {

		const group = button.closest('.tab-group');

		if (!group) {
			return;
		}

		group
			.querySelectorAll('.tab-btn')
			.forEach(btn => {

				btn.classList.remove('tab-btn--active');

			});

		button.classList.add('tab-btn--active');

		// Перезапускаем анимацию меню

		document.querySelectorAll('.meal-card').forEach(card => {

			card.classList.remove('is-menu-visible');

			void card.offsetWidth;

			card.classList.add('is-menu-visible');

		});

	});

});



// ========================================
// КОРПУСА
// ========================================

const buildings = document.querySelectorAll('.building-card');

buildings.forEach(building => {

	building.addEventListener('click', () => {

		buildings.forEach(item => {

			item.classList.remove('building-card--active');

		});

		building.classList.add('building-card--active');

	});

});
})();