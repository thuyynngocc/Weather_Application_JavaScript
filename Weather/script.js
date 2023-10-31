// Định nghĩa các hằng số cho các khóa API của bạn
const openWeatherApiKey = '0f42ef3e2484b8e2ff7b7acaf1730a86'; 
const unsplashApiKey = '123f4354f4efb3f50b4caad9e2ca38bb'; 

// Các phần tử DOM
const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weatherImg = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

const locationNotFound = document.querySelector('.location-not-found');
const weatherBody = document.querySelector('.weather-body');


// const inputBox = document.getElementById('inputBox');
// const autocompleteList = document.getElementById('autocompleteList');

// //Hàm để hiển thị dữ liệu dự báo hàng ngày
// function displayDailyForecast(dailyForecasts) {
//     const dailyForecastContainer = document.getElementById('dailyForecast');
//     dailyForecastContainer.innerHTML = '';

//     dailyForecasts.forEach(forecast => {
//         const dailyForecastItem = document.createElement('div');
//         dailyForecastItem.classList.add('daily-forecast-item');

//         const date = new Date(forecast.dt * 1000);
//         const day = date.toLocaleDateString('en-US', { weekday: 'short' });
//         const description = forecast.weather[0].description;
//         const temperature = Math.round(forecast.temp.day);

//         dailyForecastItem.innerHTML = `
//             <p class="daily-forecast-date">${day}</p>
//             <p class="daily-forecast-description">${description}</p>
//             <p class="daily-forecast-temperature">${temperature}°C</p>
//         `;

//         dailyForecastContainer.appendChild(dailyForecastItem);
//     });
// }



// Hàm để cập nhật nền dựa trên thời gian
function updateBackground(isDay) {
    const container = document.querySelector('.container');
    const backgroundImage = isDay ? 'assets/day.jpeg' : 'assets/night4.jpg';
    const color = isDay ? '#000':"#000";
    //  const backgroundcolor = isDay ? '#fff':"#000";
    //  const wetherbox = document.querySelector('body');

    //  wetherbox.style.backgroundcolor = `${backgroundcolor}`;
    container.style.backgroundImage = `url('${backgroundImage}')`;
    container.style.color =`${color}`;
    
}

// Hàm để kiểm tra xem có phải là ban ngày không
function isDayTime(sunrise, sunset) {
    const currentTime = Date.now() / 1000; 
    return currentTime >= sunrise && currentTime < sunset;
}

// Hàm để lấy dữ liệu nhiệt độ hàng giờ
async function fetchHourlyTemperature(city) {
    const apiKey = '0f42ef3e2484b8e2ff7b7acaf1730a86'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Không thể lấy dữ liệu nhiệt độ hàng giờ.');
        }
        const weatherData = await response.json();

        // Trích xuất dữ liệu nhiệt độ hàng giờ
        const hourlyTemperatures = weatherData.list.map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temperature: Math.round(item.main.temp)
        }));
        
        // Xóa dữ liệu hiện tại trong container '.hourly-temperature-container'
        const hourlyTemperatureContainer = document.querySelector('.hourly-temperature-container');
    
        while (hourlyTemperatureContainer.firstChild) {
            hourlyTemperatureContainer.removeChild(hourlyTemperatureContainer.firstChild);
        }

        // Hiển thị dữ liệu nhiệt độ hàng giờ
        for (const data of hourlyTemperatures) {
            const hourTemperatureElement = document.createElement('div');
            hourTemperatureElement.classList.add('hour-temperature');
            hourTemperatureElement.innerHTML = `<p class="hour">${data.time}</p>
            <p class="temperature">${data.temperature}°C</p>`;
            hourlyTemperatureContainer.appendChild(hourTemperatureElement);
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu nhiệt độ hàng giờ:', error);
    }
}

