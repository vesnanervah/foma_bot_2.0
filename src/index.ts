import {  Telegraf } from "telegraf";
import { message } from 'telegraf/filters';
import { GEOCODER_KEY, TG_TOKEN, WEATHER_KEY } from "../token.js";
import { whoCommand } from "./simpleCommands/whoCommand.js";
import { LocalStorage } from 'node-localstorage';
import { Geocoder, GeocodingResult } from "./geocoder/geocoder.js";
import { WeatherClient } from "./weather/weather.js";


const collectedMembersLocalStorageKey = 'members';
const localStorage = new LocalStorage('./scratch');
const geocoder = new Geocoder(process.env.geocoder_key ?? GEOCODER_KEY);
const weatherClient = new WeatherClient(process.env.weather_key ?? WEATHER_KEY);
var isResponsing = false;
startApp();

async function startApp(): Promise<void> {
    const bot = new Telegraf(process.env.tg_token ?? TG_TOKEN);
    const collectedMembersLocalStorageKey = 'members';
    var collectedMembers = getLocalCollectedMembers();
    console.log('Фома 2.0 взялся за работу!');

    const commands:Commands = {
        'кто': (commandArgument?: string, members?: Array<string>) => whoCommand(members!),
        'координаты': (commandArgument?: string) => getCityCoordinates(commandArgument),
        'погода': (commandArgument?: string) => getCurrentWeather(commandArgument),
        'очистить_мемберов': () => {
            collectedMembers = new Array<string>;
            return 'Собранные мемберы почищены...'
        },
    };

    bot.on(message('text'), async (ctx) => {

        var sender = [ctx.update.message.from.first_name, (ctx.update.message.from.last_name ?? '')].join(' ').trim();
        if (sender && !collectedMembers.includes(sender)) {
            // Костыль сбор всех участников тк в api бота мы не можем получить список участников
            collectedMembers.push(sender);
            localStorage.setItem(collectedMembersLocalStorageKey, JSON.stringify(collectedMembers));
            console.log(collectedMembers);
        }


        if(!ctx.message.text.toLowerCase().startsWith('фома, ')) {
            return;
        }
        if(isResponsing) {
            return;
        }
        isResponsing = true;
        var command = ctx.message.text.slice(ctx.message.text.indexOf(',') + 1).trim();
        var commandName = command.split(' ')[0].toLowerCase();
        var commandArgument = command.split(' ').slice(1).join(' ');
        console.log('Incoming command: ' + commandName)
        console.log('Incoming argument: ' + commandArgument)
        if (!commandName || commandName.length == 0 || !commands[commandName.toLowerCase()]) {
            ctx.reply('Не понял');
        } else {
            var result = await commands[commandName.toLowerCase()](commandArgument, collectedMembers);
            if (typeof result === 'string') {
                ctx.reply(result);
            }
        }
        isResponsing = false;
      });

    bot.launch();
    setInterval(() => console.log('Bot is online'), 100000);
}

function getLocalCollectedMembers(): Array<string>{
    var savedMembers = localStorage.getItem(collectedMembersLocalStorageKey);
    if (savedMembers) {
        console.log('Got members from local');
        return JSON.parse(savedMembers);
    }
    return new Array<string>;
}

async function getCityCoordinates(cityName?: string): Promise<string> {
    if(!cityName || cityName.length === 0) {
        return 'А город я угадать должен?';
    }
    var response = await geocoder.getCityCoordinates(cityName);
    return response.success ? `Координаты места ${cityName}: широта ${response.latitude}, долгота ${response.longitude}` : (response.errorMessage ?? 'Незахендленный ерор. Еблан керик хуйни накодил.');
}

async function getCurrentWeather(cityName?: string): Promise<string> {
    if(!cityName || cityName.length === 0) {
        return 'где именно то'
    }
    var geocodingResult = await geocoder.getCityCoordinates(cityName);
    if (!geocodingResult.success ) {
        return geocodingResult.errorMessage ??  'Незахендленный ерор. Еблан керик хуйни накодил.';
    }
    var currentWeather = await weatherClient.getCurrentWeather(geocodingResult, cityName);
    return currentWeather;
}

type Commands = {
    [index: string]:  (commandArgument?: string, members?: Array<string>) => any; 
}


