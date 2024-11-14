import got from "got";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";


class CryptoClient extends BaseCommandClient {
    private baseUrl = 'https://api.coinpaprika.com/v1';
    private triggerRegExp = /стоимость/i;
    private dogeRegExp = /^доги[чи,коин,коины]*/i
    private bitcoinRegExp = /^бит[ок, коин, коины]*/i
    private coinIds: RegExpIds  = {
        'doge-dogecoin': this.dogeRegExp,
        'btc-bitcoin': this.bitcoinRegExp,
    }

    async getReply(args: GetReplyArgs): Promise<void> {
        const response = await this.getOhlcv(args.commandArgument);
        args.ctx?.reply(response);
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    private async getOhlcv(commandArgument?: string | undefined)  {
        if(!commandArgument) {
            return 'Каво';
        }
        const coinId = this.getCoinId(commandArgument);
        if(!coinId) {
            return 'Я не знаю такого коина';
        }
        const url = `${this.baseUrl}/coins/${coinId}/ohlcv/latest/`;
        try {
            const response = await got.get(url);
            const ohlc = (JSON.parse(response.body) as Array<Ohlc>)[0] as Ohlc | undefined;
            if (ohlc?.open) {
                return this.generateOhlcvAnswer(ohlc, commandArgument);
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