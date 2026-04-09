/* ============================================
   Weather Dashboard - JavaScript
   Fetches weather data from OpenWeatherMap API,
   handles search history, error states, and
   displays current weather + 5-day forecast.
   ============================================ */

// ---- Configuration ----
// Replace with your own OpenWeatherMap API key
// Sign up free at: https://openweathermap.org/appid
const API_KEY = "8c25a0d4233b4e7e19f619aff571c8fe";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ---- DOM Element References ----
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const currentWeatherEl = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");
const forecastCards = document.getElementById("forecastCards");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const loadingEl = document.getElementById("loading");
const searchHistoryEl = document.getElementById("searchHistory");
const searchHistoryContainer = document.getElementById("searchHistoryContainer");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Current weather detail elements
const cityNameEl = document.getElementById("cityName");
const dateTimeEl = document.getElementById("dateTime");
const temperatureEl = document.getElementById("temperature");
const weatherDescEl = document.getElementById("weatherDescription");
const weatherIconEl = document.getElementById("weatherIcon");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const cloudsEl = document.getElementById("clouds");

// ---- Background Particles Animation ----
// Creates floating particle elements for the animated background
function createParticles() {
    const container = document.getElementById("bgParticles");
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Randomize size, position, and animation duration
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;

        container.appendChild(particle);
    }
}

// ---- Utility Functions ----

/**
 * Shows the loading spinner and hides other sections
 */
function showLoading() {
    loadingEl.classList.add("visible");
    currentWeatherEl.classList.remove("visible");
    forecastSection.classList.remove("visible");
    hideError();
}

/**
 * Hides the loading spinner
 */
function hideLoading() {
    loadingEl.classList.remove("visible");
}

/**
 * Displays an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add("visible");
    currentWeatherEl.classList.remove("visible");
    forecastSection.classList.remove("visible");
}

/**
 * Hides the error message
 */
function hideError() {
    errorMessage.classList.remove("visible");
}

/**
 * Formats a Unix timestamp to a readable date string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date string
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
}

/**
 * Formats a Unix timestamp to a readable time string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted time string
 */
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Gets the day name from a date string (YYYY-MM-DD)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Short day name (e.g., "Mon")
 */
function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Formats a date string to a short date (e.g., "Apr 10")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Short date string
 */
function formatShortDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---- API Functions ----

/**
 * Fetches current weather data for a given city
 * @param {string} city - City name to fetch weather for
 * @returns {Object} Weather data from the API
 */
async function fetchCurrentWeather(city) {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("City not found. Please check the spelling and try again.");
        } else if (response.status === 401) {
            throw new Error("Invalid API key. Please check your OpenWeatherMap API key.");
        } else {
            throw new Error("Failed to fetch weather data. Please try again later.");
        }
    }

    return await response.json();
}

/**
 * Fetches 5-day forecast data for a given city
 * @param {string} city - City name to fetch forecast for
 * @returns {Object} Forecast data from the API
 */
async function fetchForecast(city) {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch forecast data.");
    }

    return await response.json();
}

// ---- Display Functions ----

/**
 * Displays current weather data on the page
 * @param {Object} data - Weather data object from the API
 */
function displayCurrentWeather(data) {
    // Set city name and date/time
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    dateTimeEl.textContent = `${formatDate(data.dt)} • ${formatTime(data.dt)}`;

    // Set temperature and description
    temperatureEl.textContent = Math.round(data.main.temp);
    weatherDescEl.textContent = data.weather[0].description;

    // Set weather icon (using OpenWeatherMap icons)
    const iconCode = data.weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIconEl.alt = data.weather[0].description;

    // Set weather detail values
    feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    pressureEl.textContent = `${data.main.pressure} hPa`;
    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    cloudsEl.textContent = `${data.clouds.all}%`;

    // Show the current weather section with animation
    currentWeatherEl.classList.add("visible");
}

/**
 * Processes the forecast API response and groups data by day,
 * then displays it as forecast cards.
 * The API returns data every 3 hours; we pick one entry per day
 * (the one closest to midday) to represent each day's forecast.
 * @param {Object} data - Forecast data object from the API
 */
