import { Context, NarrowedContext } from "telegraf";
import { GetReplyArgs } from "../baseCommandClient.js";
import { Message, Update } from "@telegraf/types";
import { LocalStorage } from "node-localstorage";
import { IntervalCommandClient } from "../intervalCommandClient.js";
class GifsClient extends IntervalCommandClient<Update.MessageUpdate<Record<"text", {}> & Message.TextMessage> & any> {
    private localStorage: LocalStorage;
    private localStorageWeekdayGifBindingsKey = 'weekdays'
    private setGifTriggerRegExp = /^гиф(ка)?$/i;
    private showWeekdayTriggerRegExp = /^(какой (сейчас )?)?день недели(\?)?$/i;
    private monday: DayOfWeek = {regExp: /^понедельник$/i, dayIndex: 1};
    private tuesday: DayOfWeek = {regExp: /^вторник$/i, dayIndex: 2};
    private wednesday: DayOfWeek = {regExp: /^среда$/i, dayIndex: 3};
    private thursday: DayOfWeek = {regExp: /^четверг$/i, dayIndex: 4};
    private friday: DayOfWeek = {regExp: /^пятница$/i,  dayIndex: 5};
    private saturday: DayOfWeek = {regExp: /^суббота$/i, dayIndex: 6};
    private sunday: DayOfWeek = {regExp: /^воскресение$/i, dayIndex: 7};
    private weekdayGifBindings: Array<DayOfWeek> = [
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

    constructor(localStorage: LocalStorage) {
        super();
        this.localStorage = localStorage;
        const savedWeekdayGifBindings = this.loadWeekdayGifBindingsFromLocal();
        if (savedWeekdayGifBindings.length > 0) {
            this.weekdayGifBindings = savedWeekdayGifBindings;
        }
    }

    async getReply(args: GetReplyArgs<Update>): Promise<void> {
        if(this.showWeekdayTriggerRegExp.test([args.commandName, args.commandArgument].join(' '))) {
            const now = new Date(Date.now());
            const found = this.weekdayGifBindings.find((day) => day.dayIndex === now.getDay());
            const savedGifId = found?.telegramGifId;
            if(!savedGifId) {
                args.ctx?.reply('Не нашел гифки на этот день недели, брат');
                return;
            }
            try {
                const url = await args.ctx!.telegram.getFileLink(savedGifId);
                args.ctx?.replyWithAnimation({url: url.toString()});
                found.lastSentDate = new Date(Date.now());
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
        const matched = this.weekdayGifBindings.find((binding) => binding.regExp.test(args.commandArgument!));
        if (matched) {
            this.waitingForGifDayOfWeek = matched;
        }
        args.ctx?.reply(matched ? 'Понял тебя, родной. Пришли гифку, которую мы подвяжем к этому дню недели.' : 'Чо за день недели такой');

    }


    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.setGifTriggerRegExp.test(commandName) || this.showWeekdayTriggerRegExp.test([commandName, commandArgument].join(' '));
    }

    async startIntervalSubscribtions(): Promise<void> {
        await this.startIntervalCommand(async () => {
            if(this.chatContext == null || this.chatContext == undefined) {
                return;
            }
            const now = new Date(Date.now());
            this.weekdayGifBindings.forEach(async (day) => {
                const hasntSentToday = !day.lastSentDate || day.lastSentDate!.getFullYear() != now.getFullYear() || day.lastSentDate!.getMonth() != now.getMonth() || day.lastSentDate!.getDate() != now.getDate();
                if (now.getDay() == day.dayIndex && hasntSentToday && day.telegramGifId) {
                    try {
                        const url = await this.chatContext!.telegram.getFileLink(day.telegramGifId);
                        this.chatContext!.replyWithAnimation({url: url.toString()});
                        day.lastSentDate = now;
                        this.saveWeekdayGifBindigsToLocal();
                    } catch {
                        console.log('Interval gif client: Got today\'s gif, but coulnd not sent it');
                    }
                }
            });

        });
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
            this.weekdayGifBindings = this.weekdayGifBindings.map((day) => copied.dayIndex == day.dayIndex ? copied : day);
            this.saveWeekdayGifBindigsToLocal();
            ctx.reply('Запомнил гифку, братан');
        } catch {
            ctx.reply('Что-то пошло не так')
        }
    }

    private saveWeekdayGifBindigsToLocal(): void {
        this.localStorage.setItem(this.localStorageWeekdayGifBindingsKey, JSON.stringify(this.weekdayGifBindings));
    }

    private loadWeekdayGifBindingsFromLocal(): Array<DayOfWeek> {
        let result: Array<DayOfWeek> = [];
        try {
            const saved = this.localStorage.getItem(this.localStorageWeekdayGifBindingsKey);
            if (saved) {
                result = JSON.parse(saved);
            }
        } catch {
            console.log('Не получилось загрузить гифки из локалки');
        }
        return result;
    }
}

type DayOfWeek = {
    regExp: RegExp;
    dayIndex: number;
    telegramGifId?: string;
    lastSentDate?: Date;
}

export { GifsClient };
