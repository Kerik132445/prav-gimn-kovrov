const API_URL = `${window.API_BASE_URL}/api/auth`;


const loginForm = document.getElementById("login-form");
const loginButton =
	document.getElementById("login-button");
const loginError = document.getElementById("login-error");


console.log("LOGIN JS ЗАПУЩЕН");

window.addEventListener("beforeunload", () => {
	console.log("СТРАНИЦА ПЕРЕЗАГРУЖАЕТСЯ!");
});

console.log("ТЕКУЩИЙ АДРЕС API:", API_URL);


loginButton.addEventListener("click", async (event) => {

	// Полностью запрещаем стандартное поведение кнопки
	event.preventDefault();

	console.log("КНОПКА ВХОДА НАЖАТА");


	loginError.textContent = "";

	const username =
		document.getElementById("username").value.trim();

	const password =
		document.getElementById("password").value;


	if (!username || !password) {

		loginError.textContent =
			"Введите логин и пароль.";

		return;
	}


	loginButton.disabled = true;
	loginButton.textContent = "Вход...";


	try {

		console.log("Отправляем запрос на сервер...");


		const response = await fetch(
			`${API_URL}/login`,
			{
				method: "POST",

				headers: {
					"Content-Type": "application/json"
				},

				credentials: "include",

				body: JSON.stringify({
					username: username,
					password: password
				})
			}
		);


		const data = await response.json();


		console.log(
			"Ответ сервера:",
			response.status,
			data
		);


		if (!response.ok) {

			loginError.textContent =
				data.detail || "Неверный логин или пароль";

			loginButton.disabled = false;
			loginButton.textContent = "Войти";

			return;
		}


		console.log("ВХОД УСПЕШНЫЙ");
		localStorage.setItem("admin_session_active", "1");
		window.location.replace("index.html");


	} catch (error) {

		console.error(
			"Ошибка:",
			error
		);


		loginError.textContent =
			"Не удалось подключиться к серверу.";


		loginButton.disabled = false;
		loginButton.textContent = "Войти";
	}

});