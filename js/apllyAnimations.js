document.addEventListener("DOMContentLoaded", () => {
	const revealSections = document.querySelectorAll(
		".apply-company, .apply-gide, .admission-info, .course-enroll"
	);

	revealSections.forEach((section) => {
		section.classList.add("js-reveal");
	});

	if (!("IntersectionObserver" in window)) {
		revealSections.forEach((section) => section.classList.add("is-visible"));
		return;
	}

	const revealObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}

				entry.target.classList.add("is-visible");
				observer.unobserve(entry.target);
			});
		},
		{
			threshold: 0.01,
			rootMargin: "0px 0px -24px 0px"
		}
	);

	revealSections.forEach((section) => {
		revealObserver.observe(section);
	});
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