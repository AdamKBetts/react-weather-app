import React from 'react';
import { WeatherData } from '../types/weather';

interface WeatherDisplayProps {
    weatherData: WeatherData | null;
    units: string;
    locationSource: 'search' | 'geolocation' | null;
    searchCityValue: string | null;
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

const formatVisibility = (meters: number | undefined, units: string): string => {
    if (meters === undefined || meters === null) return 'N/A';
    if (units === 'metric') {
        const kilometers = (meters / 1000).toFixed(1);
        return `${kilometers} km`;
    } else {
        const miles = (meters / 1609.34).toFixed(1);
        return `${miles} miles`;
    }
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, units, locationSource, searchCityValue }) => {
    if (!weatherData) {
        return null;
    }

    const mainCondition = weatherData.weather?.[0]?.main;

    const weatherClass = mainCondition ? `weather-info-${mainCondition}` : '';

    const tempSymbol = units === 'metric' ? '°C' : '°F';
    const windUnit = units === 'metric' ? 'm/s' : 'mph';

    const sunriseTime = weatherData.sys?.sunrise ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    const sunsetTime = weatherData.sys?.sunset ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    const visibility = formatVisibility(weatherData.visibility, units);

    return (
        <div id="weather-info" className={weatherClass}>
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>

            {locationSource === 'geolocation' && (
                <p className="location-source-message">Weather data based on your current location.</p>
            )}
            {locationSource === 'search' && searchCityValue && (
                <p className="location-source-message">Showing weather for "{searchCityValue}"</p>
            )}

            <div className="weather-details">
                {weatherData.weather?.[0]?.icon && (
                    <img
                        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                        alt={weatherData.weather[0].description || 'Weather icon'}
                        width="80"
                        height="80"
                    />
                )}
                <div className="temperatures">
                    {weatherData.main?.temp !== undefined && (
                        <p className="temperature">{Math.round(weatherData.main.temp)}{tempSymbol}</p>
                    )}
                    {weatherData.main?.feels_like !== undefined && (
                        <p className="feeld-like">Feels like {Math.round(weatherData.main.feels_like)}{tempSymbol}</p>
                    )}
                </div>
                {weatherData.weather?.[0]?.description && (
                    <p className="description">{weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1)}</p>
                )}
            </div>

            {weatherData.main?.humidity !== undefined && <p>Humidity: {weatherData.main.humidity}%</p>}
            {weatherData.wind?.speed !== undefined && (
                <p>Wind: {weatherData.wind.speed} {windUnit}</p>
            )}
            {weatherData.wind?.deg !== undefined && (
                <p>Wind Direction: {getWindDirection(weatherData.wind.deg)}</p>
            )}
            {weatherData.main?.pressure !== undefined && <p>Pressure: {weatherData.main.pressure} hPa</p>}
            {weatherData.visibility !== undefined && <p>Visibility: {visibility}</p>}
            {weatherData.clouds?.all !== undefined && <p>Cloudiness: {weatherData.clouds.all}%</p>}

            {(sunriseTime || sunsetTime) && (
                <div className="sun-times">
                    {sunriseTime && <p>Sunrise: {sunriseTime}</p>}
                    {sunsetTime && <p>Sunset: {sunsetTime}</p>}
                </div>
            )}
        </div>
    );
};

export default WeatherDisplay;