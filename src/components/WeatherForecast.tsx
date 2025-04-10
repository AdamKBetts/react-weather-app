import React from 'react';
import {ForecastData} from '../types/weather';

interface WeatherForecastProps {
    forecast: ForecastData | null;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
    if (!forecast || !forecast.list || forecast.list.length === 0) {
        return <div>No forecast data available</div>;
    }

    return (
        <div className="weather-forecast">
            <h3>5-Day Weather Forecast</h3>
            <div className="forecast-items">
                {forecast.list.map((item, index) => (
                    <div key={index} className="forecast-item">
                        <p>{new Date(item.dt * 1000).toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        <img
                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                            alt={item.weather[0].description}
                            width="40"
                            height="40"
                        />
                        <p>{Math.round(item.main.temp)}°C</p>
                        <p className="forecast-description">{item.weather[0].description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherForecast;