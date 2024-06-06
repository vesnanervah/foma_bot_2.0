import {got } from 'got'


class Geocoder {
    private apiKey: string;
    private baseUrl = 'https://geocode-maps.yandex.ru/1.x';


    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getCityCoordinates(cityName: string) {
        var url = this.getFinalUrl(cityName)
        console.log(url);
        const response = await got.get(url);
        console.log(response);
        if (response.statusCode == 200) {
            
        }
    }

    private getFinalUrl(cityName: string): string {
        return this.baseUrl + '/?apikey=' + this.apiKey + '&geocode=' + cityName + '&format=json'; 
    }
}

export { Geocoder }