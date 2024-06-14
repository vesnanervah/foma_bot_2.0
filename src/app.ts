import { Context, NarrowedContext, Telegraf } from "telegraf";
import { GEOCODER_KEY, TG_TOKEN, WEATHER_KEY } from "../token.js";
import { Geocoder } from "./geocoder/geocoder.js";
import { WeatherClient } from "./weatherClient/weatherClient.js";
import { WhoCommandClient } from "./simpleCommandsReplies/whoCommandClient.js";
import { message } from "telegraf/filters";
import { MembersLocalStorage } from "./membersLocalStorage/membersLocalStorage.js";
import { UnknownCommandClient } from "./simpleCommandsReplies/unknownCommandClient.js";
import { WhenCommandClient } from "./simpleCommandsReplies/whenCommandClient.js";
import { ImageClient } from "./imageClient/imageClient.js";
import { Message, Update } from "@telegraf/types";
import { UnknownEnglishCommandClient } from "./simpleCommandsReplies/unknownEnglishCommandClient.js";

class App {
    private isResponsing = false;
    private geocoder = new Geocoder(GEOCODER_KEY);
    private weatherClient = new WeatherClient(WEATHER_KEY);
    private bot = new Telegraf(TG_TOKEN);
    private membersLocalStorage = new MembersLocalStorage();
    private imageClient = new ImageClient();
    private unknownCommandClient = new UnknownCommandClient();
    private unknownEnglishCommandClient = new UnknownEnglishCommandClient();
    private whenCommandClient = new WhenCommandClient();
    private whoCommandnClient = new WhoCommandClient();
    private commands:Commands = {
        'кто': (commandArgument?: string, members?: Array<string>) =>this.whoCommandnClient.whoCommandReply(commandArgument, members!),
        'кому': (commandArgument?: string, members?: Array<string>) =>this.whoCommandnClient.whoCommandReply(commandArgument, members!),
        'кого': (commandArgument?: string, members?: Array<string>) =>this.whoCommandnClient.whoCommandReply(commandArgument, members!),
        'координаты': (commandArgument?: string) => this.getCityCoordinates(commandArgument),
        'погода': (commandArgument?: string) => this.getCurrentWeather(commandArgument),
        'когда': () => this.whenCommandClient.getWhenReply(),
        'очистить_мемберов': () => this.clearColletedMembers(),
        'рсфср': (_, __, ctx) => this.getRcfcr(ctx!),
        'шалаш': (_, __, ctx) => this.getShalash(ctx!),
    };

    startApp() {
        this.addTextSubscribtion();
        this.addPhotoSubscribtion();
        this.bot.launch();
        console.log('Фома 2.0 начал работу');
        setInterval(() => console.log('Bot is online'), 100000);
    }

    private addTextSubscribtion() {
        this.bot.on(message('text'), async (ctx) => {
            var sender = [ctx.update.message.from.first_name, (ctx.update.message.from.last_name ?? '')].join(' ').trim();
            this.membersLocalStorage.addMember(sender);
    
            if(!ctx.message.text.toLowerCase().startsWith('фома, ')) {
                return;
            }
            if(this.isResponsing) {
                return;
            }
            this.isResponsing = true;
            var command = ctx.message.text.slice(ctx.message.text.indexOf(',') + 1).trim();
            var commandName = command.split(' ')[0].toLowerCase();
            var commandArgument = command.split(' ').slice(1).join(' ');
            console.log('Incoming command: ' + commandName)
            console.log('Incoming argument: ' + commandArgument)
            // TODO: split copypast bellow to separate method
            if (/[a-z]/i.test(commandName)) {
                // TODO: move all commands to regexps
                ctx.reply(this.unknownEnglishCommandClient.unknownCommandReply());
            } else if (!commandName || commandName.length == 0 || !this.commands[commandName.toLowerCase()]) {
                ctx.reply(this.unknownCommandClient.unknownCommandReply());
            } else {
                var result = await this.commands[commandName.toLowerCase()](commandArgument, this.membersLocalStorage.collectedMembers, ctx);
                if (typeof result === 'string') {
                    ctx.reply(result);
                }
            }
            this.isResponsing = false;
          });
    }

    private addPhotoSubscribtion() {
        this.bot.on(message('photo'), async(ctx) => {
            if(!ctx.message.caption || ctx.message.caption?.length == 0  || !ctx.message.caption!.toLowerCase().startsWith('фома, ')) {
                return;
            }
            if(this.isResponsing) {
                return;
            }
            this.isResponsing = true;
            var command = ctx.message.caption.slice(ctx.message.caption.indexOf(',') + 1).trim();
            var commandName = command.split(' ')[0].toLowerCase();
            var commandArgument = command.split(' ').slice(1).join(' ');
            console.log('Incoming command: ' + commandName);
            console.log('Incoming argument: ' + commandArgument);
            if (!commandName || commandName.length == 0 || !this.commands[commandName.toLowerCase()]) {
                ctx.reply(this.unknownCommandClient.unknownCommandReply());
            } else {
                var result = await this.commands[commandName.toLowerCase()](commandArgument, this.membersLocalStorage.collectedMembers, ctx);
                if (typeof result === 'string') {
                    ctx.reply(result);
                } else {
                    ctx.replyWithPhoto({source: result});
                }
            }
            this.isResponsing = false;

        });
    }

    private clearColletedMembers() {
        this.membersLocalStorage.clearCollectedMembers();
        return 'Собранные мемберы почищены...'
    }

    private async getCityCoordinates(cityName?: string): Promise<string> {
        if(!cityName || cityName.length === 0) {
            return 'А город я угадать должен?';
        }
        var response = await this.geocoder.getCityCoordinates(cityName);
        return response.success ? `Координаты места ${cityName}: широта ${response.latitude}, долгота ${response.longitude}` : (response.errorMessage ?? 'Незахендленный ерор. Еблан керик хуйни накодил.');
    }
    
    private async getCurrentWeather(cityName?: string): Promise<string> {
        if(!cityName || cityName.length === 0) {
            return 'где именно то'
        }
        var geocodingResult = await this.geocoder.getCityCoordinates(cityName);
        if (!geocodingResult.success ) {
            return geocodingResult.errorMessage ??  'Незахендленный ерор. Еблан керик хуйни накодил.';
        }
        var currentWeather = await this.weatherClient.getCurrentWeather(geocodingResult, cityName);
        return currentWeather;
    }

    private async getRcfcr(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Record<"photo", {}> & Message.PhotoMessage>>): Promise<string | Buffer> {
        try {
            const url = await ctx.telegram.getFileLink(ctx.message.photo[1].file_id);
            var rcfcr = await this.imageClient.getRcfcr(url.toString());
            return rcfcr;
        } catch {
            return 'Не удалось сделать рсфср';
        }
    }

    private async getShalash(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<Record<"photo", {}> & Message.PhotoMessage>>): Promise<string | Buffer> {
        try {
            const url = await ctx.telegram.getFileLink(ctx.message.photo[1].file_id);
            var rcfcr = await this.imageClient.getShalash(url.toString());
            return rcfcr;
        } catch {
            return 'Не удалось сделать шалаш';
        }
    }
}

type Commands = {
    [index: string]:  (commandArgument?: string, members?: Array<string>, ctx?: any) => any; 
}

export { App };