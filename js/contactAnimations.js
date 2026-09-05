const animatedElements = document.querySelectorAll(`
    .hero-contacts__header,
    .hero-card,
    .contacts-main__map,
    .contacts-main__info,
    .contacts-departments__title,
    .department-card,
    .contacts-requisites
`);

const observer = new IntersectionObserver(
	(entries, observer) => {

		entries.forEach((entry) => {

			if (entry.isIntersecting) {
				entry.target.classList.add("show");

				observer.unobserve(entry.target);
			}

		});

	},
	{
		threshold: 0.15
	}
);


animatedElements.forEach((element) => {
	observer.observe(element);
});