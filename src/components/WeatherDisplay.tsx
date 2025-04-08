import React from 'react';

interface WeatherData {
    name: string;
    sys: {
        country: string;
    };
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
    };
}

interface WeatherDisplayProps {
    weather: WeatherData | null;
    error: string | null;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, error }) => {
    if (error) {
        return <div id="weather-info">{error}</div>;
    }

    if (!weather) {
        return <div id="weather-info"></div>;
    }

    const temperature = Math.round(weather.main.temp);
    const feelsLike = Math.round(weather.main.feels_like);
    const description = weather.weather[0].description;
    const iconCode = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    return (
        <div id="weather-info">
            <h2>{weather.name}. {weather.sys.country}</h2>
            <div className="weather-details">
                <img src={iconUrl} alt={description} width="60" height="60" />
                <div className="temperatures">
                    <p className="temperature">{temperature}°C</p>
                    <p className="feels-like">Feels like: {feelsLike}°C</p>
                </div>
                <p className="description">{description.charAt(0).toUpperCase() + description.slice(1)}</p>
            </div>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind Speed: {weather.wind.speed} m/s</p>
        </div>
    );
};

export default WeatherDisplay;