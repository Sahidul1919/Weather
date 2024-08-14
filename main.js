const api = {
    key: 'db8acffcc78bcd71d8efd56c0faa0344',
    base: 'https://api.openweathermap.org/data/2.5/'
};

document.getElementById('fetchData').addEventListener('click', fetchData);

function fetchData() {
    const city = document.getElementById('searchInput').value.trim();
    const countryCode = document.getElementById('countryCodeInput').value.trim().toUpperCase();

    if (!city && !countryCode) {
        return;
    }

    let geoUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=';
    if (city) {
        geoUrl += city;
        if (countryCode) {
            geoUrl += `,${countryCode}`;
        }
    } else if (countryCode) {
        geoUrl += `${countryCode}`;
    }
    geoUrl += `&limit=1&appid=${api.key}`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(geoData => {
            if (geoData.length > 0) {
                const lat = geoData[0].lat;
                const lon = geoData[0].lon;

                const weatherUrl = `${api.base}weather?lat=${lat}&lon=${lon}&appid=${api.key}&units=metric`;
                const airPollutionUrl = `${api.base}air_pollution?lat=${lat}&lon=${lon}&appid=${api.key}`;

                Promise.all([
                    fetch(weatherUrl).then(response => response.json()),
                    fetch(airPollutionUrl).then(response => response.json())
                ])
                .then(([weatherData, airPollutionData]) => {
                    displayData(weatherData, airPollutionData);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            } else {
                displayNoData();
            }
        })
        .catch(error => {
            console.error('There was a problem with the geocoding request:', error);
        });
}

function displayData(weatherData, airPollutionData) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';

    if (weatherData && weatherData.weather && weatherData.main && weatherData.wind) {
        const weatherDescription = weatherData.weather[0].description;
        const temperatureCelsius = weatherData.main.temp;
        const temperatureFahrenheit = (temperatureCelsius * 9/5) + 32;
        const humidity = weatherData.main.humidity;
        const windSpeed = weatherData.wind.speed;
        const weatherIcon = weatherData.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}.png`;

        const weatherDiv = document.createElement('div');
        weatherDiv.className = 'data-item';

        weatherDiv.innerHTML = `
            <h3>Weather Information</h3>
            <p><strong>Description:</strong> ${weatherDescription}</p>
            <p><strong>Temperature:</strong> ${temperatureCelsius}°C / ${temperatureFahrenheit.toFixed(1)}°F</p>
            <p><strong>Humidity:</strong> ${humidity}%</p>
            <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
            <p><img src="${iconUrl}" alt="${weatherDescription}" /></p>
        `;
        container.appendChild(weatherDiv);
    } else {
        displayNoData();
    }

    if (airPollutionData && airPollutionData.list && airPollutionData.list[0]) {
        const pollution = airPollutionData.list[0].components;
        const aqi = airPollutionData.list[0].main?.aqi;

        const pollutionDiv = document.createElement('div');
        pollutionDiv.className = 'data-item';

        pollutionDiv.innerHTML = `
            <h3>Air Pollution Information</h3>
            <p><strong>AQI:</strong> ${aqi ? aqi : 'N/A'} (1 = Good, 5 = Hazardous)</p>
            <p><strong>CO:</strong> ${pollution.co} µg/m³</p>
            <p><strong>NO:</strong> ${pollution.no} µg/m³</p>
            <p><strong>NO₂:</strong> ${pollution.no2} µg/m³</p>
            <p><strong>O₃:</strong> ${pollution.o3} µg/m³</p>
            <p><strong>SO₂:</strong> ${pollution.so2} µg/m³</p>
            <p><strong>PM2.5:</strong> ${pollution.pm2_5} µg/m³</p>
            <p><strong>PM10:</strong> ${pollution.pm10} µg/m³</p>
            <p><strong>NH₃:</strong> ${pollution.nh3} µg/m³</p>
        `;
        container.appendChild(pollutionDiv);
    } else {
        displayNoData();
    }
}

function displayNoData() {
    const container = document.getElementById('dataContainer');
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'data-item';
    div.textContent = 'Data not available';
    container.appendChild(div);
}