function displayForecast(data) {
    forecastCards.innerHTML = "";

    // Group forecast items by date
    const dailyMap = {};
    data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0]; // Extract YYYY-MM-DD
        if (!dailyMap[date]) {
            dailyMap[date] = [];
        }
        dailyMap[date].push(item);
    });

    // Get today's date string to skip it
    const today = new Date().toISOString().split("T")[0];
    const days = Object.keys(dailyMap).filter((d) => d !== today);

    // Take only 5 days
    const fiveDays = days.slice(0, 5);

    fiveDays.forEach((dateStr) => {
        const dayData = dailyMap[dateStr];

        // Pick the entry closest to 12:00 (midday) for best representation
        let midday = dayData.find((d) => d.dt_txt.includes("12:00:00"));
        if (!midday) midday = dayData[Math.floor(dayData.length / 2)];

        // Calculate min and max temperatures for the day
        const temps = dayData.map((d) => d.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));

        // Get average humidity for the day
        const avgHumidity = Math.round(
            dayData.reduce((sum, d) => sum + d.main.humidity, 0) / dayData.length
        );

        // Get weather icon from the midday reading
        const iconCode = midday.weather[0].icon;

        // Create the forecast card element
        const card = document.createElement("div");
        card.classList.add("forecast-card");
        card.innerHTML = `
            <div class="forecast-day">${getDayName(dateStr)}</div>
            <div class="forecast-date">${formatShortDate(dateStr)}</div>
            <img class="forecast-icon" 
                 src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                 alt="${midday.weather[0].description}">
            <div class="forecast-temp">${Math.round(midday.main.temp)}°C</div>
            <div class="forecast-temp-range">${minTemp}° / ${maxTemp}°</div>
            <div class="forecast-humidity">
                <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z" 
                          fill="currentColor"/>
                </svg>
                ${avgHumidity}%
            </div>
        `;

        forecastCards.appendChild(card);
    });

    // Show the forecast section with animation
    forecastSection.classList.add("visible");
}

// ---- Search History (Local Storage) ----

/**
 * Retrieves search history from local storage
 * @returns {string[]} Array of previously searched city names
 */
function getSearchHistory() {
    const history = localStorage.getItem("weatherSearchHistory");
    return history ? JSON.parse(history) : [];
}

/**
 * Saves a city name to the search history in local storage.
 * Prevents duplicates and limits history to 8 entries.
 * @param {string} city - City name to add to history
 */
function saveToHistory(city) {
    let history = getSearchHistory();

    // Remove duplicate if exists (case-insensitive)
    history = history.filter((item) => item.toLowerCase() !== city.toLowerCase());

    // Add the new city at the beginning
    history.unshift(city);

    // Keep only the last 8 entries
    if (history.length > 8) {
        history = history.slice(0, 8);
    }

    localStorage.setItem("weatherSearchHistory", JSON.stringify(history));
    renderSearchHistory();
}

/**
 * Renders the search history chips in the UI.
 * Each chip is clickable to re-search that city.
 */
function renderSearchHistory() {
    const history = getSearchHistory();
    searchHistoryEl.innerHTML = "";

    if (history.length === 0) {
        searchHistoryContainer.classList.remove("visible");
        return;
    }

    searchHistoryContainer.classList.add("visible");

    history.forEach((city) => {
        const chip = document.createElement("button");
        chip.classList.add("history-chip");
        chip.textContent = city;
        chip.setAttribute("aria-label", `Search weather for ${city}`);

        // Clicking a history chip triggers a new search for that city
        chip.addEventListener("click", () => {
            cityInput.value = city;
            handleSearch();
        });

        searchHistoryEl.appendChild(chip);
    });
}

/**
 * Clears all search history from local storage and UI
 */
function clearSearchHistory() {
    localStorage.removeItem("weatherSearchHistory");
    renderSearchHistory();
}

// ---- Main Search Handler ----

/**
 * Handles the search action:
 * 1. Validates the input
 * 2. Fetches current weather + forecast
 * 3. Displays the results or shows an error
 */
async function handleSearch() {
    const city = cityInput.value.trim();

    // Input validation - prevent blank searches
    if (!city) {
        showError("Please enter a city name to search.");
        return;
    }

    // Show loading state
    showLoading();

    try {
        // Fetch current weather and forecast data in parallel
        const [weatherData, forecastData] = await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city),
        ]);

        // Hide loading and display results
        hideLoading();
        displayCurrentWeather(weatherData);
        displayForecast(forecastData);

        // Save the successfully searched city to history
        // Use the city name from the API response for proper casing
        saveToHistory(weatherData.name);
    } catch (error) {
        // Hide loading and show error message
        hideLoading();
        showError(error.message);
    }
}

// ---- Event Listeners ----

// Search button click
searchBtn.addEventListener("click", handleSearch);

// Enter key press in input field
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

// Clear search history button
clearHistoryBtn.addEventListener("click", clearSearchHistory);

// ---- Initialization ----
function initDashboard() {
    // Create animated background particles
    createParticles();

    // Render search history
    renderSearchHistory();

    // Auto-load weather so the dashboard isn't empty
    const history = getSearchHistory();
    const initialCity = history.length > 0 ? history[0] : "Islamabad";

    cityInput.value = initialCity;
    handleSearch();
}

initDashboard();
