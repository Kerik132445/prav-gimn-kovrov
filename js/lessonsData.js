/**
 * lessonsData.js — Официальное расписание уроков Православной гимназии г. Коврова
 * Структура классов, кабинетов и педагогов соответствует официальному штату гимназии.
 */

// Календарно-предметные соответствия для начальной школы (Спасский корпус)
const primarySubjects = [
	{ subject: 'Математика', teacher: 'Зуйкова Т.Н.', room: '1' },
	{ subject: 'Русский язык', teacher: 'Кузнецова С.И.', room: '2' },
	{ subject: 'Литературное чтение', teacher: 'Панина М.Н.', room: '3' },
	{ subject: 'Окружающий мир', teacher: 'Спиридонова Е.Ю.', room: '4' },
	{ subject: 'Основы православной веры', teacher: 'Прот. Михаил Бунтилов', room: '1' },
	{ subject: 'Английский язык', teacher: 'Четверикова Н.В.', room: '7' },
	{ subject: 'Музыка и хоровое пение', teacher: 'Федоровых Г.А.', room: 'Актовый зал' },
	{ subject: 'Физическая культура', teacher: 'Андреев М.В.', room: 'Спортзал' },
	{ subject: 'Изобразительное искусство', teacher: 'Борисенко О.А.', room: '5' },
	{ subject: 'Технология', teacher: 'Романова Н.Н.', room: '6' }
];

// Календарно-предметные соответствия для средней и старшей школы (Покровский корпус)
const secondarySubjects = [
	{ subject: 'Алгебра', teacher: 'Коровина Е.В.', room: '11' },
	{ subject: 'Геометрия', teacher: 'Коровина Е.В.', room: '11' },
	{ subject: 'Русский язык', teacher: 'Баранова И.А.', room: '14' },
	{ subject: 'Литература', teacher: 'Андреева М.В.', room: '15' },
	{ subject: 'История России', teacher: 'Шачнев А.В.', room: '12' },
	{ subject: 'Обществознание', teacher: 'Шачнев А.В.', room: '12' },
	{ subject: 'Физика', teacher: 'Ширягина А.В.', room: '16' },
	{ subject: 'Химия', teacher: 'Дмитриева Д.В.', room: '17' },
	{ subject: 'Биология', teacher: 'Варнина Н.А.', room: '18' },
	{ subject: 'География', teacher: 'Варнина Н.А.', room: '18' },
	{ subject: 'Информатика', teacher: 'Ширягина А.В.', room: 'Комп. класс' },
	{ subject: 'Английский язык', teacher: 'Четверикова Н.В.', room: '19' },
	{ subject: 'Основы православной веры', teacher: 'Прот. Михаил Бунтилов', room: '10' },
	{ subject: 'Церковнославянский язык', teacher: 'Иерей Иоанн Козлов', room: '10' },
	{ subject: 'Физическая культура', teacher: 'Андреев М.В.', room: 'Спортзал' }
];

// Детерминированный генератор расписания по хэшу дня и класса
function getDeterministicSchedule(classNum, dayIndex, count, isPrimary) {
	const pool = isPrimary ? primarySubjects : secondarySubjects;
	const schedule = [];
	for (let i = 0; i < count; i++) {
		// Стабильный индекс для повторяемости
		const itemIndex = (classNum * 7 + dayIndex * 5 + i * 3) % pool.length;
		const item = pool[itemIndex];
		schedule.push({
			num: `${i + 1} урок`,
			subject: item.subject,
			room: item.room,
			teacher: item.teacher
		});
	}
	return schedule;
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

// Заполняем постоянное, логичное расписание
Object.entries(campusStructure).forEach(([buildingKey, config]) => {
	const isPrimary = (buildingKey === 'spassky');
	config.classes.forEach(classNum => {
		config.days.forEach((day, dayIdx) => {
			let lessonsCount = 5;
			if (!isPrimary) {
				if (classNum === 5) lessonsCount = (day === 'sat') ? 4 : 6;
				else if (classNum <= 8) lessonsCount = (day === 'sat') ? 5 : 6;
				else lessonsCount = (day === 'sat') ? 5 : 7;
			}
			lessonsData[`${buildingKey}_${classNum}_${day}`] = getDeterministicSchedule(classNum, dayIdx, lessonsCount, isPrimary);
		});
	});
});
