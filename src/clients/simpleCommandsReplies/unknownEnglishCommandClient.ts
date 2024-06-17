import { UnknownCommandClient } from "./unknownCommandClient.js";

class UnknownEnglishCommandClient extends UnknownCommandClient {
    triggerRegExp = /[a-z]/i;

    constructor() {
        super();
        this.preludes = [
            ...this.preludes,
            'Ах, еслл бы я понимал латиицу...да, бы был поистине умен))',
            'I can\'t really say that i speak English just as fluently as the person that told me to say this after your strange phrases starting with latin letters))',
            'Может, будем болтать по-русски?',
        ]
    }
}

export { UnknownEnglishCommandClient };