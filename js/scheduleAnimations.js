// ========================================
// ПОЯВЛЕНИЕ СЕКЦИЙ
// ========================================

const revealElements = document.querySelectorAll(`

    .campus-selector,
    .schedule-filters,
    .schedule-content,
    .faq-feedback,
    footer

`);


revealElements.forEach(element => {

	element.classList.add('js-reveal');

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


revealElements.forEach(element => {

	revealObserver.observe(element);

});



// ========================================
// КАРТОЧКИ РАСПИСАНИЯ
// ========================================

const scheduleCards = document.querySelectorAll(
	'.schedule-card'
);


const scheduleObserver = new IntersectionObserver(

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
		threshold: 0.15
	}

);


scheduleCards.forEach(card => {

	scheduleObserver.observe(card);

});



// ========================================
// ПЕРЕКЛЮЧЕНИЕ КОРПУСОВ
// ========================================

const campusCards = document.querySelectorAll(
	'.campus-card'
);


campusCards.forEach(card => {

	card.addEventListener('click', () => {

		campusCards.forEach(item => {

			item.classList.remove(
				'campus-card--active'
			);

		});

		card.classList.add(
			'campus-card--active'
		);

	});

});



// ========================================
// АНИМАЦИЯ ПРИ ПЕРЕКЛЮЧЕНИИ
// ========================================

const filterButtons = document.querySelectorAll(`

    .class-btn,
    .day-btn

`);


filterButtons.forEach(button => {

	button.addEventListener('click', () => {

		const parent = button.parentElement;

		if (parent) {

			parent
				.querySelectorAll('button')
				.forEach(btn => {

					btn.classList.remove(
						'class-btn--active',
						'day-btn--active'
					);

				});

		}


		if (button.classList.contains('class-btn')) {

			button.classList.add(
				'class-btn--active'
			);

		}


		if (button.classList.contains('day-btn')) {

			button.classList.add(
				'day-btn--active'
			);

		}


		// Перезапускаем анимацию строк

		scheduleCards.forEach(card => {

			card.classList.remove(
				'is-visible'
			);

			void card.offsetWidth;

			card.classList.add(
				'is-visible'
			);

		});

	});

});



// ========================================
// FOCUS НА ПЕРВУЮ СТРОКУ
// ========================================

const scheduleItems = document.querySelectorAll(
	'.schedule-item'
);


scheduleItems.forEach(item => {

	item.addEventListener('mouseenter', () => {

		item.classList.add(
			'schedule-item--hover'
		);

	});

	item.addEventListener('mouseleave', () => {

		item.classList.remove(
			'schedule-item--hover'
		);

	});

});