let currentBuilding = 'spassky';
let currentWeek = 'week1';
let currentDay = 'day1';


const menuData = {
	spassky: {
		week1: {
			day1: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Каша рисовая молочная с маслом сливочным', weight: '210 г' },
						{ name: 'Яблоко свежее', weight: '1 шт' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб пшеничный', weight: '32 г' }
					],
					kbju: 'Б: 15г Ж: 16г У: 136г | 409 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Суп картофельный с горохом, мясом', weight: '212 г' },
						{ name: 'Сосиска отварная', weight: '60 г' },
						{ name: 'Макароны отварные с маслом сливочным', weight: '157 г' },
						{ name: 'Сок фруктовый', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '29 г' }
					],
					kbju: 'Б: 26г Ж: 32г У: 77г | 624 ккал'
				}
			},
			day2: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Куры в соусе', weight: '80/30 г' },
						{ name: 'Рис отварной', weight: '150 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '52 г' }
					],
					kbju: 'Б: 18г Ж: 21г У: 78г | 584 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Щи с картофелем', weight: '200 г' },
						{ name: 'Биточки из филе кур', weight: '60 г' },
						{ name: 'Картофельное пюре', weight: '150 г' },
						{ name: 'Компот из сухофруктов', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '25 г' }
					],
					kbju: 'Б: 28г Ж: 28г У: 84г | 712 ккал'
				}
			},
			day3: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Запеканка из творога с молоком сгущеным', weight: '150/20 г' },
						{ name: 'Масло сливочное', weight: '10 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб пшеничный', weight: '65 г' }
					],
					kbju: 'Б: 21г Ж: 18г У: 115г | 333 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Рассольник домашний', weight: '200 г' },
						{ name: 'Жаркое по-домашнему', weight: '210 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '45 г' }
					],
					kbju: 'Б: 24г Ж: 20г У: 58г | 792 ккал'
				}
			},
			day4: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Митболы в соусе', weight: '60/40 г' },
						{ name: 'Картофельное пюре', weight: '150 г' },
						{ name: 'Огурец свежий', weight: '20 г' },
						{ name: 'Компот из сухофруктов', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '41 г' }
					],
					kbju: 'Б: 24г Ж: 15г У: 117г | 599 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Борщ из св. капусты с картофелем, сметаной', weight: '205 г' },
						{ name: 'Гуляш из свинины', weight: '100 г' },
						{ name: 'Каша гречневая с маслом сливочным', weight: '153 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '42 г' }
					],
					kbju: 'Б: 24г Ж: 27г У: 85г | 642 ккал'
				}
			},
			day5: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Котлета из цыплят', weight: '75 г' },
						{ name: 'Макароны отварные с маслом сливочным', weight: '160 г' },
						{ name: 'Сок фруктовый', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '28 г' }
					],
					kbju: 'Б: 28г Ж: 22г У: 73г | 538 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Суп картофельный с горохом', weight: '200 г' },
						{ name: 'Плов', weight: '200 г' },
						{ name: 'Компот из сухофруктов', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '30 г' }
					],
					kbju: 'Б: 16г Ж: 19г У: 101г | 505 ккал'
				}
			}
		},
		week2: {
			day1: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Каша молочная пшенная с маслом слив.', weight: '215 г' },
						{ name: 'Сыр порционно', weight: '23 г' },
						{ name: 'Кофейный напиток', weight: '200 г' },
						{ name: 'Хлеб пшеничный', weight: '57 г' }
					],
					kbju: 'Б: 14г Ж: 16г У: 84г | 455 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Суп картофельный с горохом, свининой', weight: '212 г' },
						{ name: 'Сосиска отварная', weight: '60 г' },
						{ name: 'Макароны отварные с маслом сливочным', weight: '160 г' },
						{ name: 'Сок фруктовый', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '25 г' }
					],
					kbju: 'Б: 21г Ж: 25г У: 85г | 733 ккал'
				}
			},
			day2: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Омлет натуральный с м.с.', weight: '166 г' },
						{ name: 'Сосиска отварная', weight: '60 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб пшеничный', weight: '33 г' }
					],
					kbju: 'Б: 27г Ж: 43г У: 36г | 510 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Щи из св. капусты с картофелем', weight: '200 г' },
						{ name: 'Куры в соусе', weight: '60/30 г' },
						{ name: 'Картофельное пюре', weight: '150 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '30 г' }
					],
					kbju: 'Б: 18г Ж: 27г У: 63г | 625 ккал'
				}
			},
			day3: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Гуляш из свинины', weight: '70/50 г' },
						{ name: 'Каша гречневая с маслом сливочным', weight: '152 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '25 г' }
					],
					kbju: 'Б: 21г Ж: 23г У: 67г | 557 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Рассольник домашний со сметаной', weight: '210 г' },
						{ name: 'Биточки из филе кур', weight: '60 г' },
						{ name: 'Макароны отварные с маслом сливочным', weight: '157 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '48 г' }
					],
					kbju: 'Б: 29г Ж: 26г У: 96г | 715 ккал'
				}
			},
			day4: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Шницель рыбный', weight: '70 г' },
						{ name: 'Картофельное пюре', weight: '150 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '34 г' }
					],
					kbju: 'Б: 16г Ж: 23г У: 58г | 586 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Борщ из св. капусты с картофелем и сметаной', weight: '210 г' },
						{ name: 'Митболы в соусе', weight: '60/40 г' },
						{ name: 'Рис отварной', weight: '150 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '31 г' }
					],
					kbju: 'Б: 25г Ж: 16г У: 121г | 574 ккал'
				}
			},
			day5: {
				breakfast: {
					price: '75,92 ₽',
					dishes: [
						{ name: 'Куры в соусе', weight: '80/30 г' },
						{ name: 'Рис отварной', weight: '170 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '26 г' }
					],
					kbju: 'Б: 18г Ж: 21г У: 70г | 584 ккал'
				},
				lunch: {
					price: '70,24 ₽',
					dishes: [
						{ name: 'Суп с вермишелью, цыпленком', weight: '210 г' },
						{ name: 'Котлета из свинины', weight: '65 г' },
						{ name: 'Картофельное пюре', weight: '150 г' },
						{ name: 'Чай с сахаром', weight: '200 г' },
						{ name: 'Хлеб ржаной', weight: '43 г' }
					],
					kbju: 'Б: 15г Ж: 27г У: 88г | 574 ккал'
				}
			}
		}
	}
};