// Hàm để lấy thông tin mặt trời mọc và lặn
async function getSunriseSunset(city) {
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}`;

try {
    const response = await fetch(apiUrl);
    const weatherData = await response.json();

    if (weatherData.cod !== 200) {
        console.error('Không thể lấy dữ liệu thời tiết.');
        return null;
    }

    const sunrise = weatherData.sys.sunrise;
    const sunset = weatherData.sys.sunset;
    const timezone = weatherData.timezone; 


    return { sunrise, sunset,timezone };
} catch (error) {
    console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
    return null;
}
}

// Hàm để cập nhật giao diện với dữ liệu thời tiết
function updateWeatherUI(weatherData,sunriseSunset) {
    locationNotFound.style.display = 'none';
    weatherBody.style.display = 'flex';

    // Cập nhật nhiệt độ
    const temperatureCelsius = weatherData.main.temp - 273.15;
    temperature.innerHTML = `${Math.round(temperatureCelsius)}°C`;   
    
    //Cập nhật UV Index và tầm nhìn
    // const uvIndex = weatherData.current.uvi;
    // const visibility = weatherData.visibility / 1000; // Đổi đơn vị từ mét sang kilômét

    // document.getElementById('uvIndex').textContent = uvIndex;
    // document.getElementById('visibility').textContent = visibility.toFixed(2); // Giới hạn số chữ số sau dấu thập phân
    fetchHourlyTemperature(weatherData.name);
    const weatherDescriptionMapping = {
        'Clouds': 'Có mây',
        'Clear': 'Trời quang đãng',
        'Rain': 'Có mưa',
        'Fog': 'Có sương mù',
        'Snow': 'Có tuyết',
        'Thunderstorm': 'Mưa kèm sấm chớp',
        'Mist': 'Có sương mù',
        'Drizzle': 'Mưa phùn',
    };
    // Đặt mô tả thời tiết và hình ảnh
const weatherDescription = weatherData.weather[0].main;
description.innerHTML = weatherDescriptionMapping[weatherDescription] || weatherDescription;
weatherImg.src = `/assets/${weatherDescription.toLowerCase()}.png`;

// Cập nhật độ ẩm và tốc độ gió
humidity.innerHTML = `${weatherData.main.humidity}%`;
windSpeed.innerHTML = `${weatherData.wind.speed}m/s`;

// Cập nhật giờ mặt trời mọc và lặn
const localSunrise = new Date((sunriseSunset.sunrise + sunriseSunset.timezone) * 1000).toLocaleTimeString();
const localSunset = new Date((sunriseSunset.sunset + sunriseSunset.timezone) * 1000).toLocaleTimeString();

document.getElementById('sunrise').textContent = `Giờ mặt trời mọc: ${localSunrise}`;
document.getElementById('sunset').textContent = `Giờ mặt trời lặn: ${localSunset}`;
}

// Hàm để xử lý tìm kiếm thời tiết
async function handleWeatherSearch(city) {
try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}`;
    const weatherDataResponse = await fetch(apiUrl);

    if (weatherDataResponse.status === 404) {
        locationNotFound.style.display = 'flex';
        weatherBody.style.display = 'none';
        console.error('Không tìm thấy thành phố');
        return;
    }

    if (!weatherDataResponse.ok) {console.error('Lỗi khi lấy dữ liệu thời tiết');
    return;
}
//const { sunrise, sunset, timezone } = sunriseSunset;
const weatherData = await weatherDataResponse.json();
const sunriseSunset = await getSunriseSunset(city);

if (!sunriseSunset) {
    console.error('Không thể lấy dữ liệu mặt trời mọc và lặn.');
    return;
}
// document.getElementById('sunriseSunset').textContent = new Date(sunriseSunset.sunrise * 1000).toLocaleTimeString();
// document.getElementById('sunsetSunset').textContent = new Date(sunriseSunset.sunset * 1000).toLocaleTimeString();

const timezoneOffsetInSeconds = sunriseSunset.timezone;
const currentTimeInMilliseconds = Date.now();
const currentTimeInMillisecondsAtLocation = currentTimeInMilliseconds + (timezoneOffsetInSeconds * 1000);
const localTime = new Date(currentTimeInMillisecondsAtLocation).toLocaleTimeString();
console.log('Thời gian hiện tại tại vị trí:', localTime);

const { sunrise, sunset, timezone } = sunriseSunset;
const localSunrise = new Date((sunrise + timezone) * 1000).toLocaleTimeString();
const localSunset = new Date((sunset + timezone) * 1000).toLocaleTimeString();



console.log('Thời gian mặt trời mọc:', new Date(sunriseSunset.sunrise * 1000).toLocaleTimeString());
console.log('Thời gian mặt trời lặn:', new Date(sunriseSunset.sunset * 1000).toLocaleTimeString());

updateBackground(isDayTime(sunriseSunset.sunrise, sunriseSunset.sunset));
updateWeatherUI(weatherData, sunriseSunset);
fetchHourlyTemperature(city);
//displayDailyForecast(weatherData.daily);

} catch (error) {
console.error('Lỗi khi xử lý dữ liệu thời tiết:', error);
}
}

//Sự kiện nghe cho nút tìm kiếm
inputBox.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter') {
        const city = inputBox.value.trim();
        if (city) {
            await handleWeatherSearch(city);
        }
    }
});
// inputBox.addEventListener('input', async (event) => {
//     const searchTerm = event.target.value.trim();

//     Xóa danh sách gợi ý hiện tại
//     autocompleteList.innerHTML = '';

//     if (searchTerm.length >= 3) {
//         Gọi hàm để lấy danh sách gợi ý từ API hoặc từ nguồn dữ liệu khác
//         const suggestions = await getCitySuggestions(searchTerm);

//         Hiển thị danh sách gợi ý
//         suggestions.forEach((suggestion) => {
//             const suggestionItem = document.createElement('div');
//             suggestionItem.textContent = suggestion;
//             suggestionItem.classList.add('autocomplete-item');

//             Sự kiện nghe cho khi người dùng chọn một gợi ý
//             suggestionItem.addEventListener('click', () => {
//                 inputBox.value = suggestion;
//                 autocompleteList.innerHTML = '';

//                 Gọi hàm tìm kiếm thời tiết với thành phố đã chọn
//                 handleWeatherSearch(suggestion);
//             });

//             autocompleteList.appendChild(suggestionItem);
//         });
//     }
// });

// async function getCitySuggestions(searchTerm) {
//     Thay thế bằng mã để lấy danh sách gợi ý từ API hoặc nguồn dữ liệu khác của bạn
//     Ví dụ:
//     const apiUrl = `https://api.example.com/suggestions?q=${searchTerm}`;
//     const response = await fetch(apiUrl);
//     const data = await response.json();
//     const suggestions = data.suggestions;
    
//     return suggestions;

//     Trong ví dụ này, tôi không có API nên trả về một danh sách cố định.
//     return ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Huế'];
// }