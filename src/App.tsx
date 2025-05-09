import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import WeatherForecast from './components/WeatherForecast';
import './App.css';
import { WeatherData, ForecastData } from './types/weather';
import {
  fetchWeatherData,
  fetchForecastData,
  fetchWeatherDataByCoords,
  fetchForecastDataByCoords,
  fetchSuggestions
} from './api/weatherApi';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [units, setUnits] = useState('metic');
  const [isLoading, setIsLoading] = useState(false);

  const [locationSource, setLocationSource] = useState<'search' | 'geolocation' | null>(null);

  const [lastSearchValue, setLastSearchValue] = useState<string | { lat: number; lon: number } | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherAppFavorites');
    if (savedFavorites) {
      try {
        const parsedFavorites: unknown = JSON.parse(savedFavorites);
        if (Array.isArray(parsedFavorites) && parsedFavorites.every(item => typeof item === 'string')) {
          setFavorites(parsedFavorites);
        } else {
          console.error("Parsed favorites from localStorage is not an array of string.");
          setFavorites([]);
        }
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        setFavorites([]);
      }
    } 
  }, []);

  useEffect(() => {
    localStorage.setItem('weatherAppFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = async (city: string) => {
    setWeatherData(null);
    setForecastData(null);
    setError(null);
    setIsLoading(true);

    setLocationSource('search');
    setLastSearchValue(city);

    try {
      const currentWeather = await fetchWeatherData(city, units);

      setWeatherData(currentWeather);

      const forecast = await fetchForecastData(city, units);

      setForecastData(forecast);

      setIsLoading(false);

    } catch (error: any) {
      console.error("Error in handleSearch fetch flow:", error);

      setError(error && typeof error.message === 'string' ? error.message : 'An unknown error occurred during the search.');

      setIsLoading(false);
      setLocationSource(null);
      setLastSearchValue(null);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setWeatherData(null);
      setForecastData(null);
      setError(null);
      setIsLoading(true);

      setLocationSource('geolocation');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setLastSearchValue({ lat: latitude, lon: longitude });

          try {
            const currentWeather = await fetchWeatherDataByCoords(latitude, longitude, units);

            setWeatherData(currentWeather);

            const forecast = await fetchForecastDataByCoords(latitude, longitude, units);
            setForecastData(forecast);

            setIsLoading(false);
          } catch (error: any) {
            console.error("Error in handleGeolocation fetch flow:", error);
            setError(error && typeof error.message === 'string' ? error.message : 'An error occured while fetch location weatherData.');
            setIsLoading(false);
            setLocationSource(null);
            setLastSearchValue(null);
          }
        },
        (geoError: unknown) => { // Explicitly type the caught error as unknown
                    console.error('Error getting location:', geoError); // Log the raw error
                    setIsLoading(false); // Ensure loading is false
          
                    let errorMessage = 'Could not retrieve your location.'; // Default error message
          
                    // Safely determine the error message based on the type of geoError
                    if (geoError instanceof Error) {
                         // If it's a standard JavaScript Error object
                         errorMessage = geoError.message; // Safely access the message
                    } else if (geoError && typeof geoError === 'object' && 'code' in geoError) {
                      // If it's a GeolocationPositionError or a similar object with a 'code' property
                       // We can now safely access 'code' and optionally 'message'
                       const geolocationError = geoError as { code: number; message?: string }; // Cast to an object with code and optional message for easier access
          
                      switch (geolocationError.code) { // Access the code safely
                        case 1:
                          errorMessage = 'Location permission denied. Please enable location access in your browser settings to use this feature.';
                          break;
                        case 2:
                          errorMessage = 'Location information is unavailable.';
                          break;
                        case 3:
                          errorMessage = 'The request to get user location timed out.';
                          break;
                        default:
                          // For other codes, use the message property if available and is a string, otherwise use a generic message
                          errorMessage = geolocationError.message && typeof geolocationError.message === 'string' ? `Geolocation error: ${geolocationError.message}` : 'An unknown error occurred while retrieving your location.';
                          break;
                      }
                    } else if (geoError && typeof geoError === 'object' && 'message' in geoError && typeof (geoError as { message: unknown }).message === 'string') {
                        // Fallback: Check if it's an object that just happens to have a string 'message' property
                         errorMessage = `Geolocation error: ${(geoError as { message: string }).message}`;
                    } else if (typeof geoError === 'string') { // Check if the error is just a string
                         errorMessage = geoError;
                    }
                    // If none of the above conditions match, the initial 'Could not retrieve your location.' remains.
          
                    setError(errorMessage); // Set the determined error message in state
          
                    // Clear location source and value on geo error
                    setLocationSource(null);
                    setLastSearchValue(null);
                  }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      setIsLoading(false);
      setError('Geolocation is not supported by your browser.');
      setLocationSource(null);
      setLastSearchValue(null);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setUnits(newUnit);

    setWeatherData(null);
    setForecastData(null);
    setError(null);

    if (locationSource === 'search' && typeof lastSearchValue === 'string' && lastSearchValue) {
      handleSearch(lastSearchValue);
    } else if (locationSource === 'geolocation' && lastSearchValue && typeof lastSearchValue !== 'string') {
      setIsLoading(true);

      const coords = lastSearchValue as { lat: number; lon: number };

      fetchWeatherDataByCoords(coords.lat, coords.lon, newUnit)
        .then(weatherDataResult => {
          setWeatherData(weatherDataResult);
          return fetchForecastDataByCoords(coords.lat, coords.lon, newUnit);
        })
        .then(forecastResult => {
          setForecastData(forecastResult);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error refetching on unit change:", error);
          setError(error && typeof error.message === 'string' ? error.message : 'An error occurred while updating units for location.');
          setIsLoading(false);
        });
    } else {
      setWeatherData(null);
      setForecastData(null);
      setError("Units changed. Please search again or use your location.");
      setIsLoading(false);
    }
  };

  const addFavorite = (city: string) => {
    if (!favorites.some(fav => fav.toLowerCase() === city.toLowerCase())) {
      setFavorites([...favorites, city]);
    }
  };

  const removeFavorite = (city: string) => {
    setFavorites(favorites.filter(fav => fav.toLowerCase() !== city.toLowerCase()));
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <SearchBar
        onSearch={handleSearch}
        onUseLocation={handleGeolocation}
        onUnitChange={handleUnitChange}
        onFetchSuggestions={fetchSuggestions}
      />
      {favorites.length > 0 && (
        <div className="favorites-list">
          <h4>Favorite Locations:</h4>
          <ul>
            {favorites.map(fav => (
              <li key={fav}>
                <span onClick={() => handleSearch(fav)} className="favorite-city-name" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSearch(fav); }}}>{fav}</span>
                <button onClick={() => removeFavorite(fav)} className="remove-favorite-button">x</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 1. Loading State: Display spinner when loading */}
      {!isLoading && !error && weatherData && locationSource === 'search' && (
        !favorites.some(fav => fav.toLowerCase() === weatherData.name.toLowerCase()) && (
          <button onClick={() => addFavorite(weatherData.name)} className="add-favorite-button">
            Add {weatherData.name} to Favorites
          </button>
        )
      )}

      {/* 2. Error State: Display error message when not loading and error exists */}
      {!isLoading && error && (
        <div className="status-message error-message">{error}</div>
      )}

      {/* 3. Data Loaded State: Display weather and forecast when not loading, no error and data is available */}
      {!isLoading && !error && weatherData && forecastData && (
        <>
          <WeatherDisplay
            weatherData={weatherData}
            units={units}
            locationSource={locationSource}
            searchCityValue={locationSource === 'search' ? (lastSearchValue as string | null) : null}
          />

          <WeatherForecast
            forecast={forecastData}
            units={units}
          />
        </>
      )}

      {/* 4. Initial State: Display welcome message when no loading, no error and no data */}
      {!isLoading && !error && !weatherData && !forecastData && !locationSource && !lastSearchValue && (
        <div className="status-message initial-message">Enter a city or use your location to see the weather.</div>
      )}

      {/* 5. Handle case where weatherData exists but forecastData does not (less likely now with improved error handling) */}
      {!isLoading && !error && weatherData && !forecastData && locationSource && (
        <div className="status-message error-message">Could not load forecast data.</div>
      )}
    </div>
  );
}

export default App;