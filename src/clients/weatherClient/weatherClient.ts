import got from "got";
import { GeocoderClient } from "../geocoderClient/geocoderClient.js";
import { GEOCODER_KEY } from "../../../token.js";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";
import { GeocodingResult } from "../geocoderClient/entities/geocodingResult.js";
import { CurrentWeather } from "./entities/currentWeather.js";


const aboutHotTemperature = ['лютая жара', 'просто Вьетнам', 'настоящее пекло', 'невыносимо жарко', 'можно стать негром'];
const aboutNiceTemperature = ['кайфово', 'в самый раз', 'непередаваемый балдеж', 'абсолютный чил'];
const aboutCoolTemperature = ['сомнительно, но окэй', 'слегка прохладно', 'можно надеть ветровку', 'все еще заебись'];
const aboutColdTemperature = ['слегка подмерзает', 'можно надеть любимый анорак с капюшоном', 'погода для похода на турники с китайцем'];
const aboutFrozenTemperature = ['можно отморозить себе яица', 'лучше укутаться в пуховик', 'погода для настоящих нордов', 'стоит надеть подштаны'];

class WeatherClient extends BaseCommandClient{
    triggerRegExp = /погода/i;

    private apiKey: string;
    private baseUrl = 'http://api.weatherapi.com/v1';
    private currentWeatherRelativePath = '/current.json';
    private geocoder = new GeocoderClient(GEOCODER_KEY);

    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    async getReply(args: GetReplyArgs) {
        // TODO: хендл окончаний и более живых форматов вопросов
        if(!args.commandArgument || args.commandArgument.length === 0) {
             args.ctx?.reply('где именно то')
             return
        }
        const geocodingResult = await this.geocoder.getCityCoordinates(args.commandArgument!);
        if (!geocodingResult.success ) {
            args.ctx?.reply(geocodingResult.errorMessage ??  'Незахендленный ерор. Еблан керик хуйни накодил.');
            return
        }
        const currentWeather = await this.getCurrentWeather(geocodingResult, args.commandArgument!);
        args.ctx?.reply(currentWeather);
    }

    private async getCurrentWeather(geocoding: GeocodingResult, cityName: string): Promise<string> {
        try {
            const finalUrl = this.getFinalUrl(geocoding);
            const response = await got.get(finalUrl);
            if (response.statusCode !== 200 || !response.body) {
                return 'Не получилось побазарить с сервером';
            }
            const result = JSON.parse(response.body)['current'] as CurrentWeather | undefined;
            if(!result || !result.temp_c || !result.wind_kph) {
                return 'Сервак отправил какую-то хуйнню';
            }
            return this.getWeatherString(result, cityName);
        } catch(error) {
            return 'Что-то пошло не так';
        }
    }

    private getFinalUrl(geocoding: GeocodingResult): string {
        return `${this.baseUrl}${this.currentWeatherRelativePath}?key=${this.apiKey}&q=${geocoding.latitude},${geocoding.longitude}`;
    }

    private getWeatherString(weather: CurrentWeather, cityName: string) {
        const wind_mpm = Math.round(weather.wind_kph /3.6);

        return `В локации ${cityName} сейчас ${this.getAboutTemperatureString(weather.temp_c)}: ${weather.temp_c}°С. Скорость ветра достигает ${wind_mpm}м/с. Влажность воздуха составляет: ${weather.humidity}`;
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


export { WeatherClient };