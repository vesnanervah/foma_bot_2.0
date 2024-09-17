class GeocodingResult {
    success: boolean;
    longitude?: string;
    latitude?: string;
    errorMessage?: string;

    constructor (args:GeoCodingResultArgs) {
        this.success = args.success;
        this.latitude = args.latitude;
        this.longitude = args.longitude;
    }
}
 type GeoCodingResultArgs = {
    success: boolean;
    longitude?: string;
    latitude?: string;
    errorMessage?: string;
 }

 export { GeoCodingResultArgs, GeocodingResult };