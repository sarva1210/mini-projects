const API_KEY = 'caf404f4b454a9df5cc66baf49976015';
const searchInput = document.getElementById('searchInput');
const loadingState = document.getElementById('loadingState');
const mainContent = document.getElementById('mainContent');

// Get weather icon URL
function getWeatherIcon(main, icon) {
  const icons = {
    Clear: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
    Clouds: 'https://cdn-icons-png.flaticon.com/512/414/414927.png',
    Rain: 'https://cdn-icons-png.flaticon.com/512/3351/3351979.png',
    Drizzle: 'https://cdn-icons-png.flaticon.com/512/3351/3351979.png',
    Thunderstorm: 'https://cdn-icons-png.flaticon.com/512/3222/3222807.png',
    Snow: 'https://cdn-icons-png.flaticon.com/512/642/642102.png',
    Mist: 'https://cdn-icons-png.flaticon.com/512/4005/4005817.png',
    Smoke: 'https://cdn-icons-png.flaticon.com/512/4005/4005817.png',
    Haze: 'https://cdn-icons-png.flaticon.com/512/4005/4005817.png',
    Fog: 'https://cdn-icons-png.flaticon.com/512/4005/4005817.png',
  };
  return icons[main] || 'https://cdn-icons-png.flaticon.com/512/414/414927.png';
}

// Fetch current weather
async function getCurrentWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return data.cod === 200 ? data : null;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

// Fetch forecast
async function getForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return data.cod === '200' ? data : null;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    return null;
  }
}

// Fetch UV Index
async function getUVIndex(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching UV:', error);
    return null;
  }
}

// Update current weather display
function updateCurrentWeather(data) {
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById('weatherDescription').textContent =
    data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
  document.getElementById('locationName').textContent = `${data.name}, ${data.sys.country}`;

  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);

  document.getElementById('mainWeatherIcon').src = getWeatherIcon(data.weather[0].main, data.weather[0].icon);

  // Wind
  document.getElementById('windSpeed').textContent = data.wind.speed.toFixed(1);
  updateWindBars(data.wind.speed);

  // Humidity
  document.getElementById('humidity').textContent = data.main.humidity;
  const dewPoint = data.main.temp - (100 - data.main.humidity) / 5;
  document.getElementById('dewPoint').textContent = `${Math.round(dewPoint)}°C`;

  // Visibility
  const visKm = (data.visibility / 1000).toFixed(1);
  document.getElementById('visibility').textContent = visKm;
  const visDesc =
    visKm < 2
      ? 'Poor visibility'
      : visKm < 5
      ? 'Moderate visibility'
      : visKm < 10
      ? 'Good visibility'
      : 'Excellent visibility';
  document.getElementById('visibilityDesc').textContent = visDesc;

  // Feels Like
  document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
  const diff = data.main.feels_like - data.main.temp;
  const feelsDesc =
    diff > 2
      ? 'Humidity makes it feel warmer'
      : diff < -2
      ? 'Wind makes it feel cooler'
      : 'Similar to actual temperature';
  document.getElementById('feelsLikeDesc').textContent = feelsDesc;

  // Sunrise/Sunset
  const sunrise = new Date(data.sys.sunrise * 1000);
  const sunset = new Date(data.sys.sunset * 1000);
  document.getElementById('sunriseTime').textContent = sunrise.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  document.getElementById('sunsetTime').textContent = sunset.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Update wind bars with animation
function updateWindBars(speed) {
  const bars = document.querySelectorAll('.wind-bar');
  bars.forEach((bar, i) => {
    setTimeout(() => {
      const height = 30 + Math.random() * 60;
      bar.style.height = `${height}%`;
    }, i * 50);
  });
}

// Update UV Index
function updateUVIndex(data) {
  if (data && data.current && data.current.uvi !== undefined) {
    const uv = data.current.uvi;
    document.getElementById('uvValue').textContent = uv.toFixed(1);

    const uvDesc = uv < 3 ? 'Low' : uv < 6 ? 'Moderate' : uv < 8 ? 'High' : uv < 11 ? 'Very High' : 'Extreme';
    document.getElementById('uvDescription').textContent = uvDesc;

    // Rotate needle based on UV value (0-11 scale, -90deg to 90deg)
    const rotation = (uv / 11) * 180 - 90;
    document.getElementById('uvNeedle').style.transform = `translateX(-50%) rotate(${rotation}deg)`;
  }
}

// Update forecast
function updateForecast(data) {
  const dailyData = {};

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();

    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        weather: item.weather[0],
      };
    } else {
      dailyData[dayKey].temp_max = Math.max(dailyData[dayKey].temp_max, item.main.temp_max);
      dailyData[dayKey].temp_min = Math.min(dailyData[dayKey].temp_min, item.main.temp_min);
    }
  });

  const forecastArray = Object.values(dailyData).slice(0, 7);
  const forecastGrid = document.getElementById('forecastGrid');
  forecastGrid.innerHTML = '';

  forecastArray.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
                    <div class="forecast-content">
                        <div class="forecast-day">${day.day}</div>
                        <div class="forecast-date">${day.date}</div>
                        <div class="forecast-icon-wrapper">
                            <img src="${getWeatherIcon(day.weather.main, day.weather.icon)}" alt="${
      day.weather.description
    }">
                        </div>
                        <div class="forecast-condition">${day.weather.main}</div>
                        <div class="forecast-temps">
                            <span class="temp-max">${Math.round(day.temp_max)}°</span>
                            <span class="temp-min">/ ${Math.round(day.temp_min)}°</span>
                        </div>
                    </div>
                `;

    forecastGrid.appendChild(card);
  });
}

// Main function to get all weather data
async function getAllWeatherData(city) {
  loadingState.classList.add('active');
  mainContent.style.display = 'none';

  const currentWeather = await getCurrentWeather(city);

  if (currentWeather) {
    updateCurrentWeather(currentWeather);

    const uvData = await getUVIndex(currentWeather.coord.lat, currentWeather.coord.lon);
    updateUVIndex(uvData);

    const forecastData = await getForecast(city);
    if (forecastData) {
      updateForecast(forecastData);
    }

    loadingState.classList.remove('active');
    mainContent.style.display = 'block';
  } else {
    loadingState.classList.remove('active');
    alert('City not found. Please try again.');
    mainContent.style.display = 'block';
  }
}

// Search functionality
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && searchInput.value.trim()) {
    const city = searchInput.value.trim();
    try {
      localStorage.setItem('weatherCity', city);
    } catch (error) {
      console.log('LocalStorage not available');
    }
    getAllWeatherData(city);
    searchInput.value = '';
  }
});

// Initialize with saved city or default
function getInitialCity() {
  try {
    const savedCity = localStorage.getItem('weatherCity');
    return savedCity || 'London';
  } catch (error) {
    console.log('LocalStorage not available');
    return 'London';
  }
}

const initialCity = getInitialCity();
getAllWeatherData(initialCity);

// Update time every minute
setInterval(() => {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}, 60000);

