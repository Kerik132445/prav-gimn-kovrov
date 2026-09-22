const megaMenu = document.getElementById("mega-menu");
const megaOverlay = document.getElementById("mega-overlay");
const megaMenuContent = document.getElementById("mega-menu-content");
const megaMenuTitle = document.getElementById("mega-menu-title");
const megaMenuDescription = document.getElementById("mega-menu-description");
const megaMenuClose = document.querySelector(".mega-menu__close");
const megaMenuToggles = document.querySelectorAll(".mega-menu-toggle");


const megaMenuData = {

	study: {
		title: "Учеба",
		description: "Всё необходимое для учебного процесса",

		items: [
			{
				title: "Расписание",
				description: "Расписание занятий",
				icon: "assets/icons/clock.svg",
				link: "class_schedule.html"
			},

			{
				title: "Школьное питание",
				description: "Меню и информация о питании",
				icon: "assets/icons/apple.svg",
				link: "food.html"
			},

			{
				title: "Документы",
				description: "Нормативные и учебные документы",
				icon: "assets/icons/file.svg",
				link: "documents.html"
			}
		]
	},


	parents: {
		title: "Родителям",
		description: "Всё важное для родителей и учеников",

		items: [
			{
				title: "Электронный дневник",
				description: "Успеваемость и оценки",
				icon: "assets/icons/dairy.svg",
				link: "dairy.html"
			},

			{
				title: "Частые вопросы",
				description: "Ответы на популярные вопросы",
				icon: "assets/icons/parants.svg",
				link: "#faq"
			},

			{
				title: "Учителя",
				description: "Педагогический состав гимназии",
				icon: "assets/icons/teacher-outline-regular.svg",
				link: "teachers.html"
			}
		]
	}

};


function renderMegaMenu(type) {

	const data = megaMenuData[type];

	if (!data) {
		return;
	}


	megaMenuTitle.textContent = data.title;
	megaMenuDescription.textContent = data.description;

	megaMenuContent.innerHTML = "";


	data.items.forEach(item => {

		const link = document.createElement("a");

		link.className = "mega-menu__item";
		link.href = item.link;


		link.innerHTML = `
            <span class="mega-menu__icon">
                <img src="${item.icon}" alt="">
            </span>

            <span class="mega-menu__text">
                <strong>${item.title}</strong>
                <small>${item.description}</small>
            </span>
        `;


		link.addEventListener("click", () => {
			closeMegaMenu();
		});


		megaMenuContent.appendChild(link);

	});

}


function openMegaMenu(type, toggle) {

	renderMegaMenu(type);

	megaMenu.classList.add("is-open");
	megaOverlay.classList.add("is-visible");

	megaMenuToggles.forEach(button => {
		button.setAttribute("aria-expanded", "false");
		button.classList.remove("is-active");
	});

	toggle.setAttribute("aria-expanded", "true");
	toggle.classList.add("is-active");

}


function closeMegaMenu() {

	megaMenu.classList.remove("is-open");
	megaOverlay.classList.remove("is-visible");

	megaMenuToggles.forEach(button => {
		button.setAttribute("aria-expanded", "false");
		button.classList.remove("is-active");
	});

}


megaMenuToggles.forEach(toggle => {

	toggle.addEventListener("click", event => {

		event.stopPropagation();


		const isOpen =
			megaMenu.classList.contains("is-open") &&
			toggle.getAttribute("aria-expanded") === "true";


		if (isOpen) {
			closeMegaMenu();
			return;
		}


		const type =
			toggle.textContent.trim().startsWith("Учеба")
				? "study"
				: "parents";


		openMegaMenu(type, toggle);

	});

});


megaMenuClose.addEventListener("click", () => {
	closeMegaMenu();
});


megaOverlay.addEventListener("click", () => {
	closeMegaMenu();
});


document.addEventListener("keydown", event => {

	if (event.key === "Escape") {
		closeMegaMenu();
	}

});


document.addEventListener("click", event => {

	if (!megaMenu.contains(event.target)) {
		closeMegaMenu();
	}

});

function hideMegaMenuOnScroll() {
	if (!megaMenu.classList.contains("is-open")) {
		return;
	}

	closeMegaMenu();
}


let lastMegaScrollY = window.scrollY;

window.addEventListener("scroll", () => {
	const currentScrollY = window.scrollY;

	if (currentScrollY !== lastMegaScrollY) {
		hideMegaMenuOnScroll();
	}

	lastMegaScrollY = currentScrollY;
});