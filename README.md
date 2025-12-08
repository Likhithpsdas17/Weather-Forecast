# Weather Forecast — Weather Insights

**Project:** Weather Insights — shows current weather and a 5-day forecast using OpenWeatherMap.

**Features implemented:**
- Search weather by city name
- Fetch current weather + 5-day (3-hour interval) forecast
- Current location lookup (browser geolocation)
- Temperature unit toggle (°C / °F)
- Recent search history (localStorage)
- Dynamic background and small alerts (extreme heat/cold)

**Files of interest:**
- `index.html` — main page
- `styles.css` — theme/background helpers
- `src/output.css` — compiled Tailwind CSS (included so no build needed)
- `src/script.js` — main JavaScript (API key placeholder present)

**How to run (recommended)**
simply open `index.html` in a modern browser (some features like geolocation work best when served).

**API key (important)**
- This repo contains a placeholder: `YOUR_API_KEY_HERE` in `src/script.js`.
- Before running, replace that string with your OpenWeatherMap API key or create a local `src/config.js` as directed in the assignment instructions.

**Tailwind / Styling**
- The compiled Tailwind CSS is included as `src/output.css`, so no build step is required. The page loads styling locally and via CDN fallback.