// Привязываем Покровский корпус к той же базе данных
menuData.pokrovsky = menuData.spassky;

function renderMealCard(title, mealData) {
	if (!mealData) return '';

	const dishesHTML = mealData.dishes.map(dish => `
        <li class="meal-card__item">
            <span class="meal-card__dish-name">${dish.name}</span>
            <span class="meal-card__dish-weight">${dish.weight}</span>
        </li>
    `).join('');

	return `
        <div class="meal-card">
            <div class="meal-card__header">
                <span class="meal-card__title">${title}</span>
                <span class="meal-card__price">${mealData.price}</span>
            </div>
            <ul class="meal-card__list">
                ${dishesHTML}
            </ul>
            <div class="meal-card__footer">
                <span class="meal-card__kbju">${mealData.kbju}</span>
            </div>
        </div>
    `;
}

function updateMenu() {
	const dayData = menuData[currentBuilding]?.[currentWeek]?.[currentDay];

	if (!dayData) {
		console.error('Данные не найдены');
		return;
	}

	const container = document.querySelector('.canteen-board__meals');
	container.innerHTML = renderMealCard('ЗАВТРАК', dayData.breakfast) +
		renderMealCard('ОБЕД', dayData.lunch);
}

const dayButtons = document.querySelectorAll('.tab-group:nth-child(2) .tab-btn');

dayButtons.forEach(btn => {
	btn.addEventListener('click', () => {
		dayButtons.forEach(b => b.classList.remove('tab-btn--active'));
		btn.classList.add('tab-btn--active');

		currentDay = btn.dataset.day;
		updateMenu()
	});
});


const weekButtons = document.querySelectorAll('.tab-group:nth-child(1) .tab-btn');

weekButtons.forEach(btn => {
	btn.addEventListener('click', () => {
		weekButtons.forEach(b => b.classList.remove('tab-btn--active'));
		btn.classList.add('tab-btn--active');

		currentWeek = btn.dataset.week;
		updateMenu()
	});
});


const campusButtons = document.querySelectorAll('.building-card');

campusButtons.forEach(btn => {
	btn.addEventListener('click', (e) => {
		campusButtons.forEach(b => b.classList.remove('building-card--active'));
		btn.classList.add('building-card--active');

		currentBuilding = btn.dataset.Building;
		currentBuilding = e.currentTarget.dataset.building
		updateMenu()
	});
});



updateMenu();