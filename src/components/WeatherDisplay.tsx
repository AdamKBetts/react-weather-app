import React from 'react';
import { WeatherData } from '../types/weather';

interface WeatherDisplayProps {
    weather: WeatherData | null;
    error: string | null;
}

const getWindDirection = (degrees: number): string => {
    if (degrees >= 337.5 || degrees < 22.5) return 'North';
    if (degrees >= 22.5 && degrees < 67.5) return 'Northeast';
    if (degrees >= 67.5 && degrees < 112.5) return 'East';
    if (degrees >= 112.5 && degrees < 157.5) return 'Southeast';
    if (degrees >= 157.5 && degrees < 202.5) return 'South';
    if (degrees >= 202.5 && degrees < 247.5) return 'Southwest';
    if (degrees >= 247.5 && degrees < 292.5) return 'West';
    if (degrees >= 292.5 && degrees < 337.5) return 'Northwest';
    return 'Unknown';
};

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
            {weather.main.pressure && <p>Pressure: {weather.main.pressure} hPa</p>}
            {weather.wind.deg && <p>Wind Direction: {getWindDirection(weather.wind.deg)}</p>}
        </div>
    );
};

export default WeatherDisplay;