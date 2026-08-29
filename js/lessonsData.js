const subjects = [
	'Математика', 'Русский язык', 'Литература', 'Физика',
	'Химия', 'Биология', 'История', 'Обществознание',
	'География', 'Информатика', 'Английский язык', 'Физкультура'
];

const teachers = [
	'Иванова И.И.', 'Петров П.П.', 'Сидоров С.С.',
	'Смирнова А.А.', 'Кузнецов В.В.', 'Попова Е.М.'
];

// Функция для получения рандомного элемента из массива
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Функция генерации рандомного числа в диапазоне [min, max]
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateLessonsCount(classNum) {
	// Младшие классы (1-4) -> строго 5 уроков
	if (classNum <= 4) return 5;

	// Старшие классы (5-11):
	// 5 класс -> 6 уроков
	// 6-8 классы -> 6-7 уроков
	// 9-11 классы -> 7-8 уроков
	if (classNum === 5) return 6;
	if (classNum <= 8) return getRandomInt(6, 7);
	return getRandomInt(7, 8);
}

function generateDaySchedule(lessonsCount) {
	const daySchedule = [];
	for (let i = 1; i <= lessonsCount; i++) {
		daySchedule.push({
			num: `${i} урок`,
			subject: getRandom(subjects),
			room: `${getRandomInt(101, 415)}`,
			teacher: getRandom(teachers)
		});
	}
	return daySchedule;
}

const lessonsData = {};

const campusStructure = {
	spassky: {
		classes: [1, 2, 3, 4],
		days: ['mon', 'tue', 'wed', 'thu', 'fri']
	},
	pokrovsky: {
		classes: [5, 6, 7, 8, 9, 10, 11],
		days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']
	}
};

// Заполняем lessonsData для каждого корпуса, класса и дня
Object.entries(campusStructure).forEach(([buildingKey, config]) => {
	config.classes.forEach(classNum => {
		config.days.forEach(day => {
			const lessonsCount = generateLessonsCount(classNum);
			lessonsData[`${buildingKey}_${classNum}_${day}`] = generateDaySchedule(lessonsCount);
		});
	});
});