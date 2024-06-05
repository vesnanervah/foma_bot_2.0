import { Context, Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import { TG_TOKEN } from "../token";
import context from "telegraf/typings/context";

startApp();

async function startApp(): Promise<void> {
    const bot = new Telegraf(TG_TOKEN).hears(['Фома,', 'фома,'], () =>{
        console.log('hooked middleware');
    });
    console.log('Фома 2.0 взялся за работу!');



    bot.on(message('text'), async (ctx) => {
        var command = ctx.message.text.slice(ctx.message.text.indexOf(',') + 1).trim().toLowerCase();
        console.log('Incoming text command: ' + command)
        
        ctx.reply('Не понял');
      });

    bot.launch();
    setInterval(() => console.log('Bot is online'), 10000);
}


