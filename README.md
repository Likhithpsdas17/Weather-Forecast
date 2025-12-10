# Weather Insights — Updated for Resubmission

**Updated:** Replaced the placeholder `YOUR_API_KEY_HERE` with a valid OpenWeatherMap API key in `src/script.js`.

## What changed
- `src/script.js` now contains the real API key in the `API_KEY` constant:
  ```js
  const API_KEY = "3f807c3308ebb737e45cf9b85af0163b";

**Important** My Github Link For Reference To The Exact Code "https://github.com/Likhithpsdas17/Weather-Forecast"
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

**Tailwind / Styling**
- The compiled Tailwind CSS is included as `src/output.css`, so no build step is required. The page loads styling locally and via CDN fallback.
