export interface WeatherData {
    name: string;
    sys: {
        country: string;
        sunrise: number;
        sunset: number;
    };
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
        deg?: number;
    };
    visibility?: number;
    clouds?: {
        all: number;
    }
    cod?: string | number;
}

export interface ForecastItem {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
    };
    visibility: number;
    pop: number;
    rain?: {
        '3h': number;
    };
    sys: {
        pod: string;
    };
    dt_txt: string;
}

export interface ForecastData {
    cod: string;
    message: number;
    cnt: number;
    list: ForecastItem[];
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}