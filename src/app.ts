import { Context, NarrowedContext, Telegraf } from "telegraf";
import { GEOCODER_KEY, TG_TOKEN, WEATHER_KEY } from "../token.js";
import { GeocoderClient } from "./clients/geocoderClient/geocoderClient.js";
import { WeatherClient } from "./clients/weatherClient/weatherClient.js";
import { WhoCommandClient } from "./clients/simpleCommandsReplies/whoCommandClient.js";
import { message } from "telegraf/filters";
import { MembersStorageClient } from "./clients/membersStorageClient/membersStorageClient.js";
import { UnknownCommandClient } from "./clients/simpleCommandsReplies/unknownCommandClient.js";
import { WhenCommandClient } from "./clients/simpleCommandsReplies/whenCommandClient.js";
import { ImageClient } from "./clients/imageClient/imageClient.js";
import { Update } from "@telegraf/types";
import { UnknownEnglishCommandClient } from "./clients/simpleCommandsReplies/unknownEnglishCommandClient.js";
import { BaseCommandClient } from "./clients/baseCommandClient.js";
import { ProfanityCommandClient } from "./clients/simpleCommandsReplies/profanityCommandClient.js";

class App {
    private isResponsing = false;
    private bot = new Telegraf(TG_TOKEN);
    private unknownCommandClient = new UnknownCommandClient();
    private membersStorageClient = new MembersStorageClient();
    // private geocoder = new GeocoderClient(GEOCODER_KEY);
    // private weatherClient = new WeatherClient(WEATHER_KEY);
    private imageClient = new ImageClient();
    private unknownEnglishCommandClient = new UnknownEnglishCommandClient();
    private whenCommandClient = new WhenCommandClient();
    private whoCommandnClient = new WhoCommandClient();
    private profanitiesClient = new ProfanityCommandClient();
    private clients: Array<BaseCommandClient> =  [
        this.membersStorageClient,

        // TODO: Yandex blacklisted me in their geo api, so i need to find replacement
        // this.geocoder,
        // this.weatherClient,
        this.imageClient,
        this.unknownEnglishCommandClient,
        this.whenCommandClient,
        this.whoCommandnClient,
        this.profanitiesClient,
    ];

    startApp() {
        this.addTextSubscribtion();
        this.addPhotoSubscribtion();
        this.bot.launch();
        console.log('Фома 2.0 начал работу');
        setInterval(() => console.log('Bot is online'), 100000);
    }

    private startCommandProccess(ctx: NarrowedContext<Context<Update>, Update.MessageUpdate<any>>, message: string): CommandProccessResult | undefined {
        const sender = [ctx.update.message.from.first_name, (ctx.update.message.from.last_name ?? '')].join(' ').trim();
        this.membersStorageClient.addMember(sender);
        if(!message.toLowerCase().startsWith('фома, ')) {
            return;
        }
        if(this.isResponsing) {
            return;
        }
        const command = message.slice(message.indexOf(',') + 1).trim();
        const commandName = command.split(' ')[0].toLowerCase();
        const commandArgument = command.split(' ').slice(1).join(' ');
        console.log('Incoming command: ' + commandName);
        console.log('Incoming argument: ' + commandArgument);
        return {
            commandName: commandName,
            commandArgument: commandArgument
        };
    }

    private addTextSubscribtion() {
        this.bot.on(message('text'), async (ctx) => {
            var proccessResult = this.startCommandProccess(ctx, ctx.message.text);
            if(!proccessResult) {
                return
            }
            this.isResponsing = true;
            var match = this.clients.find((client) => client.isMatch(proccessResult!.commandName, proccessResult!.commandArgument));
            if(match) {
                match.getReply({
                    commandName: proccessResult.commandName,
                    commandArgument: proccessResult.commandArgument,
                    ctx: ctx,
                    members: this.membersStorageClient.collectedMembers,
                });
            } else {
                this.unknownCommandClient.getReply({
                    commandName: proccessResult.commandName,
                    ctx: ctx,
                })
            }
            this.isResponsing = false;
          });
    }

    private addPhotoSubscribtion() {
        this.bot.on(message('photo'), async(ctx) => {
            var proccessResult = this.startCommandProccess(ctx, ctx.message.caption ?? '');
            if(!proccessResult) {
                return
            }
            this.isResponsing = true;
            const match = this.clients.find((client) => client.isMatch(proccessResult!.commandName, proccessResult!.commandArgument));
            if(match) {
                match.getReply({
                    commandName: proccessResult.commandName,
                    commandArgument: proccessResult.commandArgument,
                    ctx: ctx,
                    members: this.membersStorageClient.collectedMembers,
                });
            } else {
                this.unknownCommandClient.getReply({
                    commandName: proccessResult.commandName,
                    ctx: ctx,
                })
            }
            this.isResponsing = false;
          });
    }
}

type CommandProccessResult = {
    commandName: string,
    commandArgument?: string,
}

export { App };