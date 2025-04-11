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

                    const firstForecastOfDay = forecasts[0];

                    return (
                        <div key={date} className="forecast-day">
                            <h4>{date}</h4>
                            <p className="daily-temps">
                                <span className="max-temp">High: {Math.round(maxTemp)}°C</span> /
                                <span className="min-temp">Low: {Math.round(minTemp)}°C</span>
                            </p>
                            {firstForecastOfDay && firstForecastOfDay.weather && firstForecastOfDay.weather.length > 0 && (
                                <div className="daily-forecast">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${firstForecastOfDay.weather[0].icon}@2x.png`}
                                        alt={firstForecastOfDay.weather[0].description}
                                        width="60"
                                        height="60"
                                        />
                                        <p className="midday-description">{firstForecastOfDay.weather[0].description}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeatherForecast;