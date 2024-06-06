import { Context, Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import { TG_TOKEN } from "../token";
import context, { NarrowedContext } from "telegraf/typings/context";
import { whoCommand } from "./simpleCommands/whoCommand";

startApp();

async function startApp(): Promise<void> {
    const bot = new Telegraf(TG_TOKEN);
    var collectedMembers = new Array<string>();
    console.log('Фома 2.0 взялся за работу!');

    const commands:Commands = {
        'кто': (commandArgument?: string, members?: Array<string>) => whoCommand(members!),
        'очистить_мемберов': () => {
            collectedMembers = new Array<string>;
            return 'Собранные мемберы почищены...'
        },
    };

    bot.on(message('text'), async (ctx) => {
        var sender = [ctx.update.message.from.first_name, (ctx.update.message.from.last_name ?? '')].join(' ').trim();
        console.log('The sender is: '+ sender);
        if (sender && !collectedMembers.includes(sender)) {
            // Костыль сбор всех участников тк в api бота мы не можем получить список участников
            collectedMembers.push(sender);
            console.log(collectedMembers);
        }


        if(!ctx.message.text.toLowerCase().startsWith('фома, ')) {
            return;
        }

        var command = ctx.message.text.slice(ctx.message.text.indexOf(',') + 1).trim().toLowerCase();
        var commandName = command.split(' ')[0];
        var commandArgument = command.split(' ')[1];
        console.log('Incoming command: ' + commandName)
        console.log('Incoming argument: ' + commandArgument)
        if (!commandName || commandName.length == 0 || !commands[commandName.toLowerCase()] || !commandArgument || commandArgument.length == 0) {
            ctx.reply('Не понял');
            return;
        };
        var result = commands[commandName.toLowerCase()](commandArgument, collectedMembers);
        if (typeof result === 'string') {
            ctx.reply(result);
        }
      });

    bot.launch();
    setInterval(() => console.log('Bot is online'), 10000);
}

type Commands = {
    [index: string]:  (commandArgument?: string, members?: Array<string>) => any; 
}


