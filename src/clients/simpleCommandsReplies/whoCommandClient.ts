import { Update } from "@telegraf/types";
import { GetReplyArgs } from "../baseCommandClient.js";
import { BaseSimpleCommandClient } from "./baseSimpleCommandClient.js";

const preludes = [
    'Я думаю что это',
    'По моему мнению это',
    'Однозначно, это',
    'Я считаю, это',
    'Конечно же это',
    'Все знают, что это',
    'Единственный верный вариант - это',
    'Без базара, это',
    'Ну я выбираю', 
    'Тут стопудово: это',
    'Олег Евгеньевич официально выбирает вариант:'
];

class WhoCommandClient extends BaseSimpleCommandClient {
    preludes = preludes;
    triggerRegExp = /кто|кому|кого|кем/i;
    pretext = /^у|для|с|да|на/i;
    isMatch(commandName: string, commandArgument?: string | undefined): boolean {
        return this.triggerRegExp.test(this.pretext.test(commandName) ? (commandArgument?.split(' ')[0] ?? '')  : commandName);
    }

    getReply(args: GetReplyArgs<Update>) {
        if(!args.commandArgument || args.commandArgument.length == 0) {
            args.ctx?.reply('Ты!');
            return;
        }
        if ((args.members?.length ?? 0) < 3) {
            args.ctx?.reply('Я знаю еще слишком мало юзеров...Давайте знакомиться!');
            return;
        }
        const member = args.members![Math.floor(Math.random() * args.members!.length)];
        args.ctx?.reply(`${this.getRandomPrelude()} ${member}`);
    }
}


export { WhoCommandClient };