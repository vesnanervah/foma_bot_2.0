import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";

class GifsClient extends BaseCommandClient {
    private triggerRegExp = /^гиф(ка)?$/i;
    private monday: DayOfWeek = {regExp: /^понедельник$/i};
    private tuesday: DayOfWeek = {regExp: /^вторник$/i};
    private wednesday: DayOfWeek = {regExp: /^среда$/i};
    private thursday: DayOfWeek = {regExp: /^четверг$/i};
    private friday: DayOfWeek = {regExp: /^пятнинца$/i};
    private saturday: DayOfWeek = {regExp: /^суббота$/i};
    private sunday: DayOfWeek = {regExp: /^воскресение$/i};
    private weekdaysGifBindings: Array<DayOfWeek> = [
        this.monday,
        this.tuesday,
        this.wednesday,
        this.thursday,
        this.friday,
        this.saturday,
        this.sunday,
    ]

    // also an indicator of already started gifs proccessing
    public waitingForGifExpression?: RegExp;

    getReply(args: GetReplyArgs): void {
        if (!args.commandArgument) {
            args.ctx?.reply('Ты забыл указать день недели. После этого отправь гифку и я запомню ее.');
            return
        }
        if (this.waitingForGifExpression != undefined) {
             args.ctx?.reply('Воу-воу, по одному! Для начала скиньте гифку для предыдущего выбранного дня недели.');
             return;
        }
        const matched = this.weekdaysGifBindings.find((binding) => binding.regExp.test(args.commandArgument!));
        if (matched) {
            this.waitingForGifExpression = matched.regExp;
        }
        args.ctx?.reply(matched ? 'Понял тебя, родной. Пришли гифку, которую мы подвяжем к этому дню недели.' : 'Чо за день недели такой');

    }


    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }
}

type DayOfWeek = {
    regExp: RegExp;
    telegramGifId?: string;
}

export { GifsClient };
