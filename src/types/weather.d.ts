// This 'export{}' line is a common way to make the file a module
export{};

// Coordinates of the location
export interface Coord {
    lon: number;
    lat: number;
}

// Weather condition(e.g. clear, clouds, rain)
export interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
}

// Main weather parameters (temperature, pressure, humidity etc.)
export interface Main {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
}

// Wind data
export interface Wind {
    speed: number;
    deg?: number;
    gust?: number;
}

// Cloudiness data
export interface Clouds {
    all: number;
}

// System data (country code, sunrise, sunset)
export interface Sys {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
}

// Represents the current weather data response
export interface WeatherData {
    coord: Coord;
    weather: Weather[];
    base: string;
    main: Main;
    visibility?: number;
    wind: Wind;
    clouds: Clouds;
    dt: number;
    sys: Sys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
    message?: string;
}

// Represents main weather data specifically for a forecast item
export interface ForecastItemMain extends Main {
    sea_level: number;
    grnd_level: number;
    temp_kf: number;
}

// Rain data
export interface Rain {
    '1h'?: number;
    '3h'?: number;
}

// Snow data
export interface Snow {
    '1h'?: number;
    '3h'?: number;
}

export interface ForecastItem {
    dt: number;
    main: ForecastItemMain;
    weather: Weather[];
    clouds: Clouds;
    wind: Wind;
    visibility?: number;
    pop: number;
    sys: {
        pod: string;
    };
    dt_txt: string;

    rain?: Rain;
    snow?: Snow;
}

export interface City {
    id: number;
    name: string;
    coord: Coord;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
}

export interface ForecastData {
    cod: string;
    message: number | string;
    cnt: number;
    list: ForecastItem[];
    city: City;
}