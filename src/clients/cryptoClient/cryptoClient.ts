import got from "got";
import { GetReplyArgs } from "../baseCommandClient.js";
import { IntervalCommandClient } from "../intervalCommandClient.js";


class CryptoClient extends IntervalCommandClient {
    private baseUrl = 'https://api.coinpaprika.com/v1';
    private triggerRegExp = /стоимость|курс|пачем$/i;
    private dogeRegExp = /^доги((чей)|(чи)|(коин(ы|а|ов)?))?$/i;
    private bitcoinRegExp = /^бит((ка)|(ок)|(коин(ы|а|ов)?))$/i;
    private toncoinRegExp = /^тон(коин(ы|а|ов)?|(а))?$/i;
    private notcoinRegExp = /^нот(коин(ы|а|ов)?|(а))?$/i;
    private coinIds: RegExpIds  = {
        'doge-dogecoin': this.dogeRegExp,
        'btc-bitcoin': this.bitcoinRegExp,
        'toncoin-the-open-network': this.toncoinRegExp,
        'not-notcoin': this.notcoinRegExp,
    }

    async getReply(args: GetReplyArgs): Promise<void> {
        const response = await this.getOhlcvFromSuggest(args.commandArgument);
        args.ctx?.reply(response);
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    startIntervalSubscribtions(): void {
        this.setIntervalToRandomPrediction();
    }

    private async getOhlcvFromSuggest(suggest?: string) {
        if(!suggest) {
            return 'Каво';
        }
        const coinId = this.getCoinId(suggest);
        if(!coinId) {
            return 'Я не знаю такого коина';
        }
        return await this.getOhlcv(coinId, suggest);
    }

    private async getOhlcv(coinId: string, coinName: string)  {
        const url = `${this.baseUrl}/coins/${coinId}/ohlcv/latest/`;
        try {
            const response = await got.get(url);
            const ohlc = (JSON.parse(response.body) as Array<Ohlc>)[0] as Ohlc | undefined;
            if (ohlc?.open) {
                return this.generateOhlcvAnswer(ohlc, coinName);
            }
            return 'В этой жизни что-то пошло не так'    
        } catch {
            return 'Не получилось(';
        }
    }

    private generateOhlcvAnswer(ohlc:Ohlc, coinName: string): string {
        const openVolumeText = `Стоимость ${coinName} составляет: ${ohlc.open}.`;
        if (ohlc.high){
            const differenceFromHight = this.countDifferenceInPercentage(ohlc.high, ohlc.open!);
            if (differenceFromHight < 15 && differenceFromHight > 10) {
                return openVolumeText + ' Приговьтесь фиксировать прибыль!';
            }
            if (differenceFromHight <= 10) {
                return openVolumeText + ' Фиксируйте!';
            }
        }
        if(ohlc.low) {
            const differenceFromLow = this.countDifferenceInPercentage(ohlc.open!, ohlc.low);
            if (differenceFromLow < 15 && differenceFromLow > 10) {
                return openVolumeText + ' Упал, но вроде держится. Наблюдаем';
            }
            if (differenceFromLow <= 10) {
                return openVolumeText + ' Докупаем!';
            }
        }
        return openVolumeText + ' Холдим...';
    }
    
    private getCoinId(commandArgument: string): string | undefined {
    return  Object.keys(this.coinIds).find((key) => {
            const regExp = this.coinIds[key];
            return regExp ? regExp.test(commandArgument) : false;
        });
    }

    private countDifferenceInPercentage(bigger: number, smaller: number): number {
        return 100 * (bigger - smaller) / bigger;
    }

    private async setIntervalToRandomPrediction(): Promise<void> {
        await this.startIntervalCommand(async () => {
            if(this.chatContext == null) {
                return
            }
            const randomCoin = this.getRandomCoin();
            const result = await this.getOhlcv(randomCoin, randomCoin);
            await this.chatContext.sendMessage(`Олег Евгеньевич держит в курсе: ${result}`);
        });
    }

    private getRandomCoin(): string {
        return this.getRandomValueFromArray(Object.keys(this.coinIds));
    }
}

type RegExpIds = {
    [index:string]: RegExp
}

type Ohlc = {
    open?: number |null,
    high?: number |null,
    low?: number |null,
    close?: number |null,
    volume?: number |null,
    market_cap?: number |null,
}

export { CryptoClient };