document.addEventListener('DOMContentLoaded', () => {
	const campusConfig = {
		spassky: {
			classes: [1, 2, 3, 4],
			days: [
				{ id: 'mon', label: 'Понедельник' },
				{ id: 'tue', label: 'Вторник' },
				{ id: 'wed', label: 'Среда' },
				{ id: 'thu', label: 'Четверг' },
				{ id: 'fri', label: 'Пятница' }
			]
		},
		pokrovsky: {
			classes: [5, 6, 7, 8, 9, 10, 11],
			days: [
				{ id: 'mon', label: 'Понедельник' },
				{ id: 'tue', label: 'Вторник' },
				{ id: 'wed', label: 'Среда' },
				{ id: 'thu', label: 'Четверг' },
				{ id: 'fri', label: 'Пятница' },
				{ id: 'sat', label: 'Суббота' }
			]
		}
	};

	const scheduleTemplates = {
		regular: [
			{ type: 'church', title: 'Молитва', time: '7:55 – 8:15', icon: 'church.svg' },
			{ type: 'lesson', title: '1 урок', time: '8:20 – 9:00' },
			{ type: 'break', title: 'Завтрак', time: '9:00 – 9:10', icon: 'food-toastr.svg' },
			{ type: 'lesson', title: '2 урок', time: '9:10 – 9:50' },
			{ type: 'lesson', title: '3 урок', time: '10:00 – 10:40' },
			{ type: 'lesson', title: '4 урок', time: '10:50 – 11:30' },
			{ type: 'lesson', title: '5 урок', time: '11:45 – 12:25' },
			{ type: 'break', title: 'Обед', time: '12:25 – 12:40', icon: 'food-appler.svg' },
			{ type: 'lesson', title: '6 урок', time: '12:40 – 13:20' },
			{ type: 'lesson', title: '7 урок', time: '13:30 – 14:10' },
			{ type: 'lesson', title: '8 урок', time: '14:20 – 15:00' }
		],
		thursday: [
			{ type: 'church', title: 'Молитва', time: '7:55 – 8:20', icon: 'church.svg' },
			{ type: 'lesson', title: '1 урок', time: '8:30 – 9:10' },
			{ type: 'break', title: 'Завтрак', time: '9:10 – 9:20', icon: 'food-toastr.svg' },
			{ type: 'lesson', title: '2 урок', time: '9:20 – 10:00' },
			{ type: 'lesson', title: '3 урок', time: '10:10 – 10:50' },
			{ type: 'lesson', title: '4 урок', time: '11:00 – 11:40' },
			{ type: 'break', title: 'Обед', time: '11:40 – 11:55', icon: 'food-appler.svg' },
			{ type: 'lesson', title: '5 урок', time: '11:55 – 12:35' },
			{ type: 'church', title: 'Молебен', time: '12:45 – 13:05', icon: 'church.svg' },
			{ type: 'lesson', title: '6 урок', time: '13:15 – 13:55' },
			{ type: 'lesson', title: '7 урок', time: '14:05 – 14:45' },
			{ type: 'lesson', title: '8 урок', time: '14:50 – 15:30' }
		],
		saturday: [
			{ type: 'lesson', title: '2 урок', time: '9:10 – 9:50' },
			{ type: 'break', title: 'Завтрак', time: '9:50 – 10:00', icon: 'food-toastr.svg' },
			{ type: 'lesson', title: '3 урок', time: '10:00 – 10:40' },
			{ type: 'lesson', title: '4 урок', time: '10:50 – 11:30' },
			{ type: 'lesson', title: '5 урок', time: '11:40 – 12:20' },
			{ type: 'lesson', title: '6 урок', time: '12:30 – 13:10' },
			{ type: 'lesson', title: '7 урок', time: '13:20 – 14:00' }
		]
	};

	const campusCards = document.querySelectorAll('.campus-card');
	const classTabsContainer = document.querySelector('.class-tabs');
	const dayTabsContainer = document.querySelector('.day-tabs');

	let state = {
		building: 'spassky',
		classNum: 1,
		day: 'mon'
	};

	function generateBellsSchedule(building, day) {
		let templateKey = 'regular';
		if (day === 'thu') templateKey = 'thursday';
		if (day === 'sat') templateKey = 'saturday';

		let bells = [...scheduleTemplates[templateKey]];

		if (building === 'spassky') {
			const cutIndex = bells.findIndex(item => item.title === '6 урок');
			if (cutIndex !== -1) {
				bells = bells.slice(0, cutIndex);
			}

			bells.push(
				{ type: 'special', title: 'Прогулка', time: '13:00 – 13:30', icon: 'tree.svg' },
				{ type: 'lesson', title: '1 внеурочка', time: '13:30 – 14:10' },
				{ type: 'lesson', title: '2 внеурочка', time: '14:20 – 15:00' },
				{ type: 'special', title: 'Самоподготовка', time: '15:00 – 16:00', icon: 'book-schedule.svg' }
			);
		}

		return bells;
	}

	function renderLessons() {
		const lessonsListContainer = document.querySelector('.schedule-card:last-child .schedule-list');
		if (!lessonsListContainer) return;

		const key = `${state.building}_${state.classNum}_${state.day}`;
		const currentLessons = (typeof lessonsData !== 'undefined' && lessonsData[key]) ? lessonsData[key] : [];

		if (!currentLessons || currentLessons.length === 0) {
			lessonsListContainer.innerHTML = `
                <li class="schedule-item">
                    <p class="schedule-item__text">Уроков нет или расписание не заполнено</p>
                </li>
            `;
			return;
		}

		// Получаем полные шаблоны времени для сопоставления уроков
		let templateKey = 'regular';
		if (state.day === 'thu') templateKey = 'thursday';
		if (state.day === 'sat') templateKey = 'saturday';
		const fullBellsTemplate = scheduleTemplates[templateKey];

		lessonsListContainer.innerHTML = currentLessons.map(lesson => {
			const bellInfo = fullBellsTemplate.find(b => b.title === lesson.num);
			const timeText = bellInfo ? bellInfo.time : '';
			return `
                <li class="schedule-item">
                    <p class="schedule-item__text">${lesson.num}</p>
                    <div class="schedule-item__info">
                        <p class="schedule-item__subject">${lesson.subject}</p>
                        <p class="schedule-item__title">каб. ${lesson.room} • ${lesson.teacher}</p>
                    </div>
                    <p class="schedule-item__time">${timeText}</p>
                </li>
            `;
		}).join('');
	}

	function renderSchedule() {
		const bells = generateBellsSchedule(state.building, state.day);
		const bellsListContainer = document.querySelector('.schedule-card:first-child .schedule-list');

		if (bellsListContainer) {
			bellsListContainer.innerHTML = bells.map(item => {
				const modClass = item.type !== 'lesson' ? `schedule-item--${item.type}` : '';
				const iconImg = item.icon ? `<img src="assets/icons/${item.icon}" alt="${item.title}">` : '';

				return `
                    <li class="schedule-item ${modClass}">
                        <p class="schedule-item__text">${iconImg}${item.title}</p>
                        <p class="schedule-item__time">${item.time}</p>
                    </li>
                `;
			}).join('');
		}

		renderLessons();
	}

	function renderClassTabs(buildingKey) {
		const classes = campusConfig[buildingKey].classes;
		classTabsContainer.innerHTML = '';

		if (!classes.includes(state.classNum)) {
			state.classNum = classes[0];
		}

		classes.forEach((num) => {
			const btn = document.createElement('button');
			btn.className = `class-btn ${num === state.classNum ? 'class-btn--active' : ''}`;
			btn.dataset.class = num;
			btn.textContent = `${num} класс`;

			btn.addEventListener('click', () => {
				document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('class-btn--active'));
				btn.classList.add('class-btn--active');
				state.classNum = num;
				renderSchedule();
			});

			classTabsContainer.appendChild(btn);
		});
	}

	function renderDayTabs(buildingKey) {
		const days = campusConfig[buildingKey].days;
		dayTabsContainer.innerHTML = '';

		const isCurrentDayAvailable = days.some(d => d.id === state.day);
		if (!isCurrentDayAvailable) {
			state.day = 'mon';
		}

		days.forEach(dayObj => {
			const btn = document.createElement('button');
			btn.className = `day-btn ${dayObj.id === state.day ? 'day-btn--active' : ''}`;
			btn.dataset.day = dayObj.id;
			btn.textContent = dayObj.label;

			btn.addEventListener('click', () => {
				document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('day-btn--active'));
				btn.classList.add('day-btn--active');
				state.day = dayObj.id;
				renderSchedule();
			});

			dayTabsContainer.appendChild(btn);
		});
	}

	campusCards.forEach(card => {
		card.addEventListener('click', () => {
			campusCards.forEach(c => c.classList.remove('campus-card--active'));
			card.classList.add('campus-card--active');

			const building = card.dataset.building;
			state.building = building;

			renderClassTabs(building);
			renderDayTabs(building);
			renderSchedule();
		});
	});

	renderClassTabs(state.building);
	renderDayTabs(state.building);
	renderSchedule();
});