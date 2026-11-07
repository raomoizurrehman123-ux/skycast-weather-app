
// ==========================================
// OPENWEATHERMAP API CONFIGURATION
// ==========================================

// Get your API key from:
// https://home.openweathermap.org/api_keys

const API_KEY = "YOUR_ACTUAL_API_KEY";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

let unit = "metric";
let lastCity = "";

// ==========================================
// HTML ELEMENTS
// ==========================================

const $ = (selector) => document.querySelector(selector);

const form = $("#searchForm");
const cityInput = $("#cityInput");
const searchButton = $("#searchButton");
const weatherContent = $("#weatherContent");
const statusMessage = $("#statusMessage");

// ==========================================
// STATUS MESSAGES
// ==========================================

function showStatus(message, type = "error") {
    statusMessage.hidden = false;
    statusMessage.className = `status-message ${type}`;
    statusMessage.replaceChildren();

    if (type === "loading") {
        const spinner = document.createElement("span");
        spinner.className = "spinner";
        statusMessage.append(spinner);
    }

    statusMessage.append(document.createTextNode(message));
}

function hideStatus() {
    statusMessage.hidden = true;
    statusMessage.className = "status-message";
}

// ==========================================
// WEATHER ICONS
// ==========================================

function weatherEmoji(main, iconCode = "") {
    const key = (main || "").toLowerCase();

    if (key.includes("thunder")) return "⛈️";
    if (key.includes("drizzle")) return "🌦️";
    if (key.includes("rain")) return "🌧️";
    if (key.includes("snow")) return "❄️";

    if (
        key.includes("mist") ||
        key.includes("fog") ||
        key.includes("haze") ||
        key.includes("smoke")
    ) {
        return "🌫️";
    }

    if (key.includes("cloud")) {
        return iconCode.includes("02") ? "🌤️" : "☁️";
    }

    if (key.includes("clear")) {
        return iconCode.endsWith("n") ? "🌙" : "☀️";
    }

    return "🌤️";
}

// ==========================================
// TEMPERATURE CONVERSION
// ==========================================

function temperature(value) {
    const rounded = Math.round(value);
    return `${rounded}°${unit === "metric" ? "C" : "F"}`;
}

// ==========================================
// DATE FORMATTING
// ==========================================

function displayDate(
    timestamp,
    options = {
        weekday: "long",
        month: "short",
        day: "numeric"
    }
) {
    return new Intl.DateTimeFormat(
        undefined,
        options
    ).format(new Date(timestamp * 1000));
}

// ==========================================
// FETCH API DATA
// ==========================================

async function fetchJson(url) {
    const response = await fetch(url);

    let data;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error(
                "Invalid API key. Check your OpenWeatherMap API key or wait for activation."
            );
        }

        if (response.status === 404) {
            throw new Error(
                "City not found. Please check the spelling."
            );
        }

        if (response.status === 429) {
            throw new Error(
                "Too many requests. Please try again later."
            );
        }

        throw new Error(
            data?.message ||
            `Weather service error: ${response.status}`
        );
    }

    return data;
}

// ==========================================
// SEARCH WEATHER
// ==========================================

