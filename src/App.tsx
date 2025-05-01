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
  const [units, setUnits] = useState('metric'); // Default to celsius
  const [isLoading, setIsLoading] = useState(false);

  const [lastSearchType, setLastSearchType] = useState<'city' | 'coords' | null>(null);
  const [lastSearchValue, setLastSearchValue] = useState<string | { lat: number; lon: number } | null>(null);

  const apiKey = "YOUR_API_KEY";

  const fetchWeatherData = async (city: string, units: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`
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

  const fetchForecastData = async (city: string, units: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`
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
    setIsLoading(true);

    setLastSearchType('city');
    setLastSearchValue(city);

    try {
      const currentWeather = await fetchWeatherData(city, units);

      if (currentWeather) {
        if (currentWeather.cod === '404') {
          setError('City not found. Please enter a valid city name.');
        } else {
          setWeatherData(currentWeather);
          await fetchForecastData(city, units);
        }
      }
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
    }
  };

  const fetchWeatherDataByCoords = async (lat: number, lon: number, units: string) => {
    setWeatherData(null);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
      );
      if (!response.ok) {
        const message = `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
      await fetchForecastDataByCoords(lat, lon, units);
      setIsLoading(false);
      return data;
    } catch (error: any) {
      console.error('Could not fetch weather data by coordinates:', error);
      setError('Failed to fetch weather data for your location');
      setIsLoading(false);
      return null;
    }
  };

  const fetchForecastDataByCoords = async (lat: number, lon: number, units: string) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
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

        setWeatherData(null);
        setForecastData(null);
        setError(null);
        setIsLoading(true);

      navigator.geolocation.getCurrentPosition (
        (position) => {
          const { latitude, longitude } = position.coords;

          setLastSearchType('coords');
          setLastSearchValue({ lat: latitude, lon: longitude });

          fetchWeatherDataByCoords(latitude, longitude, units);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not retrieve your location. Please try again or enter a city.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setUnits(newUnit);
    
    if (lastSearchType === 'city' && typeof lastSearchValue === 'string') {
      handleSearch(lastSearchValue)
    } else if (lastSearchType === 'coords' && lastSearchValue && typeof lastSearchValue !== 'string') {
      fetchWeatherDataByCoords(lastSearchValue.lat, lastSearchValue.lon, newUnit);
    } else {
      setWeatherData(null);
      setForecastData(null);
      setError("Units changed. Please search again or use your location.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <SearchBar onSearch={handleSearch} onUseLocation={handleGeolocation} onUnitChange={handleUnitChange}/>

      {isLoading && (
        <div className="status-message loading-message">Loading weather data...</div>
      )}

      {!isLoading && error && (
        <div className="status-message error-message">{error}</div>
      )}

      {!isLoading && !error && weatherData && forecastData && (
        <>
          <WeatherDisplay weather={weatherData} error={error} units={units} />
          <WeatherForecast forecast={forecastData} units={units} />
        </>
      )}

      {!isLoading && !error && !weatherData && !forecastData && !lastSearchType && (
        <div className="status-message initial-message">Enter a city or use your location to see the weather.</div>
      )}

      {!isLoading && !error && weatherData && !forecastData && lastSearchType && (
        <div className="status-message error-message">Could not load forecast data.</div>
      )}

    </div>
  );
}

export default App;