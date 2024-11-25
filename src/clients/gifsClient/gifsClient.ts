import { Context, NarrowedContext } from "telegraf";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";
import { Message, Update } from "@telegraf/types";

class GifsClient extends BaseCommandClient {
    private triggerRegExp = /^гиф(ка)?$/i;
    private monday: DayOfWeek = {regExp: /^понедельник$/i, dayIndex: 0};
    private tuesday: DayOfWeek = {regExp: /^вторник$/i, dayIndex: 1};
    private wednesday: DayOfWeek = {regExp: /^среда$/i, dayIndex: 2};
    private thursday: DayOfWeek = {regExp: /^четверг$/i, dayIndex: 3};
    private friday: DayOfWeek = {regExp: /^пятнинца$/i,  dayIndex: 4};
    private saturday: DayOfWeek = {regExp: /^суббота$/i, dayIndex: 5};
    private sunday: DayOfWeek = {regExp: /^воскресение$/i, dayIndex: 6};
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
    private waitingForGifDayOfWeek?: DayOfWeek;

    getReply(args: GetReplyArgs): void {
        if (!args.commandArgument) {
            args.ctx?.reply('Ты забыл указать день недели. После этого отправь гифку и я запомню ее.');
            return
        }
        if (this.waitingForGifDayOfWeek != undefined) {
             args.ctx?.reply('Воу-воу, по одному! Для начала скиньте гифку для предыдущего выбранного дня недели.');
             return;
        }
        const matched = this.weekdaysGifBindings.find((binding) => binding.regExp.test(args.commandArgument!));
        if (matched) {
            this.waitingForGifDayOfWeek = matched;
        }
        args.ctx?.reply(matched ? 'Понял тебя, родной. Пришли гифку, которую мы подвяжем к этому дню недели.' : 'Чо за день недели такой');

    }


    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(commandName);
    }

    async processGifMessage(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<(Record<"document", {}>) | (Record<"document", {}> & Message.DocumentMessage) | any>>): Promise<void> {
        console.log(ctx);
        if (this.waitingForGifDayOfWeek === undefined) return;
        try {
            const gifId = ctx.message.document.file_id;
            this.waitingForGifDayOfWeek.telegramGifId = gifId;
            const copied: DayOfWeek = {
                regExp: this.waitingForGifDayOfWeek.regExp,
                telegramGifId: this.waitingForGifDayOfWeek.telegramGifId,
                dayIndex: this.waitingForGifDayOfWeek.dayIndex,
            }
            this.waitingForGifDayOfWeek = undefined;
            this.weekdaysGifBindings = this.weekdaysGifBindings.map((day) => copied.dayIndex == day.dayIndex ? copied : day);
        } catch {
            ctx.reply('Что-то пошло не так')
        }
    }
}

type DayOfWeek = {
    regExp: RegExp;
    telegramGifId?: string;
    dayIndex: number;
}

export { GifsClient };
