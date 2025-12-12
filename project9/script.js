const API_KEY = "b92e57938eaebc6ded1fcf3a2f5b4bc3"; 
const DEFAULT_CITY = "New York";
let units = localStorage.getItem('units') || 'metric'; // metric = C°, imperial = F°

const el = id => document.getElementById(id);

const mainTemp = el('mainTemp');
const mainIcon = el('mainIcon');
const mainCond = el('mainCond');
const mainLoc = el('mainLoc');
const mainTime = el('mainTime');

const wHumidity = el('wHumidity');
const wWind = el('wWind');
const wUV = el('wUV');
const wVis = el('wVis');

const hsWind = el('hsWind');
const hsUV = el('hsUV');
const hsSun = el('hsSun');
const hsHum = el('hsHum');
const hsVis = el('hsVis');
const hsFeels = el('hsFeels');

const forecastList = el('forecastList');
const cityInput = el('cityInput');
const searchBtn = el('searchBtn');
const lastCity = el('lastCity');

const loader = el('loader');
const errorBox = el('error');

const degC = el('degC');
const degF = el('degF');
const modeToggle = document.getElementById('modeToggle');
const root = document.getElementById('root');
const weekChart = el('weekChart');

// Helpers
function showLoader(){ loader.hidden = false; }
function hideLoader(){ loader.hidden = true; }
function showError(msg){ errorBox.hidden = false; errorBox.textContent = msg; }
function clearError(){ errorBox.hidden = true; }

// ---------------- SVG ICONS ----------------
function getIconSVG(code){
  if(!code) return `<svg width="48" height="48"><circle cx="24" cy="24" r="12" fill="#FFD65C"/></svg>`;
  if(code.startsWith('01')) return `<svg width="64" height="64"><circle cx="32" cy="32" r="14" fill="#FFD65C"/></svg>`;
  if(code.startsWith('02')||code.startsWith('03')||code.startsWith('04'))
    return `<svg width="64" height="64"><ellipse cx="32" cy="38" rx="20" ry="12" fill="#d0d6dd"/></svg>`;
  if(code.startsWith('09')||code.startsWith('10'))
    return `<svg width="64" height="64"><ellipse cx="32" cy="30" rx="20" ry="12" fill="#c7d1d9"/><line x1="24" y1="40" x2="24" y2="52" stroke="#7dd3fc" stroke-width="3"/></svg>`;
  if(code.startsWith('11'))
    return `<svg width="64" height="64"><ellipse cx="32" cy="30" rx="20" ry="12" fill="#c7d1d9"/><polygon points="30,40 36,40 32,52" fill="#ffd65c"/></svg>`;
  if(code.startsWith('13'))
    return `<svg width="64" height="64"><text x="22" y="42" font-size="32" fill="#e6f3ff">*</text></svg>`;
  return `<svg width="64" height="64"><circle cx="32" cy="32" r="14" fill="#94a3b8"/></svg>`;
}

// ---------------- Time helper ----------------
function formatTime(unix, tzOffset){
  const d = new Date((unix + tzOffset) * 1000);
  return d.toLocaleString([], {hour:'2-digit', minute:'2-digit'});
}

// ---------------- Chart (simple sparkline) ----------------
function drawWeekChart(daily){
  try{
    const canvas = weekChart;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = 120 * devicePixelRatio;

    ctx.clearRect(0,0,w,h);

    const vals = daily.slice(0,7).map(d => d.temp.day);
    const max = Math.max(...vals);
    const min = Math.min(...vals);

    const pad = 20 * devicePixelRatio;

    ctx.beginPath();
    vals.forEach((v,i)=>{
      const x = pad + i * ((w - pad*2) / 6);
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad*2);
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    });

    ctx.strokeStyle = '#4fd1c5';
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.stroke();

  }catch(e){ console.warn(e); }
}

