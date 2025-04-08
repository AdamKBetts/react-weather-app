export interface WeatherData {
    name: string;
    sys: {
        country: string;
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
    cod?: string | number;
}