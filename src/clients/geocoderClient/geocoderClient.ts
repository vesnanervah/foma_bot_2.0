import {got } from 'got'
import { BaseCommandClient, GetReplyArgs } from '../baseCommandClient.js';
import { GeocodingResult } from './entities/geocodingResult.js';
import { GeocoderResponse } from './entities/geocoderResponse.js';


class GeocoderClient extends BaseCommandClient{

    triggerRegExp = /координаты/i;
    private apiKey: string;
    private baseUrl = 'https://geocode-maps.yandex.ru/1.x';


    constructor(apiKey: string) {
        super();
        this.apiKey = apiKey;
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    async getReply(args: GetReplyArgs) {
        if(!args.commandArgument || args.commandArgument.length === 0) {
            args.ctx?.reply('А город я угадать должен?');
            return
        }
        const response = await this.getCityCoordinates(args.commandArgument!);
        args.ctx?.reply(response.success ? `Координаты места ${args.commandArgument!}: широта ${response.latitude}, долгота ${response.longitude}` : (response.errorMessage ?? 'Незахендленный ерор. Еблан керик хуйни накодил.'));
    }

    async getCityCoordinates(cityName: string): Promise<GeocodingResult> {
        const url = this.getFinalUrl(cityName);
        try {
            const response = await got.get(url);
            if (response.statusCode == 200) {
                var result = JSON.parse(response.body) as GeocoderResponse;
                if (result.response.GeoObjectCollection?.metaDataProperty?.GeocoderResponseMetaData?.found == "0" ?? true) {
                    return new GeocodingResult({success: false, errorMessage: 'Че за хуйню ты написал? Я не могу найти такое место.'});
                }
                var [longitude, latutide] =result.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ');
                return new GeocodingResult({success: true, latitude: latutide, longitude: longitude});
            }
        } catch {
            return new GeocodingResult({
                success: false,
                errorMessage: 'Какая-то ебанина с серваком яндекса. Керил посмотри логи.'
            });
        }
        return new GeocodingResult({
            success: false,
            errorMessage: 'Не могу получить координаты'
        });
    }

    private getFinalUrl(cityName: string): string {
        return this.baseUrl + '/?apikey=' + this.apiKey + '&geocode=' + cityName + '&format=json'; 
    }
}

export { GeocoderClient };