class GifBindedWeekday {
    dayIndex: number;
    telegramGifId?: string;
    lastSentDate?: Date;

    static weekdayDetectRegExp = [
        RegExp(/^понедельник$/i),
        RegExp(/^вторник$/i),
        RegExp(/^среда$/i),
        RegExp(/^четверг$/i),
        RegExp(/^пятница$/i),
        RegExp(/^суббота$/i),
        RegExp(/^воскресение$/i),
    ];

    constructor(args: GifBindedWeekdayConstructorArgs) {
        this.dayIndex = args.dayIndex;
        this.telegramGifId = args.telegramGifId;
        this.lastSentDate = args.lastSentDate;
    }

    static generateDaysOfWeek() {
        return [
            new GifBindedWeekday({dayIndex: 1}),
            new GifBindedWeekday({dayIndex: 2}),
            new GifBindedWeekday({dayIndex: 3}),
            new GifBindedWeekday({dayIndex: 4}),
            new GifBindedWeekday({dayIndex: 5}),
            new GifBindedWeekday({dayIndex: 6}),
            new GifBindedWeekday({dayIndex: 7}),
        ];
    }

    static getDayOfWeekFromStringified(stringifiedDayOfWeek: StringifiedGifBindedWeekday) {
        const parsedDate = stringifiedDayOfWeek.lastSentDate ? new Date(Date.parse(stringifiedDayOfWeek.lastSentDate)) : undefined;
        return new GifBindedWeekday({
            dayIndex: stringifiedDayOfWeek.dayIndex,
            telegramGifId: stringifiedDayOfWeek.telegramGifId,
            lastSentDate: parsedDate,
            });
    }

    getRegExp() {
        return GifBindedWeekday.weekdayDetectRegExp[this.dayIndex - 1];
    }
}

type GifBindedWeekdayConstructorArgs = {
    dayIndex: number, 
    telegramGifId?: string, 
    lastSentDate?: Date
}

type StringifiedGifBindedWeekday = {
    dayIndex: number;
    telegramGifId?: string;
    lastSentDate?: string;
}

export { StringifiedGifBindedWeekday, GifBindedWeekday };