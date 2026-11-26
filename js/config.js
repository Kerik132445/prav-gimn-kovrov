(function () {
	// Поддержка ручного переопределения через localStorage при необходимости тестирования
	try {
		const savedUrl = typeof localStorage !== "undefined" ? localStorage.getItem("API_BASE_URL") : null;
		if (savedUrl) {
			window.API_BASE_URL = savedUrl;
			return;
		}
	} catch (e) {
		// localStorage может быть заблокирован в некоторых sandbox/iframe
	}

	const isLiveServerOrFile = typeof window !== "undefined" && (
		window.location.protocol === "file:" ||
		!window.location.hostname ||
		["5500", "5501", "3000", "5173"].includes(window.location.port)
	);

	// Локально с Live Server / file: подключаемся к FastAPI на порту 8000.
	// Когда фронт открыт прямо с FastAPI или на боевом домене — используем относительные пути.
	window.API_BASE_URL = isLiveServerOrFile ? "http://127.0.0.1:8000" : "";
})();

