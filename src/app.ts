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
import { CryptoClient } from "./clients/cryptoClient/cryptoClient.js";
import { IntervalCommandClient } from "./clients/intervalCommandClient.js";
import { GifsClient } from "./clients/gifsClient/gifsClient.js";
import { LocalStorage } from "node-localstorage";

class App {
    private isResponsing = false;
    private bot = new Telegraf(TG_TOKEN);
    private localStorage = new LocalStorage('./scratch');
    private unknownCommandClient = new UnknownCommandClient();
    private membersStorageClient = new MembersStorageClient(this.localStorage);
    private geocoder = new GeocoderClient(GEOCODER_KEY);
    private weatherClient = new WeatherClient(WEATHER_KEY);
    private cryptoClient = new CryptoClient();
    private imageClient = new ImageClient();
    private unknownEnglishCommandClient = new UnknownEnglishCommandClient();
    private whenCommandClient = new WhenCommandClient();
    private whoCommandnClient = new WhoCommandClient();
    private profanitiesClient = new ProfanityCommandClient();
    private gifsClient = new GifsClient(this.localStorage);
    private intervalClientsSubscribed = false;
    private clients: Array<BaseCommandClient> =  [
        this.membersStorageClient,
        this.geocoder,
        this.weatherClient,
        this.imageClient,
        this.unknownEnglishCommandClient,
        this.whenCommandClient,
        this.whoCommandnClient,
        this.profanitiesClient,
        this.cryptoClient,
        this.gifsClient,
    ];
    private intervalClients: Array<IntervalCommandClient<Context>> = [
        this.cryptoClient,
        this.gifsClient,
    ];

    startApp() {
        this.addTextSubscribtion();
        this.addPhotoSubscribtion();
        this.addGifsSubscribtion();
        this.bot.launch();
        console.log('Фома 2.0 начал работу');
        setInterval(() => console.log('Bot is online'), 100000);
    }

    private async processIncomingText(args: ProcessTextCommandArgs): Promise<void> {
        if(this.isResponsing) {
            return;
        }
        const message = args.getIcomingMessage();
        const parsedCommand = this.parseTextCommand(message);
        if(!parsedCommand) {
            return;
        }
        this.isResponsing = true; 
        // TODO: do not proceed next if command name is empty
        var match = this.clients.find((client) => client.isMatch(parsedCommand.commandName, parsedCommand.commandArgument));
        if(match) {
            match.getReply({
                commandName: parsedCommand.commandName,
                commandArgument: parsedCommand.commandArgument,
                ctx: args.context,
                members: this.membersStorageClient.collectedMembers,
            });
        } else {
            this.unknownCommandClient.getReply({
                commandName: parsedCommand.commandName,
                ctx: args.context,
            })
        }
        this.isResponsing = false;

    }

    private addTextSubscribtion() {
        this.bot.on(message('text'), async (ctx) => {
            if(!this.intervalClientsSubscribed)
            this.subsribeIntervalClients(ctx);
        // TODO: find native way to get all users from chat
            const sender = [ctx.update.message.from.first_name, (ctx.update.message.from.last_name ?? '')].join(' ').trim();
            this.membersStorageClient.addMember(sender);
            this.processIncomingText({
                context: ctx,
                getIcomingMessage() {
                    return ctx.message.text;
                }
            });
          });
    }

    private addPhotoSubscribtion() {
        this.bot.on(message('photo'), async(ctx) => {
            return this.processIncomingText({
                context: ctx,
                getIcomingMessage() {
                    return ctx.message.caption ?? ''
                },
            })
          });
    }

    private addGifsSubscribtion() {
        this.bot.on(message('document'), async(ctx) => {
            if (ctx.message.from.is_bot) return;
            this.gifsClient.processGifMessage(ctx);
          });
    }

    private subsribeIntervalClients(chatContext: Context) {
        this.intervalClients.forEach((client) => {
            if(client.chatContext === undefined) {
                client.chatContext = chatContext;
                client.startIntervalSubscribtions();
            }
        });
        this.intervalClientsSubscribed = true;
    }

    private parseTextCommand(message: string): parsedCommand | void {
        if(!message.toLowerCase().startsWith('фома, ')) {
            return;
        }
        const command = message.slice(message.indexOf(',') + 1).trim();
        const commandName = command.split(' ')[0].toLowerCase().trim();
        const commandArgument = command.split(' ').slice(1).join(' ')?.trim();
        console.log('Incoming command: ' + commandName);
        console.log('Incoming argument: ' + commandArgument);
        return {
            commandName: commandName,
            commandArgument: commandArgument
        };
    }
}

type ProcessTextCommandArgs = {
    context: NarrowedContext<Context<Update>, Update>,
    getIcomingMessage: () => string,
}

type parsedCommand = {
    commandName: string,
    commandArgument?: string,
}

export { App };