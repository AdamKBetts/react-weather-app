import { WeatherData, ForecastData } from '../types/weather';

const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0";


// Helper function to handle response parsing and error throwing
const handleApiResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            const errorJson = await response.json();
            if (errorJson.message) errorMessage = `API Error: ${errorJson.message}`;
        } catch (jsonError) {
            console.error("Failed to parse API error JSON:", jsonError);
        }
        throw new Error(errorMessage);
    }
    return response.json();
};


// Internal core fetcher function
const fetchOpenWeatherApi = async <T>(
    endpoint: string,
    params: { [key: string]: any}, // Allow any type for parameter values
    isGeocoding = false // Flag to use the geocoding base URL
): Promise<T> => {
    // Construct query string from params
    const queryString = new URLSearchParams(params).toString();

    //Determine base URL
    const baseUrl = isGeocoding ? GEO_BASE_URL : BASE_URL;

    // Construct the full URL
    const url = `${baseUrl}${endpoint}?${queryString}&appid=${API_KEY}`;

    try {
        const response = await fetch(url);
        return await handleApiResponse<T>(response);
    } catch (error: any) {
        console.error(`Error fetching ${endpoint} from API:`, error);
        throw error;
    }
};


// Fetch weather data by city name
export const fetchWeatherData = async (city: string, units: string): Promise<WeatherData> => {
    return fetchOpenWeatherApi<WeatherData>('/weather', { q: city, units: units });
};


// Fetch forecast data by city name
export const fetchForecastData = async (city: string, units: string): Promise<ForecastData> => {
    return fetchOpenWeatherApi<ForecastData>('/forecast', { q: city, units: units });
};


//Fetch weather data by coordinates
export const fetchWeatherDataByCoords = async (lat: number, lon: number, units: string): Promise<WeatherData> => {
    return fetchOpenWeatherApi<WeatherData>('/weather', { lat: lat, lon: lon, units: units });
};


//Fetch forecast data by coordinates
export const fetchForecastDataByCoords = async (lat: number, lon: number, units: string): Promise<ForecastData> => {
    return fetchOpenWeatherApi<ForecastData>('/forecast', { lat: lat, lon: lon, units: units });
};


// Fetch city suggestions using Geocoding API
export const fetchSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.length < 3) return [];
    try {
        const data = await fetchOpenWeatherApi<any[]>('/direct', { q: query, limit: 5 }, true);

         const suggestionNames = data.map((item: any) => {
            let name = item.name;
            if (item.state) name += `, ${item.state}`;
            if (item.country && item.country !== 'US') name += `, ${item.country}`;
             else if (item.country === 'US' && !item.state) name += `, ${item.country}`;
            return name;
         });
         return suggestionNames;
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};