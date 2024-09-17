import { GetReplyArgs } from "../baseCommandClient.js";
import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";

class ProfanityCommandClient extends BaseSimpleCommandClient {


    protected preludes = [
        'Какие тут все вежливые',
        'Пакости какие-то говоришь тут...',
        'Не хочу продолжать эту высокоинтеллектуальную дискуссию',
    ];

    private insultsReply = [
        'Это ты себе?',
        'Сам такой',
        'Ну давай разберем по частям, тобою написанное )) Складывается впечатление что ты реально контуженный , обиженный жизнью имбицил )) Могу тебе и в глаза сказать, готов приехать послушать?) Вся та хуйня тобою написанное это простое пиздабольство , рембо ты комнатный)) от того что ты много написал, жизнь твоя лучше не станет)) пиздеть не мешки ворочить, много вас таких по весне оттаяло )) Про таких как ты говорят: Мама не хотела, папа не старался) Вникай в моё послание тебе постарайся проанализировать и сделать выводы для себя)',
        'Ах, кажется я ошибся в тебе))',
    ];

    private fUReplies = [
        'Не хочу',
        'Сам иди',
        'Нет ты иди нахуй',
    ];

    private insults = [
        'долбаеб',
        'дебил',
        'еблан',
        'додик',
        'идиот',
        'придурок',
        'полупокер',
        'ебанат',
        'хуй',
        'лох',
        'чепуш',
        'додик'
    ];

    private profanities = [
        ...this.insults,
        'пизда',
        'хуйня',
        'ебал',
        'наебал',
        'соси',
    ]

    getReply(args: GetReplyArgs): void {
        var sentence = [args.commandName, args.commandArgument ?? ''].join(' ');
        if (this.isFU(sentence)) {
            args.ctx?.reply(this.getRandomValueFromArray(this.fUReplies));
            return;
        }
        if(this.isInsult(sentence)) {
            args.ctx?.reply(this.getRandomValueFromArray(this.insultsReply));
            return;
        }
        args.ctx?.reply(this.getRandomPrelude());
    }

    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.isFU([commandName, commandArgument ?? ''].join(' ')) ||
        !![commandName, commandArgument ?? ''].join(' ').split(' ').find((word) => this.profanities.includes(word));
    }

    private isInsult(sentence:string): boolean {
        const wordsArr = sentence.split(' ');
        const hasYouWord = wordsArr.includes('ты');
        if (hasYouWord) {
            let youIndex = wordsArr.indexOf('ты');
            return this.insults.includes(wordsArr[youIndex == 0 ? 1 : youIndex + 1]);
        }
        return !!this.insults.find((insult) => sentence.startsWith(insult));
    }
    
    private isFU(sentence: string): boolean {
        return /^иди|пошел|съеби|вали\s?нахуй/i.test(sentence) || /^нахуй\sиди|пошел|съеби|вали/i.test(sentence);
    }
}

export { ProfanityCommandClient };