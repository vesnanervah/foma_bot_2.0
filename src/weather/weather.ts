import got from "got";
import { GeocodingResult } from "../geocoder/geocoder.js";


const aboutHotTemperature = ['лютая жара', 'просто Вьетнам', 'настоящее пекло', 'невыносимо жарко', 'можно стать негром'];
const aboutNiceTemperature = ['кайфово', 'в самый раз', 'непередаваемый балдеж', 'абсолютный чил'];
const aboutCoolTemperature = ['сомнительно, но окэй', 'слегка прохладно', 'можно надеть ветровку', 'все еще заебись'];
const aboutColdTemperature = ['слегка подмерзает', 'можно надеть любимый анорак с капюшоном', 'погода для похода на турники с китайцем'];
const aboutFrozenTemperature = ['можно отморозить себе яица', 'лучше укутаться в пуховик', 'погода для настоящих нордов', 'стоит надеть подштаны'];

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
        const wind_mpm = Math.round(weather.wind_kph /3.6);

        return `В ${cityName} сейчас ${this.getAboutTemperatureString(weather.temp_c)}: ${weather.temp_c} градусов. Скорость ветра достигает ${wind_mpm} метра в секунду. Влажность воздуха составляет: ${weather.humidity}`;
    }

    private getAboutTemperatureString(temp: number) : string {
        if(temp > 25) {
            return aboutHotTemperature[Math.floor(aboutHotTemperature.length * Math.random())];
        }
        if(temp > 15) {
            return aboutNiceTemperature[Math.floor(aboutNiceTemperature.length * Math.random())];
        }
        if (temp > 5) {
            return aboutCoolTemperature[Math.floor(aboutCoolTemperature.length * Math.random())];
        }
        if (temp > -5) {
            return aboutColdTemperature[Math.floor(aboutColdTemperature.length * Math.random())];
        }
        return aboutFrozenTemperature[Math.floor(aboutFrozenTemperature.length * Math.random())];
    }
}



type CurrentWeather = {
    temp_c: number,
    wind_kph: number,
    humidity: number,
}

export {WeatherClient, CurrentWeather,}