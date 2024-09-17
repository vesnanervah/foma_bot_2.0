type YandexGeoObject = {
    GeoObject: {
        name: string,
        description: string,
        Point: {
            pos: string,
        }
    }
}

export { YandexGeoObject };