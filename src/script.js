// API key for OpenWeatherMap.
const API_KEY = "3f807c3308ebb737e45cf9b85af0163b";

// Use the 2.5 API base for current weather and 5-day forecast endpoints.
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const DEFAULT_CITY = "Bengaluru";

// Fetchs default city Weather Forecast.
window.addEventListener('load', () => {
  if (DEFAULT_CITY && DEFAULT_CITY.trim() !== '') {
    getCoordinates(DEFAULT_CITY);
  }
});

// DOM elements
const appBody = document.getElementById("app-body");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationButton = document.getElementById("current-loc-btn");
const searchHistorySelect = document.getElementById("Search-his-select");
const alertContainer = document.getElementById('alert-container');
const weatherDisplay = document.getElementById('weather-display');
const currentTempSpan = document.getElementById('current-temp');
const tempUnitSpan = document.getElementById('temp-unit');
const forecastContainer = document.getElementById('forecast-container');

// State Management
let isCelsius = true;
let currentWeatherData = null;

// UTILITY FUNCTIONS

/** Extract a helpful error message from an API response.
* @param {Response} response
* @returns {Promise<string|null>}
*/
async function getResponseErrorMessage(response) {
    try {
        const json = await response.json();
        if (!json) return null;
        if (json.message) return json.message;
        if (json.error) return json.error;
        return JSON.stringify(json);
    } catch (error) {
        return response.statusText || `status ${response.status}`;
    }
}

/** 
 * Display an alert message to the user.
 * @param {string} message - The message to display.    
 * @param {string} type - The type 'error' for red box, 'alert' for yellow box. 
 */
function displayMessage(message, type) {
    alertContainer.innerHTML = '';

    let baseclasses = "p-4 rounded-lg font-medium flex items-center justify-between";
    let colorclasses;
    let icon = '';

    if(type === 'error') {
        colorclasses = "bg-red-900 border border-red-700 text-red-300";
        icon = '⚠️';
} else if (type === 'alert') {
    colorclasses = "bg-yellow-900 border border-yellow-700 text-yellow-300";
    icon = '🚨';
} else if (type === 'info') {
    colorclasses = "bg-blue-900 border border-blue-700 text-blue-300";
    icon = 'ℹ';
} else if (type === 'success') {
    colorclasses = "bg-green-900 border border-green-700 text-green-300";
    icon = '✅';
} else {
    return;
}

const messsageHTML = `
    <div class="${baseclasses} ${colorclasses} w-full">
        <span> ${icon} ${message} </span>
        <button class="text-lg font-bold hover:text-white transition duration-150" onclick="alertContainer.innerHTML = ''" >
        &times;
        </button>
    </div>
`;
alertContainer.innerHTML = messsageHTML;
}

/**
 * converts temperature from Kelvin to Celsius or Fahrenheit
 * @param {number} K  Temperature in Kelvin
 * @param {string} unit - 'C' for Celsius, 'F' for Fahrenheit
 * @returns {number} - Converted temperature rounded to 1 decimal places
 */

function convertTemp(K, unit) {
    if(unit === 'C') {
        return (K-273.15).toFixed(1);
    } else if (unit === 'F') {
        return ((K-273.15) * 9/5 + 32).toFixed(1);
    }
    return K.toFixed(1); // Default to Kelvin if unit is unrecognized
}

/**
 * Uptades the app's theme based on the weather condition 
 * @param {string} weatherMain - Main weather condition (e.g., 'Clear', 'Rain', 'Snow')
 */

function updateBackground(weatherMain) {
    // Normalize to lowercase to make comparisons robust
    const key = (weatherMain || '').toString().toLowerCase();

    let bgClass = 'bg-default';
    switch (key) {
        case 'clear':
            bgClass = 'bg-clear';
            break;
        case 'clouds':
            bgClass = 'bg-clouds';
            break;
        case 'rain':
            bgClass = 'bg-rain';
            break;
        case 'snow':
            bgClass = 'bg-snow';
            break;
        case 'thunderstorm':
            bgClass = 'bg-thunderstorm';
            break;
        case 'mist':
        case 'smoke':
        case 'haze':
        case 'dust':
        case 'fog':
        case 'sand':
        case 'ash':
        case 'squall':
        case 'tornado':
            bgClass = 'bg-mist';
            break;
        default:
            bgClass = 'bg-default';
    }

    // Preserve the transition classes and set the new background class
    appBody.className = `bg-gray-900 text-text-light min-h-screen transition-all duration-1000 ${bgClass}`;
}

//  Local Storage Functions

