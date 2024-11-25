import { Context, NarrowedContext } from "telegraf";
import { BaseCommandClient, GetReplyArgs } from "../baseCommandClient.js";
import { Message, Update } from "@telegraf/types";
import Jimp from "jimp";

class GifsClient extends BaseCommandClient {
    private setGifTriggerRegExp = /^гиф(ка)?$/i;
    private showWeekdayTriggerRegExp = /^(какой (сейчас )?)?день недели(\?)?$/i;
    private monday: DayOfWeek = {regExp: /^понедельник$/i, dayIndex: 1};
    private tuesday: DayOfWeek = {regExp: /^вторник$/i, dayIndex: 2};
    private wednesday: DayOfWeek = {regExp: /^среда$/i, dayIndex: 3};
    private thursday: DayOfWeek = {regExp: /^четверг$/i, dayIndex: 4};
    private friday: DayOfWeek = {regExp: /^пятнинца$/i,  dayIndex: 5};
    private saturday: DayOfWeek = {regExp: /^суббота$/i, dayIndex: 6};
    private sunday: DayOfWeek = {regExp: /^воскресение$/i, dayIndex: 7};
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

    async getReply(args: GetReplyArgs): Promise<void> {
        if(this.showWeekdayTriggerRegExp.test([args.commandName, args.commandArgument].join(' '))) {
            const now = new Date(Date.now());
            const found = this.weekdaysGifBindings.find((day) => day.dayIndex === now.getDay());
            const savedGifId = found?.telegramGifId;
            if(!savedGifId) {
                args.ctx?.reply('Не нашел гифки на этот день недели, брат');
                return;
            }
            try {
                const url = await args.ctx!.telegram.getFileLink(savedGifId);
                args.ctx?.replyWithAnimation({url: url.toString()});
            } catch {
                args.ctx?.reply('Не получилось загрузить гифку. Дурофф ты сука????');
            }
            return;
        }

        if (!args.commandArgument) {
            args.ctx?.reply('Ты забыл указать день недели. После этого отправь гифку и я запомню ее.');
            return;
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
        return this.setGifTriggerRegExp.test(commandName) || this.showWeekdayTriggerRegExp.test([commandName, commandArgument].join(' '));
    }

    async processGifMessage(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<(Record<"document", {}>) | (Record<"document", {}> & Message.DocumentMessage) | any>>): Promise<void> {
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
            ctx.reply('Запомнил гифку, братан');
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
