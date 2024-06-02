import { Telegraf } from "telegraf";


startApp();

const bot = new Telegraf(TG_TOKEN);

async function startApp(): Promise<void> {
    console.log('Фома 2.0 взялся за работу!')
    bot.launch();
    setInterval(() => console.log('Bot is online'), 10000);
}

