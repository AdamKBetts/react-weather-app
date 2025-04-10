import React, {useState} from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import './App.css';
import { WeatherData, ForecastData } from './types/weather';

const apiKey = "your_API_key";

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  const handleSearch = async (city: string) => {
    setWeatherData(null);
    setForecastData(null);
    setError(null);
    
    try {
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!currentWeatherResponse.ok) {
        const message = `HTTP error! status: ${currentWeatherResponse.status}`;
        throw new Error(message);
      }

      const currentWeather: WeatherData = await currentWeatherResponse.json();

      if (currentWeather.cod === '404') {
        setError('City not found. Please enter a valid city name.');
        return;
      }

      setWeatherData(currentWeather);
      fetchForecastData(city);
    } catch (error: any) {
      console.error('Could not fetch weather data:', error);
      setError('Failed to fetch weather data. Please try again');
    }
  };

  const fetchForecastData = async (city: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      const data: ForecastData = await response.json();
      setForecastData(data);
    } catch (error: any) {
      console.error('Could not fetch forecast data:', error);
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <SearchBar onSearch={handleSearch} />
      <WeatherDisplay weather={weatherData} error={error} />
      <WeatherForecast forecast={forecastData} />
    </div>
  );
}

export default App;