import { YandexGeoObject } from "./yandexGeoObject.js";

type GeocoderResponse = {
    response: {
        GeoObjectCollection: {
            metaDataProperty: {
                GeocoderResponseMetaData: {
                    request: string,
                    results: string,
                    found: string,
                },
            },
            featureMember: Array<YandexGeoObject>,
        }
    }
}

export { GeocoderResponse }; 