
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
// ПОЯВЛЕНИЕ КАРТОЧЕК
// ========================================

const animatedGroups = [

	'.step-card',
	'.info-card',
	'.course-features__item'

];


animatedGroups.forEach(selector => {

	const elements = document.querySelectorAll(selector);

	elements.forEach((element, index) => {

		element.classList.add('js-card');

		element.style.transitionDelay =
			`${index * 0.08}s`;

	});

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


document.querySelectorAll('.js-card').forEach(card => {

	cardObserver.observe(card);

});