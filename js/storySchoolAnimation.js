const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
	const revealObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					// Больше не наблюдаем за уже показанным элементом
					observer.unobserve(entry.target);
				}
			});
		},
		{
			// Запускаем появление элементов заранее (за 80px до границы экрана) с минимальным порогом
			rootMargin: "0px 0px 80px 0px",
			threshold: 0.02
		}
	);

	revealElements.forEach((element) => {
		revealObserver.observe(element);
	});
} else {
	revealElements.forEach((element) => {
		element.classList.add("is-visible");
	});
}