/**
 * Loads recent cities from local storage and poplulate the dropdown.
 */

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    searchHistorySelect.innerHTML = '<option value="" disabled selected>Recent Searches cities</option>';

    if (history.length > 0) {
        searchHistorySelect.disabled = false;
        history.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            searchHistorySelect.appendChild(option);
        });
    } else {
        searchHistorySelect.disabled = true;
    }
}

/**
 * Adds a city to the search history in local storage.
 * @param {string} city - The city name to add.
 */

function addCityToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

    // Avoid duplicates
    history = history.filter(c => c !== city);
    history.unshift(city); // Add to the beginning
    history = history.slice(0, 5); // Keep only the latest 5 entries

    localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    loadSearchHistory();
}

// API FUNCTIONS

/**
 * Fetches cuerrent weather and 5-day forecast data by latitude and longitude.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} City - City name for display purpose.
 */

async function getWeatherByCoords(lat, lon, cityName) {
    if (!API_KEY) {
        displayMessage('API key is missing. Please set your OpenWeatherMap API key.', 'error');
        return;
    }
    displayMessage('Fetching weather data...', 'info');

    const forecastUrl = `${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const currentUrl = `${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log('Fetching weather with URLs:', {currentUrl, forecastUrl});  

    try {
        const [forecastResponse, currentResponse] = await Promise.all([
            fetch(forecastUrl),
            fetch(currentUrl)
        ]);

        if (!forecastResponse.ok || !currentResponse.ok) {
            // Try to extract a helpful message from whichever response failed
            const fMsg = !forecastResponse.ok ? await getResponseErrorMessage(forecastResponse) : null;
            const cMsg = !currentResponse.ok ? await getResponseErrorMessage(currentResponse) : null;
            const status = !forecastResponse.ok ? forecastResponse.status : currentResponse.status;
            const message = fMsg || cMsg || `Status ${status}`;
            throw new Error(`API Error (${status}): ${message}`);
        }

        const forecastData = await forecastResponse.json();
        const currentData = await currentResponse.json();

        // Store the combined data for unit toggling
        currentWeatherData = {
            city: cityName,
            current: currentData,
            forecast: forecastData.list
        };

        // Render data and save history
        renderCurrentWeather(currentData, cityName);
        renderForecast(forecastData.list);
        updateBackground(currentData.weather[0].main);

        // Save history and clear messages on success
        addCityToHistory(cityName);
        displayMessage('Weather data loaded successfully!', 'success');
        weatherDisplay.classList.remove('opacity-0');

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        displayMessage(`Failed to load weather: ${error.message || 'Check your API Key and internet connection.'}`, 'error');
        weatherDisplay.classList.add('opacity-0');
        // Reset to default background on error
        updateBackground('default');
    }
} 

/**
 * Handles city search by first resolving the city name to coordinates.
 * @param {string} city  The city name entered by the user.
 */

async function getCoordinates(city) {
    if (!API_KEY) {
        displayMessage('API key is missing. Please set your OpenWeatherMap API key.', 'error');
        return;
    }   
    displayMessage('Resolving city name...', 'info');
    const geoUrl = `${BASE_URL}weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    
    console.log('Fetching coordinates with URL:', geoUrl);

    try {
        const response = await fetch(geoUrl);
        if (!response.ok) {
            const apiMsg = await getResponseErrorMessage(response);
            if(response.status === 404) {
                displayMessage(`City "${city}" not found. Please check the name and try again.`, 'error');
            } else if (apiMsg) {
                displayMessage(`API Error ${apiMsg}`, 'error');
            } else {
                displayMessage(`API Error: Status ${response.status}`, 'error');
            }
            return;
        }   
        const data = await response.json();
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const cityName = data.name;
        
        await getWeatherByCoords(lat, lon, cityName);
    } catch (error) {
        console.error("Failed to resolve city name:", error);
        displayMessage(`Failed to resolve city: ${error.message || 'Check your API Key and internet connection.'}`, 'error');
    }
}

// --- RENDERING FUNCTIONS ---

/**
 * Renders the current weather data onto the main card.
 */
function renderCurrentWeather(data, cityNameOverride = null) {
    const temp = isCelsius ? data.main.temp.toFixed(1) : ((data.main.temp * 9/5) + 32).toFixed(1);
    const feelsLike = convertTemp(data.main.feels_like + 273.15, isCelsius ? 'C' : 'F');
    const unitSymbol = isCelsius ? '°C' : '°F';
    
    
    if (parseFloat(temp) > 40 && isCelsius) {
        displayMessage(`Extreme Heat Alert! Temperature is ${temp}${unitSymbol}. Stay hydrated!`, 'alert');
    } else if (parseFloat(temp) < -10 && isCelsius) {
         displayMessage(`Extreme Cold Alert! Temperature is ${temp}${unitSymbol}. Dress warmly!`, 'alert');
    } else {
        // Clear non-critical alerts
        if (alertContainer.innerHTML.includes('Alert')) {
             alertContainer.innerHTML = '';
        }
    }


    document.getElementById('current-city-name').textContent = cityNameOverride || data.name;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('current-temp').textContent = temp;
    tempUnitSpan.textContent = unitSymbol;
    
    // Details
    document.getElementById('current-humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('current-wind').textContent = `${data.wind.speed.toFixed(1)} m/s`;
    document.getElementById('current-condition').textContent = data.weather[0].description.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('current-feels-like').textContent = `${feelsLike}${unitSymbol}`;
    
    // Icon
    document.getElementById('current-weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    
    // Additional Stats
    document.getElementById('current-sunrise').textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-sunset').textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-pressure').textContent = `${data.main.pressure} hPa`;
}

/**
 * Renders the 5-day forecast cards.
 * @param {Array} list The list of 3-hour forecast objects.
 */
function renderForecast(list) {
    forecastContainer.innerHTML = '';
    const dailyForecasts = {};

    // Group the 3-hour forecasts by date
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString();

        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: date,
                temps: [],
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                humidity: item.main.humidity,
                wind: item.wind.speed
            };
        }
        // Store all temperatures for the day (to calculate average or midday temp)
        dailyForecasts[dateKey].temps.push(item.main.temp); 
    });

    // Extract the forecasts, skipping the current day
    const forecastDays = Object.values(dailyForecasts).slice(1, 6); 

    if (forecastDays.length === 0) {
        forecastContainer.innerHTML = '<p class="text-gray-400 col-span-full">No extended forecast data available.</p>';
        return;
    }

    forecastDays.forEach(day => {
        const avgTempK = day.temps.reduce((sum, t) => sum + t, 0) / day.temps.length;
        const temp = convertTemp(avgTempK + 273.15, isCelsius ? 'C' : 'F');
        const unitSymbol = isCelsius ? '°C' : '°F';
        
        const cardHTML = `
            <div class="forecast-card bg-primary p-4 rounded-xl text-center shadow-lg border border-gray-700 hover:border-accent transition duration-200">
                <h3 class="font-bold text-lg mb-1">${day.date.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <p class="text-sm text-gray-400 mb-2">${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                
                <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="w-12 h-12 mx-auto">
                <p class="text-sm text-gray-300 capitalize">${day.description}</p>
                
                <hr class="my-2 border-gray-700">
                
                <div class="text-sm space-y-1">
                    <p class="flex justify-between items-center text-accent font-semibold">
                        <span>Temp:</span> 
                        <span>${temp}${unitSymbol}</span>
                    </p>
                    <p class="flex justify-between items-center text-gray-400">
                        <span>Humidity:</span> 
                        <span>${day.humidity}%</span>
                    </p>
                    <p class="flex justify-between items-center text-gray-400">
                        <span>Wind:</span> 
                        <span>${day.wind.toFixed(1)} m/s</span>
                    </p>
                </div>
            </div>
        `;
        forecastContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}


// --- EVENT HANDLERS ---

/**
 * Toggles temperature unit (°C / °F).
 */
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    
    // Only proceed if weather data is loaded
    if (currentWeatherData) {
        // Re-render current weather card with new unit
        renderCurrentWeather(currentWeatherData.current, currentWeatherData.city);

        // Re-render forecast cards with new unit
        renderForecast(currentWeatherData.forecast);
    }
}

// Initial load of search history
loadSearchHistory();

// Set up Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city === "") {
        displayMessage("Please enter a city name to search.", 'error');
        return;
    }
    getCoordinates(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

locationButton.addEventListener('click', handleLocation);

// Geolocation handler 
function handleLocation() {
    if (!navigator.geolocation) {
        displayMessage('Geolocation is not supported by your browser.', 'error');
        return;
    }

    displayMessage('Detecting your location...', 'info');
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
           
            await getWeatherByCoords(lat, lon, 'Your Location');
        } catch (err) {
            console.error('Location weather fetch failed', err);
            displayMessage('Failed to fetch weather for your location.', 'error');
        }
    }, (err) => {
        console.error('Geolocation error', err);
        displayMessage('Unable to get your location. Please allow location access.', 'error');
    });
}

// Listener for the temperature toggle on the unit symbol itself
tempUnitSpan.addEventListener('click', toggleTemperatureUnit);

// Listener for search history dropdown
searchHistorySelect.addEventListener('change', (e) => {
    const city = e.target.value;
    if (city) {
        cityInput.value = city;
        getCoordinates(city);
    }
});
