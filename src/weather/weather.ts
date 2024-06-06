import got from "got";
import { GeocodingResult } from "../geocoder/geocoder.js";

class WeatherClient {
    private apiKey: string;
    private baseUrl = 'http://api.weatherapi.com/v1';
    private currentWeatherRelativePath = '/current.json';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getCurrentWeather(geocoding: GeocodingResult, cityName: string): Promise<string> {
        var finalUrl = this.getFinalUrl(geocoding);
        var response = await got.get(finalUrl);
        if (response.statusCode !== 200 || !response.body) {
            return 'Не получилось побазарить с сервером';
        }
        var result = JSON.parse(response.body)['current'] as CurrentWeather | undefined;
        if(!result || !result.temp_c || !result.wind_kph) {
            return 'Сервак отправил какую-то хуйнню';
        }
        return this.getWeatherString(result, cityName);
    }

    private getFinalUrl(geocoding: GeocodingResult): string {
        return `${this.baseUrl}${this.currentWeatherRelativePath}?key=${this.apiKey}&q=${geocoding.latitude},${geocoding.longitude}`;
    }

    private getWeatherString(weather: CurrentWeather, cityName: string) {
        return `В ${cityName} сейчас ${weather.temp_c} градусов. Скорость ветра достигает ${weather.wind_kph} километра в час.`;
    }
}

type CurrentWeather = {
    temp_c: number,
    wind_kph: number,
}

export {WeatherClient, CurrentWeather,}