import React from 'react';
import {ForecastData, ForecastItem} from '../types/weather';

interface WeatherForecastProps {
    forecast: ForecastData | null;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
    if (!forecast || !forecast.list || forecast.list.length === 0) {
        return <div>No forecast data available</div>;
    }

    const forecastsByDay: { [key: string]: ForecastItem[] } = forecast.list.reduce((acc: { [key: string]: ForecastItem[] }, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-GB');
        if (!acc[date]) {
            acc[date] =[];
        }
        acc[date].push(item);
        return acc;
    }, {});

    return (
        <div className="weather-forecast">
            <h3>5-Day Weather Forecast</h3>
            <div className="forecast-by-day">
                {Object.entries(forecastsByDay).map(([date, forecasts]) => {
                    const minTemp = Math.min(...forecasts.map(item => item.main.temp));
                    const maxTemp = Math.max(...forecasts.map(item => item.main.temp));

                    return (
                        <div key={date} className="forecast-day">
                            <h4>{date}</h4>
                            <p className="daily-temps">
                                <span className="max-temp">High: {Math.round(maxTemp)}°C</span> /
                                <span className="min-temp">Low: {Math.round(minTemp)}°C</span>
                            </p>
                            <div className="forecast-items">
                                {forecasts.map((item, index) => (
                                    <div key={index} className="forecast-item">
                                        <p>{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                })}
            </div>
        </div>
    );
};

export default WeatherForecast;