
// ========================================
// REVEAL СЕКЦИЙ
// ========================================

const revealSections = document.querySelectorAll(`

    .journal-hero,
    .faq-feedback,
    .feedback,
    .faq

`);


revealSections.forEach(section => {

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


revealSections.forEach(section => {

	revealObserver.observe(section);

});



// ========================================
// КАРТОЧКИ
// ========================================

const cards = document.querySelectorAll(`

    .instruction-card

`);


cards.forEach((card, index) => {

	card.classList.add('js-card');

	card.style.transitionDelay =
		`${index * 0.1}s`;

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
		threshold: 0.15
	}

);


cards.forEach(card => {

	cardObserver.observe(card);

});



// ========================================
// FOOTER REVEAL
// ========================================

const footer = document.querySelector('body > main > footer');

if (footer) {

	footer.classList.add('js-reveal');

	revealObserver.observe(footer);

}