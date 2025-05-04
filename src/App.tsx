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
  fetchSuggestions // This import is correct
} from './api/weatherApi';


function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [units, setUnits] = useState('metric'); // Default to Celsius
  const [isLoading, setIsLoading] = useState(false);

  const [lastSearchType, setLastSearchType] = useState<'city' | 'coords' | null>(null);
  const [lastSearchValue, setLastSearchValue] = useState<string | { lat: number; lon: number } | null>(null);

  // apiKey is now in weatherApi.ts

  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherAppFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites from localStorage", e);
        setFavorites([]);
      }
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Save favorites to localStorage whenever the favorites state changes
  useEffect(() => {
    localStorage.setItem('weatherAppFavorites', JSON.stringify(favorites));
  }, [favorites]); // Run this effect whenever favorites state changes


  // --- The definitions of fetchSuggestions, fetchWeatherData, etc. are REMOVED from here ---
  // They now live ONLY in src/api/weatherApi.ts


  const handleSearch = async (city: string) => {
    setWeatherData(null);
    setForecastData(null);
    setError(null);
    setIsLoading(true);

    setLastSearchType('city');
    setLastSearchValue(city);

    try {
        // Call the imported fetch function - weatherApi.ts should throw on failure
        const currentWeather = await fetchWeatherData(city, units);

        // If fetchWeatherData succeeded (didn't throw), set the data
        setWeatherData(currentWeather);

        // Fetch forecast data - weatherApi.ts should throw on failure
        await fetchForecastData(city, units);

        // Set loading to false after both awaited operations complete successfully
        setIsLoading(false);

    } catch (error: any) {
        // Catch errors thrown by fetchWeatherData or fetchForecastData (network or HTTP errors)
        console.error("Error in handleSearch fetch flow:", error);

        // Set error state based on the caught error
        // The error object should have a message from weatherApi.ts's handleApiResponse
        setError(error.message || 'An error occurred during the search.');

        setIsLoading(false); // Ensure loading is false on catch
    }
  };


  const handleGeolocation = () => {
    if (navigator.geolocation) {
        setWeatherData(null);
        setForecastData(null);
        setError(null);
        setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => { // Make this callback async
          const { latitude, longitude } = position.coords;

          setLastSearchType('coords');
          setLastSearchValue({ lat: latitude, lon: longitude });

          try {
              // Call the imported fetch function and await it - weatherApi.ts should throw on failure
              const currentWeather = await fetchWeatherDataByCoords(latitude, longitude, units);

               // If fetchWeatherDataByCoords succeeded (didn't throw), set the data
              setWeatherData(currentWeather);

              // Call the imported fetch function and await it - weatherApi.ts should throw on failure
              await fetchForecastDataByCoords(latitude, longitude, units);

              setIsLoading(false); // Set loading to false after success

          } catch (error: any) {
               // Catch errors thrown by fetchWeatherDataByCoords or fetchForecastDataByCoords
               console.error("Error in handleGeolocation fetch flow:", error);
               // Set error state based on the caught error
               setError(error.message || 'An error occurred while fetching location weather.');

               setIsLoading(false); // Ensure loading is false on catch
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);

          // Provide more specific error messages based on geolocation error codes
          let errorMessage = 'Could not retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings to use this feature.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving your location.';
              break;
          }
          setError(errorMessage); // Set the specific error message
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setUnits(newUnit);

    // Re-trigger the last search action based on the last search type and value
    if (lastSearchType === 'city' && typeof lastSearchValue === 'string') {
      // Simply call handleSearch, which handles loading and error states
      handleSearch(lastSearchValue);
    } else if (lastSearchType === 'coords' && lastSearchValue && typeof lastSearchValue !== 'string') {
      // For coordinates, replicate the successful fetch logic from handleGeolocation's try block
      // Using a direct promise chain here
      setIsLoading(true); // Indicate loading due to unit change re-fetch
      setError(null); // Clear errors

      const coords = lastSearchValue as { lat: number; lon: number }; // Cast as we know the type

      fetchWeatherDataByCoords(coords.lat, coords.lon, newUnit) // Pass newUnit - throws on failure
          .then(weatherDataResult => {
               // If fetchWeatherDataByCoords succeeded (didn't throw), set the data
               setWeatherData(weatherDataResult);
               // Fetch forecast after weather data is set - throws on failure
               return fetchForecastDataByCoords(coords.lat, coords.lon, newUnit); // Pass newUnit
          })
          .then(() => {
               // If fetchForecastDataByCoords succeeded, set loading to false
               setIsLoading(false);
          })
          .catch(error => {
               // Catch errors from fetchWeatherDataByCoords or fetchForecastDataByCoords
               console.error("Error refetching on unit change:", error);
               // Set error state based on the caught error
               setError(error.message || 'An error occurred while updating units for location.');
               setIsLoading(false);
          });

    } else {
      // If no previous search, clear data and prompt user
      setWeatherData(null);
      setForecastData(null);
      setError("Units changed. Please search again or use your location.");
      setIsLoading(false); // No fetch action here
    }
  };


  const addFavorite = (city: string) => {
    if (!favorites.includes(city)) {
      setFavorites([...favorites, city]);
    }
  };

  const removeFavorite = (city: string) => {
    setFavorites(favorites.filter(fav => fav !== city));
  };


  return (
    <div className="container">
      <h1>Weather App</h1>
      {/* Pass the imported fetchSuggestions function to SearchBar */}
      <SearchBar
        onSearch={handleSearch}
        onUseLocation={handleGeolocation}
        onUnitChange={handleUnitChange}
        onFetchSuggestions={fetchSuggestions}
      />

      {/* Display list of favorites */}
      {favorites.length > 0 && (
        <div className="favorites-list">
          <h4>Favorite Locations:</h4>
          <ul>
            {favorites.map(fav => (
              <li key={fav}>
                <span onClick={() => handleSearch(fav)} className="favorite-city-name">{fav}</span>
                <button onClick={() => removeFavorite(fav)} className="remove-favorite-button">x</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add favorite button next to currently displayed weather */}
      {!isLoading && !error && weatherData && (
          // Only show add button if the current location isn't already favorited
          !favorites.includes(weatherData.name) && (
             <button onClick={() => addFavorite(weatherData.name)} className="add-favorite-button">
                 Add {weatherData.name} to Favorites
             </button>
          )
      )}


      {/* Conditional rendering based on state */}

      {/* 1. Loading State */}
      {isLoading && (
          <div className="status-message loading-message">Loading weather data...</div>
      )}

      {/* 2. Error State (when not loading) */}
      {!isLoading && error && (
          <div className="status-message error-message">{error}</div>
      )}

      {/* 3. Data Loaded State (when not loading and no error) */}
      {!isLoading && !error && weatherData && forecastData && (
        <>
          {/* Add the location source message here */}
          {lastSearchType === 'coords' && (
            <div className="location-source-message">Showing weather for your current location:</div>
          )}
          {/* WeatherDisplay already shows city/country name */}
          <WeatherDisplay weather={weatherData} error={error} units={units} />
          <WeatherForecast forecast={forecastData} units={units} />
        </>
      )}

       {/* 4. Initial State (when not loading, no error, no data, and no previous search attempt) */}
       {!isLoading && !error && !weatherData && !forecastData && !lastSearchType && (
         <div className="status-message initial-message">Enter a city or use your location to see the weather.</div>
       )}

        {/* 5. Handle case where weatherData exists but forecastData does not (less likely but possible API issue, when not loading) */}
        {/* This state check might become redundant if fetchForecastData always throws on failure and errors are handled correctly */}
        {!isLoading && !error && weatherData && !forecastData && lastSearchType && (
             <div className="status-message error-message">Could not load forecast data.</div>
        )}

    </div>
  );
}

export default App;