async function searchWeather(city) {
    const trimmed = city.trim();

    if (!trimmed) {
        showStatus("Please enter a city name.");
        cityInput.focus();
        return;
    }

    if (
        !API_KEY ||
        API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE"
    ) {
        showStatus(
            "Please add your OpenWeatherMap API key in script.js."
        );
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Loading...";

    weatherContent.hidden = true;

    showStatus(
        `Getting live weather for ${trimmed}...`,
        "loading"
    );

    try {
        const params = new URLSearchParams({
            q: trimmed,
            appid: API_KEY,
            units: unit
        });

        const [current, forecast] = await Promise.all([
            fetchJson(`${BASE_URL}/weather?${params}`),
            fetchJson(`${BASE_URL}/forecast?${params}`)
        ]);

        lastCity = trimmed;

        renderWeather(current, forecast);

        hideStatus();
        weatherContent.hidden = false;

    } catch (error) {
        console.error("Weather API Error:", error);

        showStatus(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = 'Search <span>↗</span>';
    }
}

// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function renderWeather(current, forecast) {
    const weather = current.weather?.[0] || {};

    $("#cityName").textContent =
        `${current.name}, ${current.sys?.country || ""}`;

    $("#currentDate").textContent =
        displayDate(current.dt);

    $("#temperature").textContent =
        temperature(current.main.temp);

    $("#condition").textContent =
        weather.main || "Unknown";

    $("#feelsLike").textContent =
        `Feels like ${temperature(current.main.feels_like)}`;

    $("#weatherArt").textContent =
        weatherEmoji(weather.main, weather.icon);

    $("#weatherDescription").textContent =
        weather.description || "Current weather conditions";

    $("#humidity").textContent =
        `${current.main.humidity}%`;

    $("#wind").textContent =
        `${current.wind.speed}`;

    $("#windUnit").textContent =
        unit === "metric"
            ? "Meters per second"
            : "Miles per hour";

    $("#pressure").textContent =
        `${current.main.pressure} hPa`;

    $("#visibility").textContent =
        `${(current.visibility / 1000).toFixed(1)} km`;

    $("#updatedLabel").textContent =
        `UPDATED ${new Intl.DateTimeFormat(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        ).format(new Date(current.dt * 1000))}`;

    $("#coordinates").textContent =
        `LAT ${current.coord.lat.toFixed(2)} · LON ${current.coord.lon.toFixed(2)}`;

    // Daily forecast
    const daily = groupForecastByDay(forecast.list);

    const today = daily[0] || forecast.list;

    const todayTemps = today.map(
        item => item.main.temp
    );

    $("#todayHigh").textContent =
        temperature(Math.max(...todayTemps));

    $("#todayLow").textContent =
        temperature(Math.min(...todayTemps));

    $("#sunNote").textContent =
        `Sunrise ${displayDate(
            current.sys.sunrise,
            { hour: "2-digit", minute: "2-digit" }
        )} · Sunset ${displayDate(
            current.sys.sunset,
            { hour: "2-digit", minute: "2-digit" }
        )}`;

    renderForecast(daily.slice(1, 6));
}

// ==========================================
// GROUP FORECAST BY DAY
// ==========================================

function groupForecastByDay(items) {
    const groups = new Map();

    items.forEach(item => {
        const date = new Date(item.dt * 1000);

        const key =
            `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key).push(item);
    });

    return [...groups.values()];
}

// ==========================================
// DISPLAY FIVE-DAY FORECAST
// ==========================================

function renderForecast(days) {
    const grid = $("#forecastGrid");

    grid.replaceChildren();

    days.forEach(dayItems => {
        const midday =
            dayItems.find(item => {
                const hour = new Date(
                    item.dt * 1000
                ).getHours();

                return hour >= 11 && hour <= 15;

            }) ||
            dayItems[Math.floor(dayItems.length / 2)];

        const temps = dayItems.map(
            item => item.main.temp
        );

        const card = document.createElement("article");
        card.className = "forecast-card";

        const day = document.createElement("div");
        day.className = "day";

        day.textContent = displayDate(
            midday.dt,
            { weekday: "short" }
        );

        const icon = document.createElement("div");
        icon.className = "forecast-icon";

        icon.textContent = weatherEmoji(
            midday.weather?.[0]?.main,
            midday.weather?.[0]?.icon
        );

        const desc = document.createElement("div");
        desc.className = "forecast-desc";

        desc.textContent =
            midday.weather?.[0]?.description || "No details";

        const tempsRow = document.createElement("div");
        tempsRow.className = "temps";

        const high = document.createElement("strong");

        high.textContent =
            temperature(Math.max(...temps));

        const low = document.createElement("strong");
        low.className = "low";

        low.textContent =
            temperature(Math.min(...temps));

        tempsRow.append(high, low);

        card.append(
            day,
            icon,
            desc,
            tempsRow
        );

        grid.append(card);
    });
}

// ==========================================
// SEARCH FORM EVENT
// ==========================================

form.addEventListener("submit", event => {
    event.preventDefault();

    searchWeather(cityInput.value);
});

// ==========================================
// CELSIUS / FAHRENHEIT TOGGLE
// ==========================================

$("#unitToggle").addEventListener("click", () => {
    unit = unit === "metric" ? "imperial" : "metric";

    $("#unitToggle").innerHTML =
        unit === "metric"
            ? "°C <span>/</span> °F"
            : "°F <span>/</span> °C";

    if (lastCity) {
        searchWeather(lastCity);
    }
});

// ==========================================
// DEFAULT CITY
// ==========================================

cityInput.value = "London";

searchWeather("London");
