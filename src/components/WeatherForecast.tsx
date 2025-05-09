import React, { useState } from 'react';
import { ForecastData, ForecastItem } from '../types/weather';

interface WeatherForecastProps {
    forecast: ForecastData | null;
    units: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast, units }) => {

    const [expandedDays, setExpandedDays] = useState<{ [date: string]: boolean }>({});

    const toggleExpanded = (date: string) => {
        setExpandedDays(prevExpandedDays => ({
            ...prevExpandedDays,
            [date]: !prevExpandedDays[date]
        }));
    };

    if (!forecast || !forecast.list || forecast.list.length === 0) {
        return <div>No forecast data available.</div>;
    }

    const forecastsByDay: { [key: string]: ForecastItem[] } = forecast.list.reduce((acc: { [key: string]: ForecastItem[] }, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-GB');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});

    const tempSymbol = units === 'metric' ? '°C' : '°F';

    const getMostFrequentCondition = (dailyForecasts: ForecastItem[]) => {
        const conditionCounts: { [key: string]: { count: number; description: string; icon: string } } = {};

        for (const item of dailyForecasts) {
            if (item.weather && item.weather.length > 0) {
                const conditionId = item.weather[0].id;
                const description = item.weather[0].description;
                const icon = item.weather[0].icon;

                if (!conditionCounts[conditionId]) {
                    conditionCounts[conditionId] = { count: 0, description: description, icon: icon };
                }
                conditionCounts[conditionId].count++;
            }
        }

        let mostFrequentCondition = { description: 'N/A', icon: '01d' };
        let maxCount = 0;

        for (const id in conditionCounts) {
            if (conditionCounts[id].count > maxCount) {
                maxCount = conditionCounts[id].count;
                mostFrequentCondition = {
                    description: conditionCounts[id].description,
                    icon: conditionCounts[id].icon
                };
            }
        }

        return mostFrequentCondition;
    };

    return (
        <div className="weather-forecast">
            <h3>5-Day Weather Forecast</h3>
            <div className="forecast-by-day">
                {Object.entries(forecastsByDay).map(([date, forecasts]) => {
                    const minTemp = Math.min(...forecasts.map(item => item.main.temp));
                    const maxTemp = Math.max(...forecasts.map(item => item.main.temp));

                    const dailyOverview = getMostFrequentCondition(forecasts);

                    return (
                        <div key={date} className="forecast-day">
                            <div className="daily-summary-header" onClick={() => toggleExpanded(date)}>
                                <h4>{date}</h4>
                                <p className="daily-temps">
                                    <span className="max-temp">High: {Math.round(maxTemp)}{tempSymbol}</span> /
                                    <span className="min-temp">Low: {Math.round(minTemp)}{tempSymbol}</span>
                                </p>
                                <div className="daily-summary">
                                    <img
                                        src={`https://openweathermap.org/img/wn/${dailyOverview.icon}@2x.png`}
                                        alt={dailyOverview.description}
                                        width="60"
                                        height="60"
                                    />
                                    <p className="daily-description">{dailyOverview.description}</p>
                                </div>
                                <span className={`expand-indicator ${expandedDays[date] ? 'expanded' : ''}`}>&#9660;</span>
                            </div>

                            {/* 3-Hour Forecast */}
                            <div className={`forecast-items ${expandedDays[date] ? 'expanded-forecast-items' : ''}`}> {/* Apply class based on state */}
                                {/* ... map over 3-hour items ... */}
                                {forecasts.map((item, index) => (
                                     <div key={index} className="forecast-item">
                                       {/* Display time */}
                                       <p>{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                       {/* Display icon */}
                                       <img
                                         src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                                         alt={item.weather[0].description}
                                         width="50" // Adjusted size from previous App.css
                                         height="50" // Adjusted size from previous App.css
                                       />
                                       {/* Display temperature */}
                                       <p>{Math.round(item.main.temp)}{tempSymbol}</p>
                                       {/* Display description */}
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