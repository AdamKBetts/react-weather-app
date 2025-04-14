import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import './App.css';
import { WeatherData, ForecastData } from './types/weather';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  const apiKey = "YOUR_API_KEY";

  const fetchWeatherData = async (city: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const data: WeatherData = await response.json();
      return data;
    } catch (error: any) {
      console.error('Could not fetch weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
      return null;
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

  const handleSearch = async (city: string) => {
    setWeatherData(null);
    setForecastData(null);
    setError(null);

    const currentWeather = await fetchWeatherData(city);

    if (currentWeather) {
      if (currentWeather.cod === '404') {
        setError('City not found. Please enter a valid city name.');
        return;
      }
      setWeatherData(currentWeather);
      fetchForecastData(city);
    }
  };

  const fetchWeatherDataByCoords = async (lat: number, lon: number) => {
    setWeatherData(null);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
      fetchForecastDataByCoords(lat, lon);
    } catch (error: any) {
      console.error('Could not fetch weather data by coordinates:', error);
      setError('Failed to fetch weather data for your location');
    }
  };

  const fetchForecastDataByCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const data: ForecastData = await response.json();
      setForecastData(data);
    } catch (error: any) {
      console.error('Could not fetch forecast data by coordinates:', error);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition (
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherDataByCoords(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not retrieve your location. Please try again or enter a city.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <SearchBar onSearch={handleSearch} onUseLocation={handleGeolocation} />
      <WeatherDisplay weather={weatherData} error={error} />
      <WeatherForecast forecast={forecastData} />
    </div>
  );
}

export default App;