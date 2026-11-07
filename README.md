# SkyCast Weather Forecast App

Responsive weather dashboard built with HTML, CSS, JavaScript, Fetch API, async/await, and Vite.

## Features
- Search cities around the world
- Current temperature and conditions
- Weather condition emoji icons
- Humidity, wind speed, pressure, and visibility
- Five-day forecast (daily high and low from 3-hour forecast data)
- Celsius / Fahrenheit toggle
- Loading state and readable API error messages
- Responsive layout

## OpenWeatherMap API key setup
1. Create a free account at https://openweathermap.org/
2. Create an API key from your OpenWeatherMap account.
3. Open `script.js`.
4. Replace `PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE` with your key.
5. Save the file.

Example:
`const API_KEY = "your_actual_api_key";`

New API keys may take some time to become active. The app uses the Current Weather Data endpoint and the 5 Day / 3 Hour Forecast endpoint from OpenWeatherMap.

## Run locally
1. Extract the ZIP.
2. Open the `skycast-weather-app` folder in VS Code.
3. Open a terminal in that folder.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the local URL shown by Vite, usually http://localhost:5173.

## Security note
This browser-only demo places the API key in client-side JavaScript. Anyone using the deployed website can inspect it. For a public production deployment, put API requests behind a server or serverless function and keep the key in an environment variable.

## Main files
- `index.html`: page structure
- `style.css`: responsive visual design
- `script.js`: API requests and dynamic rendering
- `package.json`: Vite scripts and dependency