// ---------------- Fetch Weather ----------------
async function fetchWeather(city){
  clearError();
  showLoader();

  try{
    // Geocode → lat/lon
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if(!geoRes.ok) throw new Error("Geocoding failed");
    const geoData = await geoRes.json();

    if(!geoData.length) throw new Error("City not found");

    const {lat, lon, name, state, country} = geoData[0];

    // OneCall API
    const oneRes = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${API_KEY}`
    );

    const one = await oneRes.json();
    if(!one.daily) throw new Error("Your API key does not support forecast");

    const c = one.current;

    // Set Current Weather
    mainTemp.textContent = Math.round(c.temp) + (units === 'metric' ? '°C' : '°F');
    mainIcon.innerHTML = getIconSVG(c.weather?.[0]?.icon);
    mainCond.textContent = c.weather?.[0]?.description || "—";
    mainLoc.textContent = `${name}, ${country}`;
    mainTime.textContent = new Date(c.dt * 1000).toLocaleString();

    // Small Widgets
    wHumidity.textContent = c.humidity + "%";
    wWind.textContent = `${c.wind_speed} ${units === 'metric' ? 'm/s' : 'mph'}`;
    wUV.textContent = c.uvi;
    wVis.textContent = (c.visibility / 1000).toFixed(1) + " km";

    hsWind.textContent = wWind.textContent;
    hsUV.textContent = c.uvi;
    hsSun.textContent = `${formatTime(c.sunrise, one.timezone_offset)} / ${formatTime(c.sunset, one.timezone_offset)}`;
    hsHum.textContent = c.humidity + "%";
    hsVis.textContent = wVis.textContent;
    hsFeels.textContent = Math.round(c.feels_like) + (units === 'metric' ? '°C' : '°F');

    // Forecast List
    forecastList.innerHTML = "";

    one.daily.slice(0,7).forEach(d => {
      const date = new Date(d.dt * 1000)
        .toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});

      const item = document.createElement("div");
      item.className = "forecast-item";
      item.innerHTML = `
        <div class="icon">${getIconSVG(d.weather?.[0]?.icon)}</div>
        <div class="info">
          <strong>${date}</strong>
          <small style="color:#8895a7">${d.weather?.[0]?.description}</small>
        </div>
        <div class="temps">${Math.round(d.temp.max)}° / ${Math.round(d.temp.min)}°</div>
      `;
      forecastList.appendChild(item);
    });

    // Save last city
    localStorage.setItem("lastCity", city);
    lastCity.textContent = city;

    drawWeekChart(one.daily);

  } catch(err){
    showError(err.message);
  } finally {
    hideLoader();
  }
}

// events //

// Unit toggles
degC.onclick = () => {
  units = "metric";
  degC.classList.add("active");
  degF.classList.remove("active");
  fetchWeather(localStorage.getItem("lastCity") || DEFAULT_CITY);
};

degF.onclick = () => {
  units = "imperial";
  degF.classList.add("active");
  degC.classList.remove("active");
  fetchWeather(localStorage.getItem("lastCity") || DEFAULT_CITY);
};

// Search
searchBtn.onclick = () => {
  const q = cityInput.value.trim();
  if(q) fetchWeather(q);
};
cityInput.onkeydown = e => {
  if(e.key === "Enter") searchBtn.click();
};

// Light/Dark Mode Toggle
modeToggle.onclick = () => {
  if(root.classList.contains("theme-dark")){
    root.classList.replace("theme-dark", "theme-light");
    modeToggle.textContent = "☀️";
  } else {
    root.classList.replace("theme-light", "theme-dark");
    modeToggle.textContent = "🌙";
  }
};

// init
(function init(){
  const saved = localStorage.getItem("lastCity") || DEFAULT_CITY;
  lastCity.textContent = saved;
  cityInput.value = saved;

  if(units === "metric"){
    degC.classList.add("active");
    degF.classList.remove("active");
  } else {
    degF.classList.add("active");
    degC.classList.remove("active");
  }

  fetchWeather(saved);
})();

