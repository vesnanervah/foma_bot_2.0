import { Context, NarrowedContext } from "telegraf";
import { GetReplyArgs } from "../baseCommandClient.js";
import { Message, Update } from "@telegraf/types";
import { LocalStorage } from "node-localstorage";
import { IntervalCommandClient } from "../intervalCommandClient.js";
import { GifBindedWeekday, StringifiedGifBindedWeekday } from "./entities/gifBindedWeekday.js";
class GifsClient extends IntervalCommandClient<Update.MessageUpdate<Record<"text", {}> & Message.TextMessage> & any> {
    private localStorage: LocalStorage;
    private localStorageWeekdayGifBindingsKey = 'weekdays'
    private setGifTriggerRegExp = /^гиф(ка)?$/i;
    private showWeekdayTriggerRegExp = /^(какой (сейчас )?)?день недели(\?)?$/i;
    private gifBindedWeekdays = GifBindedWeekday.generateDaysOfWeek();
    // also an indicator of already started gifs proccessing
    private waitingForGifDayOfWeek?: GifBindedWeekday;

    constructor(localStorage: LocalStorage) {
        super();
        this.localStorage = localStorage;
        this.loadWeekdayGifBindingsFromLocal();
    }

    async getReply(args: GetReplyArgs<Update>): Promise<void> {
        if(this.showWeekdayTriggerRegExp.test([args.commandName, args.commandArgument].join(' '))) {
            const now = new Date(Date.now());
            const found = this.gifBindedWeekdays.find((day) => day.dayIndex === now.getDay());
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
        const matched = this.gifBindedWeekdays.find((binding) => binding.getRegExp().test(args.commandArgument!));
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
            this.gifBindedWeekdays.forEach(async (day) => {
                if (day.lastSentDate == undefined) return;
                const hasntSentToday =  day.lastSentDate!.getFullYear() != now.getFullYear() || day.lastSentDate!.getMonth() != now.getMonth() || day.lastSentDate!.getDate() != now.getDate();
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
            const copied = new GifBindedWeekday({                
                telegramGifId: this.waitingForGifDayOfWeek.telegramGifId,
                dayIndex: this.waitingForGifDayOfWeek.dayIndex,
            });
            this.waitingForGifDayOfWeek = undefined;
            this.gifBindedWeekdays = this.gifBindedWeekdays.map((day) => copied.dayIndex == day.dayIndex ? copied : day);
            this.saveWeekdayGifBindigsToLocal();
            ctx.reply('Запомнил гифку, братан');
        } catch {
            ctx.reply('Что-то пошло не так')
        }
    }

    private saveWeekdayGifBindigsToLocal(): void {
        this.localStorage.setItem(this.localStorageWeekdayGifBindingsKey, JSON.stringify(this.gifBindedWeekdays));
    }

    private loadWeekdayGifBindingsFromLocal() {
        try {
            const saved = this.localStorage.getItem(this.localStorageWeekdayGifBindingsKey);
            if (saved) {
                const stringifiedWeekdays = JSON.parse(saved) as Array<StringifiedGifBindedWeekday>;
                this.gifBindedWeekdays = stringifiedWeekdays.map((day) => GifBindedWeekday.getDayOfWeekFromStringified(day));
            }
        } catch {
            console.log('Не получилось загрузить гифки из локалки');
        }

    }
}


export { GifsClient };
